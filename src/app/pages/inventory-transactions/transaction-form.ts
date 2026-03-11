import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { PaginatedResponse, QueryParams } from '../../core/models/api.model';
import { InventoryTransaction, InventoryTransactionCreate, ItemType, TransactionItemCreate, TransactionType } from '../../core/models/inventory-transaction.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown';
import { InputComponent } from '../../shared/components/input/input';

interface FormItem {
  item_type: ItemType | '';
  item_id: number | null;
  quantity: number;
  itemOptions: DropdownOption[];
  itemPage: number;
  itemHasMore: boolean;
}

@Component({
  selector: 'app-transaction-form',
  imports: [FormsModule, InputComponent, ButtonComponent, DropdownComponent],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class TransactionFormComponent implements OnInit {
  saving = signal(false);
  errorMessage = signal('');

  transactionType: TransactionType | '' = '';
  transactionDate = '';
  notes = '';

  // Third party dropdown (for donation/prescription)
  thirdPartyOptions = signal<DropdownOption[]>([]);
  thirdPartyPage = 1;
  thirdPartyHasMore = signal(false);
  thirdPartyId: number | null = null;

  // Items
  items: FormItem[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.transactionDate = new Date().toISOString().split('T')[0];
    this.addItem();
  }

  get needsThirdParty(): boolean {
    return this.transactionType === 'donation' || this.transactionType === 'prescription';
  }

  get thirdPartyLabel(): string {
    if (this.transactionType === 'donation') return 'Donor Partner';
    if (this.transactionType === 'prescription') return 'Doctor';
    return 'Third Party';
  }

  onTransactionTypeChange(event: Event): void {
    this.transactionType = (event.target as HTMLSelectElement).value as TransactionType;
    this.thirdPartyId = null;
    this.thirdPartyOptions.set([]);
    this.thirdPartyPage = 1;
    if (this.needsThirdParty) {
      this.loadThirdParties();
    }
  }

  loadThirdParties(search?: string): void {
    let endpoint: string = API.THIRD_PARTIES;
    const params: QueryParams = { page: this.thirdPartyPage, size: 50 };

    if (this.transactionType === 'donation') {
      endpoint = API.PARTNERS;
      params['partner_type'] = 'donor';
    } else if (this.transactionType === 'prescription') {
      endpoint = API.DOCTORS;
    }

    if (search) params['search'] = search;

    this.api.getList<Record<string, unknown>>(endpoint, params).subscribe({
      next: (response) => {
        const options = response.items.map((item) => {
          const name = (item['third_party'] as Record<string, unknown>)?.['name'] || item['name'] || 'Unknown';
          const thirdPartyId = item['third_party_id'] as number;
          return { value: thirdPartyId, label: String(name) };
        });
        if (this.thirdPartyPage === 1) {
          this.thirdPartyOptions.set(options);
        } else {
          this.thirdPartyOptions.update((prev) => [...prev, ...options]);
        }
        this.thirdPartyHasMore.set(response.page * response.size < response.total);
      },
    });
  }

  onThirdPartyLoadMore(): void {
    this.thirdPartyPage++;
    this.loadThirdParties();
  }

  onThirdPartySearch(search: string): void {
    this.thirdPartyPage = 1;
    this.loadThirdParties(search);
  }

  // Items management
  addItem(): void {
    this.items.push({
      item_type: '',
      item_id: null,
      quantity: 1,
      itemOptions: [],
      itemPage: 1,
      itemHasMore: false,
    });
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  onItemTypeChange(index: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ItemType;
    this.items[index].item_type = value;
    this.items[index].item_id = null;
    this.items[index].itemOptions = [];
    this.items[index].itemPage = 1;
    if (value) {
      this.loadItemOptions(index);
    }
  }

  loadItemOptions(index: number, search?: string): void {
    const item = this.items[index];
    if (!item.item_type) return;

    const endpointMap: Record<string, string> = {
      medicine: API.MEDICINES,
      equipment: API.EQUIPMENT,
      medical_device: API.MEDICAL_DEVICES,
    };

    const endpoint = endpointMap[item.item_type];
    if (!endpoint) return;

    const params: QueryParams = { page: item.itemPage, size: 50 };
    if (search) params['search'] = search;

    this.api.getList<Record<string, unknown>>(endpoint, params).subscribe({
      next: (response) => {
        const options = response.items.map((i) => ({
          value: i['id'] as number,
          label: String(i['name'] || 'Unknown'),
        }));
        if (item.itemPage === 1) {
          item.itemOptions = options;
        } else {
          item.itemOptions = [...item.itemOptions, ...options];
        }
        item.itemHasMore = response.page * response.size < response.total;
      },
    });
  }

  onItemLoadMore(index: number): void {
    this.items[index].itemPage++;
    this.loadItemOptions(index);
  }

  onItemSearch(index: number, search: string): void {
    this.items[index].itemPage = 1;
    this.loadItemOptions(index, search);
  }

  onSubmit(): void {
    if (!this.transactionType) {
      this.errorMessage.set('Transaction type is required.');
      return;
    }

    if (!this.transactionDate) {
      this.errorMessage.set('Transaction date is required.');
      return;
    }

    if (this.needsThirdParty && !this.thirdPartyId) {
      this.errorMessage.set(`${this.thirdPartyLabel} is required for ${this.transactionType} transactions.`);
      return;
    }

    const validItems = this.items.filter((i) => i.item_type && i.item_id && i.quantity > 0);
    if (validItems.length === 0) {
      this.errorMessage.set('At least one item is required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const itemsPayload: TransactionItemCreate[] = validItems.map((i) => ({
      item_type: i.item_type as ItemType,
      item_id: i.item_id as number,
      quantity: i.quantity,
    }));

    const data: InventoryTransactionCreate = {
      transaction_type: this.transactionType as TransactionType,
      transaction_date: this.transactionDate,
      notes: this.notes || undefined,
      items: itemsPayload,
    };

    if (this.needsThirdParty && this.thirdPartyId) {
      data.third_party_id = this.thirdPartyId;
    }

    this.api.post<InventoryTransaction>(API.INVENTORY_TRANSACTIONS, data).subscribe({
      next: (transaction) => {
        this.saving.set(false);
        this.notification.success('Transaction created successfully.');
        this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS, transaction.id]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.detail || 'Failed to create transaction.');
      },
    });
  }

  cancel(): void {
    this.router.navigate([ROUTES.INVENTORY_TRANSACTIONS]);
  }
}

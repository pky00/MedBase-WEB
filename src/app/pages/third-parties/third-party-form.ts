import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { ThirdParty, ThirdPartyUpdate } from '../../core/models/third-party.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-third-party-form',
  imports: [FormsModule, InputComponent, ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './third-party-form.html',
  styleUrl: './third-party-form.scss',
})
export class ThirdPartyFormComponent implements OnInit {
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');

  thirdPartyId: number | null = null;
  name = '';
  phone = '';
  email = '';
  isActive = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.thirdPartyId = Number(id);
      this.loadThirdParty();
    }
  }

  loadThirdParty(): void {
    this.loading.set(true);
    this.api.get<ThirdParty>(`${API.THIRD_PARTIES}/${this.thirdPartyId}`).subscribe({
      next: (tp) => {
        this.name = tp.name;
        this.phone = tp.phone || '';
        this.email = tp.email || '';
        this.isActive = tp.is_active;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load third party.');
        this.router.navigate([ROUTES.THIRD_PARTIES]);
      },
    });
  }

  onSubmit(): void {
    if (!this.name) {
      this.errorMessage.set('Name is required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const data: ThirdPartyUpdate = {
      name: this.name,
      phone: this.phone || null,
      email: this.email || null,
      is_active: this.isActive,
    };

    this.api.put<ThirdParty>(`${API.THIRD_PARTIES}/${this.thirdPartyId}`, data).subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success('Third party updated successfully.');
        this.router.navigate([ROUTES.THIRD_PARTIES, this.thirdPartyId]);
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(error.error?.detail || 'Failed to update third party.');
      },
    });
  }

  onActiveChange(event: Event): void {
    this.isActive = (event.target as HTMLSelectElement).value === 'true';
  }

  cancel(): void {
    if (this.thirdPartyId) {
      this.router.navigate([ROUTES.THIRD_PARTIES, this.thirdPartyId]);
    } else {
      this.router.navigate([ROUTES.THIRD_PARTIES]);
    }
  }
}

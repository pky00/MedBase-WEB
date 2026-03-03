import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { Medicine } from '../../core/models/medicine.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-medicine-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './medicine-view.html',
  styleUrl: './medicine-view.scss',
})
export class MedicineViewComponent implements OnInit {
  medicine = signal<Medicine | null>(null);
  loading = signal(true);

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMedicine(Number(id));
    }
  }

  loadMedicine(id: number): void {
    this.loading.set(true);
    this.api.get<Medicine>(`${API.MEDICINES}/${id}`).subscribe({
      next: (medicine) => {
        this.medicine.set(medicine);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load medicine.');
        this.router.navigate([ROUTES.MEDICINES]);
      },
    });
  }

  editMedicine(): void {
    this.router.navigate([ROUTES.MEDICINES, this.medicine()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.MEDICINES]);
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { Equipment } from '../../core/models/equipment.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-equipment-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './equipment-view.html',
  styleUrl: './equipment-view.scss',
})
export class EquipmentViewComponent implements OnInit {
  equipment = signal<Equipment | null>(null);
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
      this.loadEquipment(Number(id));
    }
  }

  loadEquipment(id: number): void {
    this.loading.set(true);
    this.api.get<Equipment>(`${API.EQUIPMENT}/${id}`).subscribe({
      next: (equipment) => {
        this.equipment.set(equipment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load equipment.');
        this.router.navigate([ROUTES.EQUIPMENT]);
      },
    });
  }

  editEquipment(): void {
    this.router.navigate([ROUTES.EQUIPMENT, this.equipment()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.EQUIPMENT]);
  }
}

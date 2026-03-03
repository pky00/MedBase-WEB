import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { API, ROUTES } from '../../core/constants/app.constants';
import { MedicalDevice } from '../../core/models/medical-device.model';
import { ApiService } from '../../core/services/api';
import { NotificationService } from '../../core/services/notification';
import { ButtonComponent } from '../../shared/components/button/button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-device-view',
  imports: [ButtonComponent, LoadingSpinnerComponent],
  templateUrl: './device-view.html',
  styleUrl: './device-view.scss',
})
export class DeviceViewComponent implements OnInit {
  device = signal<MedicalDevice | null>(null);
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
      this.loadDevice(Number(id));
    }
  }

  loadDevice(id: number): void {
    this.loading.set(true);
    this.api.get<MedicalDevice>(`${API.MEDICAL_DEVICES}/${id}`).subscribe({
      next: (device) => {
        this.device.set(device);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load medical device.');
        this.router.navigate([ROUTES.MEDICAL_DEVICES]);
      },
    });
  }

  editDevice(): void {
    this.router.navigate([ROUTES.MEDICAL_DEVICES, this.device()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate([ROUTES.MEDICAL_DEVICES]);
  }
}

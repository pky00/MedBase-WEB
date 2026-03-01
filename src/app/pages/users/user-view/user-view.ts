import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api';
import { NotificationService } from '../../../core/services/notification';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-user-view',
  imports: [ButtonComponent],
  templateUrl: './user-view.html',
  styleUrl: './user-view.scss',
})
export class UserViewComponent implements OnInit {
  user = signal<User | null>(null);
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
      this.loadUser(Number(id));
    }
  }

  loadUser(id: number): void {
    this.loading.set(true);
    this.api.get<User>(`users/${id}`).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load user.');
        this.router.navigate(['/users']);
      },
    });
  }

  editUser(): void {
    this.router.navigate(['/users', this.user()?.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { SidebarComponent } from './sidebar';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: { isAdmin: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = { isAdmin: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include Users nav item for admin', () => {
    authService.isAdmin.mockReturnValue(true);
    const labels = component.navGroups
      .flatMap((g) => g.items)
      .map((i) => i.label);
    expect(labels).toContain('Users');
  });

  it('should not include Users nav item for non-admin', () => {
    authService.isAdmin.mockReturnValue(false);
    const labels = component.navGroups
      .flatMap((g) => g.items)
      .map((i) => i.label);
    expect(labels).not.toContain('Users');
  });

  it('should always include Dashboard and Third Parties', () => {
    authService.isAdmin.mockReturnValue(false);
    const labels = component.navGroups
      .flatMap((g) => g.items)
      .map((i) => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Third Parties');
  });

  it('should emit closeSidebar on nav click', () => {
    const spy = vi.fn();
    component.closeSidebar.subscribe(spy);

    component.onNavClick();
    expect(spy).toHaveBeenCalled();
  });
});

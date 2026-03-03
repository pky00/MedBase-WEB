import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a success notification', () => {
    service.success('Done');
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].type).toBe('success');
    expect(service.notifications()[0].message).toBe('Done');
  });

  it('should add an error notification', () => {
    service.error('Failed');
    expect(service.notifications()[0].type).toBe('error');
  });

  it('should add a warning notification', () => {
    service.warning('Careful');
    expect(service.notifications()[0].type).toBe('warning');
  });

  it('should add an info notification', () => {
    service.info('FYI');
    expect(service.notifications()[0].type).toBe('info');
  });

  it('should remove a notification by id', () => {
    service.success('First');
    service.error('Second');
    const id = service.notifications()[0].id;
    service.remove(id);
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].message).toBe('Second');
  });

  it('should auto-remove notification after 5 seconds', () => {
    vi.useFakeTimers();
    service.success('Temporary');
    expect(service.notifications().length).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(service.notifications().length).toBe(0);
    vi.useRealTimers();
  });

  it('should assign incrementing ids', () => {
    service.success('A');
    service.success('B');
    const ids = service.notifications().map((n) => n.id);
    expect(ids[1]).toBeGreaterThan(ids[0]);
  });
});

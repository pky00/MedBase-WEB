import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { StatisticsService } from './statistics';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatisticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch summary stats', () => {
    const mockData = {
      total_patients: 10,
      total_appointments: 20,
      total_inventory_items: 30,
      total_transactions: 40,
      total_partners: 5,
      total_doctors: 8,
      active_patients: 9,
      active_partners: 4,
      active_doctors: 7,
    };

    service.getSummary().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/statistics/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch appointment stats', () => {
    const mockData = {
      today_count: 5,
      upcoming_count: 12,
      by_status: [{ status: 'scheduled', count: 3 }],
      by_month: [{ month: '2026-03', count: 10 }],
      total_completed: 100,
      total_cancelled: 5,
    };

    service.getAppointmentStats().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/statistics/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch inventory stats', () => {
    const mockData = {
      total_items: 50,
      total_quantity: 500,
      low_stock_items: [{ item_type: 'medicine', item_id: 1, item_name: 'Aspirin', quantity: 2 }],
      items_by_type: [{ item_type: 'medicine', count: 20, total_quantity: 200 }],
    };

    service.getInventoryStats().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/statistics/inventory`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch transaction stats', () => {
    const mockData = {
      total_transactions: 100,
      by_type: [{ transaction_type: 'purchase', count: 30, total_items: 50 }],
      recent_transactions: [
        {
          id: 1,
          transaction_type: 'purchase',
          transaction_date: '2026-03-15',
          third_party_name: null,
          item_count: 3,
        },
      ],
    };

    service.getTransactionStats().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/statistics/transactions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});

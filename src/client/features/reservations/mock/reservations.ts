import type { Reservation } from '../types/reservation';

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-1001',
    billboardId: 'BB-101',
    billboardName: 'City Mall LED Billboard',
    billboardLocation: 'Beirut',
    billboardImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',

    startDate: '2026-08-01',
    endDate: '2026-08-31',

    totalAmount: 1200,

    status: 'running',

    createdAt: '2026-07-20',
  },
  {
    id: 'RES-1002',
    billboardId: 'BB-102',
    billboardName: 'Highway Digital Screen',
    billboardLocation: 'Sidon',
    billboardImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200',

    startDate: '2026-09-05',
    endDate: '2026-10-05',

    totalAmount: 950,

    status: 'approved',

    createdAt: '2026-07-23',
  },
  {
    id: 'RES-1003',
    billboardId: 'BB-103',
    billboardName: 'Airport Road Billboard',
    billboardLocation: 'Tyre',
    billboardImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200',

    startDate: '2026-07-05',
    endDate: '2026-08-05',

    totalAmount: 1800,

    status: 'completed',

    createdAt: '2026-06-28',
  },
  {
    id: 'RES-1004',
    billboardId: 'BB-104',
    billboardName: 'Downtown LED Display',
    billboardLocation: 'Beirut',
    billboardImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d?w=1200',

    startDate: '2026-10-10',
    endDate: '2026-11-10',

    totalAmount: 1500,

    status: 'pending',

    createdAt: '2026-07-27',
  },
];

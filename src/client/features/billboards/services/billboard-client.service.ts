import { apiRequest } from '@/client/lib/response-utils';
import type {
  CreateBillboardSchemaInput,
  UpdateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import type { BillboardQuerySchemaInput } from '@/shared/contracts/billboard/billboard-query.schema';
import type { UpsertDigitalSpecSchemaInput } from '@/shared/contracts/billboard/digital-spec.schema';
import type { UpdateAvailabilitySchemaInput } from '@/shared/contracts/billboard/availability.schema';

export const billboardClientService = {
  async create(payload: CreateBillboardSchemaInput) {
    return apiRequest('/api/v1/billboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async list(filters?: BillboardQuerySchemaInput) {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest(`/api/v1/billboards${query ? `?${query}` : ''}`, {
      method: 'GET',
      credentials: 'include',
    });
  },
  async get(billboardId: string) {
    return apiRequest(`/api/v1/billboards/${billboardId}`, {
      method: 'GET',
      credentials: 'include',
    });
  },
  async update(billboardId: string, payload: UpdateBillboardSchemaInput) {
    return apiRequest(`/api/v1/billboards/${billboardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async getDigitalSpec(billboardId: string) {
    return apiRequest(`/api/v1/billboards/${billboardId}/digital-spec`, {
      method: 'GET',
      credentials: 'include',
    });
  },
  async saveDigitalSpec(billboardId: string, payload: UpsertDigitalSpecSchemaInput) {
    return apiRequest(`/api/v1/billboards/${billboardId}/digital-spec`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },
  async updateAvailability(billboardId: string, payload: UpdateAvailabilitySchemaInput) {
    return apiRequest(`/api/v1/billboards/${billboardId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  },

  async delete(billboardId: string) {
    return apiRequest(`/api/v1/billboards/${billboardId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};

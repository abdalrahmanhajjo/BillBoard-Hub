import { parseResponse } from '@/client/lib/response-utils';
import type {
  CreateBillboardSchemaInput,
  UpdateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import type { BillboardQuerySchemaInput } from '@/shared/contracts/billboard/billboard-query.schema';
import type { UpsertDigitalSpecSchemaInput } from '@/shared/contracts/billboard/digital-spec.schema';
import type { UpdateAvailabilitySchemaInput } from '@/shared/contracts/billboard/availability.schema';

export const billboardClientService = {
  async create(payload: CreateBillboardSchemaInput) {
    const response = await fetch('/api/v1/billboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
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
    const response = await fetch(`/api/v1/billboards${query ? `?${query}` : ''}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async get(billboardId: string) {
    const response = await fetch(`/api/v1/billboards/${billboardId}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async update(billboardId: string, payload: UpdateBillboardSchemaInput) {
    const response = await fetch(`/api/v1/billboards/${billboardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
  async getDigitalSpec(billboardId: string) {
    const response = await fetch(`/api/v1/billboards/${billboardId}/digital-spec`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse(response);
  },
  async saveDigitalSpec(billboardId: string, payload: UpsertDigitalSpecSchemaInput) {
    const response = await fetch(`/api/v1/billboards/${billboardId}/digital-spec`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },
  async updateAvailability(billboardId: string, payload: UpdateAvailabilitySchemaInput) {
    const response = await fetch(`/api/v1/billboards/${billboardId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return parseResponse(response);
  },

  async delete(billboardId: string) {
    const response = await fetch(`/api/v1/billboards/${billboardId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    return parseResponse(response);
  },
};

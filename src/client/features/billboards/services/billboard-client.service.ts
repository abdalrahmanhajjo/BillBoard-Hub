import type {
  CreateBillboardSchemaInput,
  UpdateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import type { UpsertDigitalSpecSchemaInput } from '@/shared/contracts/billboard/digital-spec.schema';
import type { UpdateAvailabilitySchemaInput } from '@/shared/contracts/billboard/availability.schema';

async function parseResponse(response: Response) {
  const payload = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error ?? 'Request failed.',
      data: payload?.data,
    };
  }

  return {
    ok: payload?.ok ?? true,
    error: payload?.error,
    data: payload?.data,
  };
}

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

  async list() {
    const response = await fetch('/api/v1/billboards', {
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
      method: 'PUT',
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
};

'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/server/http/controller-utils';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import {
  updateAvailabilitySchema,
  type UpdateAvailabilitySchemaInput,
} from '@/shared/contracts/billboard/availability.schema';
import type { Billboard } from '@/shared/types/billboard';

type UpdateAvailabilityActionResult = { ok: true; data: Billboard } | { ok: false; error: string };

export async function updateAvailabilityAction(
  billboardId: string,
  payload: UpdateAvailabilitySchemaInput,
): Promise<UpdateAvailabilityActionResult> {
  const session = await requireSession();

  const parsed = updateAvailabilitySchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid availability status.',
    };
  }

  try {
    const billboard = await billboardService.updateAvailability(
      session.user,
      billboardId,
      parsed.data.status,
    );
    revalidatePath('/dashboard/admin/billboards');

    return { ok: true, data: billboard };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Updating availability failed.',
    };
  }
}

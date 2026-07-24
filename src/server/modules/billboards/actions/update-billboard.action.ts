'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/server/http/controller-utils';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import {
  updateBillboardSchema,
  type UpdateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import type { Billboard } from '@/shared/types/billboard';

type UpdateBillboardActionResult = { ok: true; data: Billboard } | { ok: false; error: string };

export async function updateBillboardAction(
  billboardId: string,
  payload: UpdateBillboardSchemaInput,
): Promise<UpdateBillboardActionResult> {
  const session = await requireSession();

  const parsed = updateBillboardSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid billboard data.',
    };
  }

  try {
    const billboard = await billboardService.update(session.user, billboardId, parsed.data);
    // Keep admin inventory and the public detail route fresh after an edit.
    revalidatePath('/dashboard/admin/billboards');
    revalidatePath(`/dashboard/admin/billboards/${billboardId}`);

    return { ok: true, data: billboard };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Billboard update failed.',
    };
  }
}

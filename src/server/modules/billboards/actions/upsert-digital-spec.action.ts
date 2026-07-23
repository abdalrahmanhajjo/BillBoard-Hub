'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/server/http/controller-utils';
import { digitalSpecService } from '@/server/modules/billboards/digital-spec.service';
import {
  upsertDigitalSpecSchema,
  type UpsertDigitalSpecSchemaInput,
} from '@/shared/contracts/billboard/digital-spec.schema';
import type { DigitalSpec } from '@/shared/types/billboard';

type UpsertDigitalSpecActionResult = { ok: true; data: DigitalSpec } | { ok: false; error: string };

export async function upsertDigitalSpecAction(
  billboardId: string,
  payload: UpsertDigitalSpecSchemaInput,
): Promise<UpsertDigitalSpecActionResult> {
  const session = await requireSession();

  const parsed = upsertDigitalSpecSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid digital specification data.',
    };
  }

  try {
    const spec = await digitalSpecService.upsertForBillboard(
      session.user,
      billboardId,
      parsed.data,
    );
    revalidatePath('/dashboard/admin/billboards');

    return { ok: true, data: spec };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Saving digital specification failed.',
    };
  }
}

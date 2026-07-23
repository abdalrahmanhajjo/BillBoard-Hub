'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/server/http/controller-utils';
import { billboardService } from '@/server/modules/billboards/billboard.service';
import {
  createBillboardSchema,
  type CreateBillboardSchemaInput,
} from '@/shared/contracts/billboard/billboard.schema';
import type { Billboard } from '@/shared/types/billboard';

type CreateBillboardActionResult = { ok: true; data: Billboard } | { ok: false; error: string };

export async function createBillboardAction(
  payload: CreateBillboardSchemaInput,
): Promise<CreateBillboardActionResult> {
  const session = await requireSession();

  const parsed = createBillboardSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid billboard data.',
    };
  }

  try {
    const billboard = await billboardService.create(parsed.data, session.user);
    revalidatePath('/dashboard/admin/billboards');

    return { ok: true, data: billboard };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Billboard creation failed.',
    };
  }
}

import { model, models, Schema, type InferSchemaType } from 'mongoose';
import { FINANCE_AUDIT_ACTIONS, FINANCE_AUDIT_ENTITIES } from '@/shared/constants/finance';
import type { FinanceAuditRecord } from '@/server/modules/finance/finance.types';

/**
 * Append-only history of every financial mutation.
 *
 * Financial records are the one place where "who changed this number, when, and
 * from what" has to survive the change itself, so edits are recorded here
 * rather than inferred from `updatedAt`. Nothing in the module updates or
 * deletes an audit row.
 */
const financeAuditSchema = new Schema<FinanceAuditRecord>(
  {
    entity: { type: String, enum: Object.values(FINANCE_AUDIT_ENTITIES), required: true },
    entityId: { type: String, required: true, index: true },
    action: { type: String, enum: Object.values(FINANCE_AUDIT_ACTIONS), required: true },
    actorId: { type: String, required: true, index: true },
    actorEmail: { type: String, trim: true },
    summary: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'finance_audit' },
);

financeAuditSchema.index({ createdAt: -1 });

export type FinanceAuditDocument = InferSchemaType<typeof financeAuditSchema> & {
  _id: string;
  createdAt?: Date;
};

export const FinanceAuditModel = models.FinanceAudit || model('FinanceAudit', financeAuditSchema);

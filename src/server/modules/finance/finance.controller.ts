import { apiResponse } from '@/server/http/api-response';
import { handleControllerError, validationMessage } from '@/server/http/controller-utils';
import { expenseService } from '@/server/modules/finance/expense.service';
import { financialReportService } from '@/server/modules/finance/financial-report.service';
import { ownerPaymentService, ownerService } from '@/server/modules/finance/owner.service';
import { financeAuditRepository } from '@/server/modules/finance/finance.repository';
import { toAuditEntry } from '@/server/modules/finance/finance.utils';
import {
  createExpenseSchema,
  listExpensesSchema,
  updateExpenseSchema,
  type CreateExpenseSchemaInput,
  type ListExpensesSchemaInput,
  type UpdateExpenseSchemaInput,
} from '@/shared/contracts/finance/expense.schema';
import {
  createOwnerPaymentSchema,
  createOwnerSchema,
  settleOwnerPaymentSchema,
  updateOwnerSchema,
  type CreateOwnerPaymentSchemaInput,
  type CreateOwnerSchemaInput,
  type SettleOwnerPaymentSchemaInput,
  type UpdateOwnerSchemaInput,
} from '@/shared/contracts/finance/owner.schema';
import { authorizationPolicy } from '@/shared/policies';
import type { User } from '@/shared/types/user';

export const financeController = {
  async createExpense(payload: CreateExpenseSchemaInput, actor: User) {
    const parsed = createExpenseSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid expense.'));
    }

    try {
      const expense = await expenseService.create(parsed.data, actor);
      return apiResponse.ok({ expense }, 201);
    } catch (error) {
      return handleControllerError(error, 'We could not record this expense.');
    }
  },

  async listExpenses(query: ListExpensesSchemaInput, actor: User) {
    const parsed = listExpensesSchema.safeParse(query);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid filter.'));
    }

    try {
      const expenses = await expenseService.list(parsed.data, actor);
      return apiResponse.ok({ expenses });
    } catch (error) {
      return handleControllerError(error, 'We could not load expenses.');
    }
  },

  async getExpense(expenseId: string, actor: User) {
    if (!expenseId) return apiResponse.badRequest('Expense id is required.');

    try {
      const expense = await expenseService.getById(expenseId, actor);
      return apiResponse.ok({ expense });
    } catch (error) {
      return handleControllerError(error, 'We could not load this expense.');
    }
  },

  async updateExpense(expenseId: string, payload: UpdateExpenseSchemaInput, actor: User) {
    if (!expenseId) return apiResponse.badRequest('Expense id is required.');

    const parsed = updateExpenseSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid expense.'));
    }

    try {
      const expense = await expenseService.update(expenseId, parsed.data, actor);
      return apiResponse.ok({ expense });
    } catch (error) {
      return handleControllerError(error, 'We could not update this expense.');
    }
  },

  async deleteExpense(expenseId: string, actor: User) {
    if (!expenseId) return apiResponse.badRequest('Expense id is required.');

    try {
      await expenseService.remove(expenseId, actor);
      return apiResponse.success();
    } catch (error) {
      return handleControllerError(error, 'We could not delete this expense.');
    }
  },

  async createOwner(payload: CreateOwnerSchemaInput, actor: User) {
    const parsed = createOwnerSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid owner.'));
    }

    try {
      const owner = await ownerService.create(parsed.data, actor);
      return apiResponse.ok({ owner }, 201);
    } catch (error) {
      return handleControllerError(error, 'We could not add this owner.');
    }
  },

  async listOwners(actor: User) {
    try {
      const owners = await ownerService.list(actor);
      return apiResponse.ok({ owners });
    } catch (error) {
      return handleControllerError(error, 'We could not load billboard owners.');
    }
  },

  async updateOwner(ownerId: string, payload: UpdateOwnerSchemaInput, actor: User) {
    if (!ownerId) return apiResponse.badRequest('Owner id is required.');

    const parsed = updateOwnerSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid owner.'));
    }

    try {
      const owner = await ownerService.update(ownerId, parsed.data, actor);
      return apiResponse.ok({ owner });
    } catch (error) {
      return handleControllerError(error, 'We could not update this owner.');
    }
  },

  async deleteOwner(ownerId: string, actor: User) {
    if (!ownerId) return apiResponse.badRequest('Owner id is required.');

    try {
      await ownerService.remove(ownerId, actor);
      return apiResponse.success();
    } catch (error) {
      return handleControllerError(error, 'We could not delete this owner.');
    }
  },

  async createOwnerPayment(payload: CreateOwnerPaymentSchemaInput, actor: User) {
    const parsed = createOwnerPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid payment.'));
    }

    try {
      const payment = await ownerPaymentService.create(parsed.data, actor);
      return apiResponse.ok({ payment }, 201);
    } catch (error) {
      return handleControllerError(error, 'We could not schedule this payment.');
    }
  },

  async listOwnerPayments(actor: User, ownerId?: string) {
    try {
      const payments = await ownerPaymentService.list(actor, ownerId ? { ownerId } : {});
      return apiResponse.ok({ payments });
    } catch (error) {
      return handleControllerError(error, 'We could not load payments.');
    }
  },

  async settleOwnerPayment(paymentId: string, payload: SettleOwnerPaymentSchemaInput, actor: User) {
    if (!paymentId) return apiResponse.badRequest('Payment id is required.');

    const parsed = settleOwnerPaymentSchema.safeParse(payload);
    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid payment.'));
    }

    try {
      const payment = await ownerPaymentService.settle(paymentId, parsed.data, actor);
      return apiResponse.ok({ payment });
    } catch (error) {
      return handleControllerError(error, 'We could not update this payment.');
    }
  },

  async deleteOwnerPayment(paymentId: string, actor: User) {
    if (!paymentId) return apiResponse.badRequest('Payment id is required.');

    try {
      await ownerPaymentService.remove(paymentId, actor);
      return apiResponse.success();
    } catch (error) {
      return handleControllerError(error, 'We could not delete this payment.');
    }
  },

  async overview(actor: User, range: { from?: string; to?: string }) {
    try {
      const overview = await financialReportService.overview(actor, range);
      return apiResponse.ok({ overview });
    } catch (error) {
      return handleControllerError(error, 'We could not build the financial overview.');
    }
  },

  async auditTrail(actor: User, entityId?: string) {
    try {
      authorizationPolicy.finance.assertCanView(actor);
      const documents = entityId
        ? await financeAuditRepository.findForEntity(entityId)
        : await financeAuditRepository.findRecent();
      return apiResponse.ok({ entries: documents.map(toAuditEntry) });
    } catch (error) {
      return handleControllerError(error, 'We could not load the audit trail.');
    }
  },
};

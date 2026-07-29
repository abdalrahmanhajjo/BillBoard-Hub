/**
 * Company-side finance: what running the billboard network costs.
 *
 * Deliberately separate from `booking.ts` and `payment.ts`, which model money
 * coming *in* from advertisers. Nothing here touches a reservation, an invoice,
 * or Stripe — mixing the two would make "revenue" and "expense" the same field
 * and destroy the profit calculation.
 */

/** Reporting currency. Every expense is converted to this for aggregation. */
export const FINANCE_BASE_CURRENCY = 'USD';

export const FINANCE_CURRENCIES = ['USD', 'EUR', 'LBP'] as const;

export const EXPENSE_CATEGORY_GROUPS = {
  BILLBOARD: 'billboard',
  GOVERNMENT: 'government',
  BUSINESS: 'business',
} as const;

/**
 * Seeded categories. `group` drives report roll-ups; admins may add their own
 * categories, which are stored per-record and grouped under `business` unless
 * they choose otherwise.
 */
export const EXPENSE_CATEGORIES = {
  // Billboard costs
  LOCATION_RENT: 'location_rent',
  OWNER_PAYMENT: 'owner_payment',
  INSTALLATION: 'installation',
  MAINTENANCE: 'maintenance',
  ELECTRICITY: 'electricity',
  INTERNET: 'internet',
  HARDWARE_REPLACEMENT: 'hardware_replacement',

  // Government costs
  MUNICIPALITY_FEES: 'municipality_fees',
  ROAD_PERMIT: 'road_permit',
  LICENSE_FEES: 'license_fees',
  TAXES: 'taxes',

  // Business costs
  EMPLOYEE_PAYMENTS: 'employee_payments',
  MARKETING: 'marketing',
  SOFTWARE_SUBSCRIPTIONS: 'software_subscriptions',
  OTHER_OPERATIONS: 'other_operations',
} as const;

export const EXPENSE_CATEGORY_GROUP_OF: Record<string, string> = {
  [EXPENSE_CATEGORIES.LOCATION_RENT]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.OWNER_PAYMENT]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.INSTALLATION]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.MAINTENANCE]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.ELECTRICITY]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.INTERNET]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.HARDWARE_REPLACEMENT]: EXPENSE_CATEGORY_GROUPS.BILLBOARD,
  [EXPENSE_CATEGORIES.MUNICIPALITY_FEES]: EXPENSE_CATEGORY_GROUPS.GOVERNMENT,
  [EXPENSE_CATEGORIES.ROAD_PERMIT]: EXPENSE_CATEGORY_GROUPS.GOVERNMENT,
  [EXPENSE_CATEGORIES.LICENSE_FEES]: EXPENSE_CATEGORY_GROUPS.GOVERNMENT,
  [EXPENSE_CATEGORIES.TAXES]: EXPENSE_CATEGORY_GROUPS.GOVERNMENT,
  [EXPENSE_CATEGORIES.EMPLOYEE_PAYMENTS]: EXPENSE_CATEGORY_GROUPS.BUSINESS,
  [EXPENSE_CATEGORIES.MARKETING]: EXPENSE_CATEGORY_GROUPS.BUSINESS,
  [EXPENSE_CATEGORIES.SOFTWARE_SUBSCRIPTIONS]: EXPENSE_CATEGORY_GROUPS.BUSINESS,
  [EXPENSE_CATEGORIES.OTHER_OPERATIONS]: EXPENSE_CATEGORY_GROUPS.BUSINESS,
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  [EXPENSE_CATEGORIES.LOCATION_RENT]: 'Location rent',
  [EXPENSE_CATEGORIES.OWNER_PAYMENT]: 'Billboard owner payment',
  [EXPENSE_CATEGORIES.INSTALLATION]: 'Installation',
  [EXPENSE_CATEGORIES.MAINTENANCE]: 'Maintenance',
  [EXPENSE_CATEGORIES.ELECTRICITY]: 'Electricity',
  [EXPENSE_CATEGORIES.INTERNET]: 'Internet',
  [EXPENSE_CATEGORIES.HARDWARE_REPLACEMENT]: 'Hardware replacement',
  [EXPENSE_CATEGORIES.MUNICIPALITY_FEES]: 'Municipality fees',
  [EXPENSE_CATEGORIES.ROAD_PERMIT]: 'Road permit',
  [EXPENSE_CATEGORIES.LICENSE_FEES]: 'License fees',
  [EXPENSE_CATEGORIES.TAXES]: 'Taxes',
  [EXPENSE_CATEGORIES.EMPLOYEE_PAYMENTS]: 'Employee payments',
  [EXPENSE_CATEGORIES.MARKETING]: 'Marketing',
  [EXPENSE_CATEGORIES.SOFTWARE_SUBSCRIPTIONS]: 'Software subscriptions',
  [EXPENSE_CATEGORIES.OTHER_OPERATIONS]: 'Other operations',
};

export const EXPENSE_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

/** Company-side payment rails. Distinct from advertiser `PAYMENT_METHODS`. */
export const EXPENSE_PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  CHEQUE: 'cheque',
  OTHER: 'other',
} as const;

export const PAYMENT_RECORD_TYPES = {
  EXPENSE: 'expense',
  OWNER_PAYMENT: 'owner_payment',
  VENDOR_PAYMENT: 'vendor_payment',
} as const;

/** How often a recurring obligation falls due, used to annualise costs. */
export const EXPENSE_RECURRENCES = {
  ONE_OFF: 'one_off',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const;

/** Multiplier from one occurrence to a monthly-equivalent cost. */
export const RECURRENCE_MONTHLY_FACTOR: Record<string, number> = {
  [EXPENSE_RECURRENCES.ONE_OFF]: 0,
  [EXPENSE_RECURRENCES.MONTHLY]: 1,
  [EXPENSE_RECURRENCES.QUARTERLY]: 1 / 3,
  [EXPENSE_RECURRENCES.YEARLY]: 1 / 12,
};

export const OWNER_PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export const FINANCE_AUDIT_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed',
} as const;

export const FINANCE_AUDIT_ENTITIES = {
  EXPENSE: 'expense',
  OWNER: 'owner',
  OWNER_PAYMENT: 'owner_payment',
} as const;

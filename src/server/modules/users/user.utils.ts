import { UserDocument } from './user.model';
import type { AdvertiserBookingActivityRow } from '@/server/modules/bookings/booking.types';
import type { CampaignOwnerActivityRow } from '@/server/modules/campaigns/campaign.types';
import type { Advertiser } from '@/shared/types/advertiser';
import type {
  AdvertiserDirectory,
  AdvertiserDirectoryEntry,
  CurrencyTotal,
} from '@/shared/types/advertiser-directory';
import type { UserDirectory, UserDirectoryEntry } from '@/shared/types/user-directory';
import type { User } from '@/shared/types/user';
import { USER_ROLES } from '@/shared/constants/user-roles';

function toUser(user: UserDocument): User {
  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive || false,
  };
}

function toIsoString(value: Date | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Drops zero rows so a currency only appears once it carries a real amount. */
function toCurrencyTotals(totals: Array<{ currency: string; amount: number }>): CurrencyTotal[] {
  return totals
    .filter((total) => total.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((total) => ({ currency: total.currency, amount: total.amount }));
}

function mergeCurrencyTotals(entries: CurrencyTotal[][]): CurrencyTotal[] {
  const merged = new Map<string, number>();

  for (const totals of entries) {
    for (const total of totals) {
      merged.set(total.currency, (merged.get(total.currency) ?? 0) + total.amount);
    }
  }

  return toCurrencyTotals([...merged].map(([currency, amount]) => ({ currency, amount })));
}

/** The later of the given timestamps, ignoring the ones that are missing. */
function latestOf(...values: Array<string | null>): string | null {
  return (
    values
      .filter((value): value is string => value !== null)
      .sort()
      .at(-1) ?? null
  );
}

/**
 * Joins advertiser accounts to their company profile and their reservation and
 * campaign activity.
 *
 * An advertiser with no activity still belongs in the directory — that is
 * exactly the account an admin needs to notice — so the activity rows are
 * optional and fall back to zeroed counts. Company details prefer the profile
 * and fall back to the latest reservation, because accounts created before
 * profiles existed only have the booking-side copy.
 */
function toAdvertiserDirectory(
  advertisers: UserDocument[],
  profilesByUserId: Map<string, Advertiser>,
  bookingActivity: AdvertiserBookingActivityRow[],
  campaignActivity: CampaignOwnerActivityRow[],
): AdvertiserDirectory {
  const bookingsById = new Map(bookingActivity.map((row) => [String(row._id), row]));
  const campaignsById = new Map(campaignActivity.map((row) => [String(row._id), row]));

  const entries: AdvertiserDirectoryEntry[] = advertisers.map((advertiser) => {
    const id = String(advertiser._id);
    const profile = profilesByUserId.get(id);
    const bookings = bookingsById.get(id);
    const campaigns = campaignsById.get(id);

    return {
      id,
      firstName: advertiser.firstName,
      lastName: advertiser.lastName,
      email: advertiser.email,
      isActive: advertiser.isActive || false,
      joinedAt: toIsoString(advertiser.createdAt),
      companyName: profile?.companyName ?? bookings?.companyName ?? null,
      phone: profile?.phone ?? bookings?.phone ?? null,
      address: profile?.address ?? null,
      country: bookings?.country ?? null,
      campaigns: {
        total: campaigns?.total ?? 0,
        active: campaigns?.active ?? 0,
      },
      bookings: {
        total: bookings?.total ?? 0,
        pending: bookings?.pending ?? 0,
        active: bookings?.active ?? 0,
      },
      spend: toCurrencyTotals(bookings?.spend ?? []),
      outstanding: toCurrencyTotals(bookings?.outstanding ?? []),
      lastActivityAt: latestOf(
        toIsoString(bookings?.lastBookingAt),
        toIsoString(campaigns?.lastCampaignAt),
      ),
    };
  });

  return {
    advertisers: entries,
    summary: {
      total: entries.length,
      active: entries.filter((entry) => entry.isActive).length,
      inactive: entries.filter((entry) => !entry.isActive).length,
      engaged: entries.filter((entry) => entry.bookings.total > 0).length,
      spend: mergeCurrencyTotals(entries.map((entry) => entry.spend)),
    },
  };
}

/** Joins every account to its advertiser profile, where one exists. */
function toUserDirectory(
  users: UserDocument[],
  profilesByUserId: Map<string, Advertiser>,
): UserDirectory {
  const entries: UserDirectoryEntry[] = users.map((user) => {
    const id = String(user._id);

    return {
      id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive || false,
      joinedAt: toIsoString(user.createdAt),
      updatedAt: toIsoString(user.updatedAt),
      companyName: profilesByUserId.get(id)?.companyName ?? null,
    };
  });

  return {
    users: entries,
    summary: {
      total: entries.length,
      admins: entries.filter((entry) => entry.role === USER_ROLES.ADMIN).length,
      advertisers: entries.filter((entry) => entry.role === USER_ROLES.ADVERTISER).length,
      active: entries.filter((entry) => entry.isActive).length,
      inactive: entries.filter((entry) => !entry.isActive).length,
    },
  };
}

export { toAdvertiserDirectory, toUser, toUserDirectory };

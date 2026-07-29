import { beforeEach, describe, expect, it, vi } from 'vitest';
import { USER_ROLES } from '@/shared/constants/user-roles';
import { BadRequestError, ConflictError, ForbiddenError } from '@/shared/http/http-error';
import type { User } from '@/shared/types/user';

const findById = vi.fn();
const updateById = vi.fn();
const countActiveByRoleExcluding = vi.fn();

vi.mock('@/server/modules/users/user.repository', () => ({
  USER_LIST_LIMIT: 500,
  userRepository: {
    findById: (...args: unknown[]) => findById(...args),
    updateById: (...args: unknown[]) => updateById(...args),
    countActiveByRoleExcluding: (...args: unknown[]) => countActiveByRoleExcluding(...args),
  },
}));

// Pulled in transitively by the service; irrelevant to the access guards.
vi.mock('@/server/modules/advertiser/advertiser.service', () => ({ advertiserService: {} }));
vi.mock('@/server/modules/bookings/booking.repository', () => ({ bookingRepository: {} }));
vi.mock('@/server/modules/campaigns/campaign.repository', () => ({ campaignRepository: {} }));

const { userService } = await import('@/server/modules/users/user.service');

function makeUser(id: string, role: User['role'], isActive = true): User {
  return { id, role, email: `${id}@test.com`, firstName: 'Test', lastName: 'User', isActive };
}

const admin = makeUser('admin-1', USER_ROLES.ADMIN);
const otherAdmin = makeUser('admin-2', USER_ROLES.ADMIN);
const advertiser = makeUser('advertiser-1', USER_ROLES.ADVERTISER);

/** What `userRepository.findById` returns: a document, not a domain user. */
function adminDoc(id: string, isActive = true) {
  return {
    _id: id,
    role: USER_ROLES.ADMIN,
    isActive,
    email: `${id}@test.com`,
    firstName: 'Test',
    lastName: 'Admin',
  };
}

function advertiserDoc(id: string) {
  return {
    _id: id,
    role: USER_ROLES.ADVERTISER,
    isActive: true,
    email: `${id}@test.com`,
    firstName: 'Test',
    lastName: 'Advertiser',
  };
}

describe('userService.updateAccessById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateById.mockImplementation((id: string, data: Record<string, unknown>) => ({
      ...advertiserDoc(id),
      ...data,
    }));
  });

  it('refuses an advertiser actor outright', async () => {
    await expect(
      userService.updateAccessById(otherAdmin.id, { role: USER_ROLES.ADVERTISER }, advertiser),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(updateById).not.toHaveBeenCalled();
  });

  it('refuses an admin changing their own access (self-lockout guard)', async () => {
    await expect(
      userService.updateAccessById(admin.id, { isActive: false }, admin),
    ).rejects.toBeInstanceOf(BadRequestError);

    expect(updateById).not.toHaveBeenCalled();
  });

  it('refuses demoting the last active administrator', async () => {
    findById.mockResolvedValue(adminDoc(otherAdmin.id));
    countActiveByRoleExcluding.mockResolvedValue(0);

    await expect(
      userService.updateAccessById(otherAdmin.id, { role: USER_ROLES.ADVERTISER }, admin),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(updateById).not.toHaveBeenCalled();
  });

  it('refuses deactivating the last active administrator', async () => {
    findById.mockResolvedValue(adminDoc(otherAdmin.id));
    countActiveByRoleExcluding.mockResolvedValue(0);

    await expect(
      userService.updateAccessById(otherAdmin.id, { isActive: false }, admin),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('allows demoting an admin while another active admin remains', async () => {
    findById.mockResolvedValue(adminDoc(otherAdmin.id));
    countActiveByRoleExcluding.mockResolvedValue(1);
    updateById.mockResolvedValue({ ...adminDoc(otherAdmin.id), role: USER_ROLES.ADVERTISER });

    const result = await userService.updateAccessById(
      otherAdmin.id,
      { role: USER_ROLES.ADVERTISER },
      admin,
    );

    expect(result?.role).toBe(USER_ROLES.ADVERTISER);
    expect(updateById).toHaveBeenCalledWith(otherAdmin.id, { role: USER_ROLES.ADVERTISER });
  });

  it('skips the last-admin count entirely when the target is not an admin', async () => {
    findById.mockResolvedValue(advertiserDoc(advertiser.id));

    await userService.updateAccessById(advertiser.id, { isActive: false }, admin);

    expect(countActiveByRoleExcluding).not.toHaveBeenCalled();
    expect(updateById).toHaveBeenCalledWith(advertiser.id, { isActive: false });
  });

  it('does not guard when an admin is being promoted or reactivated', async () => {
    findById.mockResolvedValue(adminDoc(otherAdmin.id, false));

    await userService.updateAccessById(otherAdmin.id, { isActive: true }, admin);

    expect(countActiveByRoleExcluding).not.toHaveBeenCalled();
    expect(updateById).toHaveBeenCalledWith(otherAdmin.id, { isActive: true });
  });

  it('returns null when the target account no longer exists', async () => {
    findById.mockResolvedValue(null);

    await expect(
      userService.updateAccessById('missing-id', { isActive: false }, admin),
    ).resolves.toBeNull();
  });
});

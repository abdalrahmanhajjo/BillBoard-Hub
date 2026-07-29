'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
} from 'lucide-react';
import { Button } from '@/client/ui/components/ui/button';
import {
  EmptyState,
  StatCard,
  WorkspacePage,
} from '@/client/features/dashboard/components/workspace-page';
import { ListToolbar } from '@/client/features/dashboard/components/list-toolbar';
import { buildCsv, downloadCsv } from '@/client/features/dashboard/utils/csv-export';
import { formatDate } from '@/client/features/dashboard/utils/advertiser-metrics';
import {
  useUpdateUserAccess,
  useUserDirectory,
} from '@/client/features/users/hooks/use-user-directory';
import { USER_ROLES } from '@/shared/constants/user-roles';
import type { UserDirectoryEntry } from '@/shared/types/user-directory';
import type { UserRole } from '@/shared/types/user';

type RoleFilter = 'all' | UserRole;
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'joined-desc' | 'joined-asc' | 'name-asc' | 'role-asc';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  advertiser: 'Advertiser',
};

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'border-violet-200 bg-violet-50 text-violet-700',
  advertiser: 'border-sky-200 bg-sky-50 text-sky-700',
};

function fullName(entry: UserDirectoryEntry): string {
  return `${entry.firstName} ${entry.lastName}`.trim();
}

const SORTERS: Record<SortKey, (a: UserDirectoryEntry, b: UserDirectoryEntry) => number> = {
  'joined-desc': (a, b) => (b.joinedAt ?? '').localeCompare(a.joinedAt ?? ''),
  'joined-asc': (a, b) => (a.joinedAt ?? '').localeCompare(b.joinedAt ?? ''),
  'name-asc': (a, b) => fullName(a).localeCompare(fullName(b)),
  'role-asc': (a, b) => a.role.localeCompare(b.role) || fullName(a).localeCompare(fullName(b)),
};

export function AdminUsersFeaturePage() {
  const { data: session } = useSession();
  const { data, isLoading, isError, error, refetch, isFetching } = useUserDirectory();
  const updateAccess = useUpdateUserAccess();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('joined-desc');

  const allUsers = data?.users ?? [];
  const summary = data?.summary;
  const currentUserId = session?.user?.id;

  // Left unmemoized on purpose: React Compiler handles this, and a manual
  // useMemo here is one it cannot preserve.
  const searchTerm = search.trim().toLowerCase();
  const users = allUsers
    .filter((entry) => {
      if (roleFilter !== 'all' && entry.role !== roleFilter) return false;
      if (statusFilter === 'active' && !entry.isActive) return false;
      if (statusFilter === 'inactive' && entry.isActive) return false;
      if (!searchTerm) return true;
      return [fullName(entry), entry.email, entry.companyName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(searchTerm);
    })
    .sort(SORTERS[sortKey]);

  /**
   * The server enforces both rules regardless; mirroring them here keeps the UI
   * from offering a control that is guaranteed to fail.
   */
  const activeAdmins = allUsers.filter(
    (entry) => entry.role === USER_ROLES.ADMIN && entry.isActive,
  ).length;

  const lockReasonFor = (entry: UserDirectoryEntry): string | null => {
    if (entry.id === currentUserId) {
      return 'You cannot change your own access.';
    }
    if (entry.role === USER_ROLES.ADMIN && entry.isActive && activeAdmins <= 1) {
      return 'This is the last active administrator.';
    }
    return null;
  };

  const handleExport = () => {
    const csv = buildCsv(users, [
      { header: 'Name', value: (entry) => fullName(entry) },
      { header: 'Email', value: (entry) => entry.email },
      { header: 'Role', value: (entry) => entry.role },
      { header: 'Company', value: (entry) => entry.companyName ?? '' },
      { header: 'Status', value: (entry) => (entry.isActive ? 'active' : 'deactivated') },
      { header: 'Joined', value: (entry) => entry.joinedAt ?? '' },
      { header: 'Last updated', value: (entry) => entry.updatedAt ?? '' },
    ]);

    downloadCsv(`boardly-users-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  // A failed role change matters more than a stale load error, so it wins.
  const activeError = updateAccess.error ?? (isError ? error : null);
  const errorMessage =
    activeError instanceof Error ? activeError.message : 'Unknown directory error.';

  return (
    <WorkspacePage
      title="Users"
      description="Every account on the platform. Change a role or deactivate access without deleting the record."
      actions={
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
          Refresh
        </Button>
      }
    >
      {activeError ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/8 text-destructive mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading users...
        </div>
      ) : allUsers.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No user accounts"
          description="Accounts appear here as soon as someone registers or is created by an administrator."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={UserRound}
              label="Accounts"
              value={String(summary?.total ?? 0)}
              hint={`${summary?.active ?? 0} active`}
            />
            <StatCard
              icon={ShieldCheck}
              label="Administrators"
              value={String(summary?.admins ?? 0)}
              hint="Full platform access"
            />
            <StatCard
              icon={UserCheck}
              label="Advertisers"
              value={String(summary?.advertisers ?? 0)}
              hint="Book and run campaigns"
            />
            <StatCard
              icon={UserX}
              label="Deactivated"
              value={String(summary?.inactive ?? 0)}
              hint="Cannot sign in"
            />
          </div>

          <div>
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search name, email, or company"
              summary={`${users.length} of ${allUsers.length}`}
              onExport={users.length > 0 ? handleExport : undefined}
              filters={[
                {
                  id: 'user-role-filter',
                  label: 'Role',
                  value: roleFilter,
                  onChange: (value) => setRoleFilter(value as RoleFilter),
                  options: [
                    { value: 'all', label: 'All' },
                    ...Object.values(USER_ROLES).map((role) => ({
                      value: role,
                      label: ROLE_LABELS[role],
                    })),
                  ],
                },
                {
                  id: 'user-status-filter',
                  label: 'Status',
                  value: statusFilter,
                  onChange: (value) => setStatusFilter(value as StatusFilter),
                  options: [
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Deactivated' },
                  ],
                },
                {
                  id: 'user-sort',
                  label: 'Sort by',
                  value: sortKey,
                  onChange: (value) => setSortKey(value as SortKey),
                  options: [
                    { value: 'joined-desc', label: 'Newest first' },
                    { value: 'joined-asc', label: 'Oldest first' },
                    { value: 'name-asc', label: 'Name A–Z' },
                    { value: 'role-asc', label: 'Role' },
                  ],
                },
              ]}
            />

            {users.length === 0 ? (
              <EmptyState
                icon={UserRound}
                title="No users match those filters"
                description="Try a different search term, role, or status."
              />
            ) : (
              <div className="bg-card overflow-hidden rounded-xl border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-3xl text-sm">
                    <thead className="bg-muted/50 text-muted-foreground text-left text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((entry) => (
                        <UserRow
                          key={entry.id}
                          entry={entry}
                          lockReason={lockReasonFor(entry)}
                          pendingId={
                            updateAccess.isPending ? updateAccess.variables?.userId : undefined
                          }
                          onChangeRole={(role) =>
                            updateAccess.mutate({ userId: entry.id, input: { role } })
                          }
                          onToggleActive={() =>
                            updateAccess.mutate({
                              userId: entry.id,
                              input: { isActive: !entry.isActive },
                            })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Deactivating an account blocks sign-in but keeps its campaigns, reservations, and
            invoices intact. You cannot change your own access, and the last active administrator
            cannot be demoted or deactivated.
          </p>
        </div>
      )}
    </WorkspacePage>
  );
}

type UserRowProps = {
  entry: UserDirectoryEntry;
  /** Why this row's controls are disabled, or null when they are available. */
  lockReason: string | null;
  pendingId?: string;
  onChangeRole: (role: UserRole) => void;
  onToggleActive: () => void;
};

function UserRow({ entry, lockReason, pendingId, onChangeRole, onToggleActive }: UserRowProps) {
  const isPending = pendingId === entry.id;
  const isLocked = lockReason !== null || isPending;

  return (
    <tr>
      <td className="px-4 py-3">
        <span className="font-medium">{fullName(entry)}</span>
        <span className="text-muted-foreground block text-xs">{entry.email}</span>
        {entry.companyName ? (
          <span className="text-muted-foreground block text-xs">{entry.companyName}</span>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${ROLE_STYLES[entry.role]}`}
        >
          {ROLE_LABELS[entry.role]}
        </span>
      </td>
      <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
        {formatDate(entry.joinedAt ?? undefined)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
            entry.isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-zinc-200 bg-zinc-100 text-zinc-600'
          }`}
        >
          {entry.isActive ? 'Active' : 'Deactivated'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <label htmlFor={`user-role-${entry.id}`} className="sr-only">
            Role for {fullName(entry)}
          </label>
          <select
            id={`user-role-${entry.id}`}
            value={entry.role}
            disabled={isLocked}
            title={lockReason ?? undefined}
            onChange={(event) => onChangeRole(event.target.value as UserRole)}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border px-2 text-xs outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.values(USER_ROLES).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            className="h-9 text-xs"
            disabled={isLocked}
            title={lockReason ?? undefined}
            onClick={onToggleActive}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : entry.isActive ? (
              'Deactivate'
            ) : (
              'Activate'
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}

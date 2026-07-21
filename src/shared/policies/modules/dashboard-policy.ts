import type { UserRole } from "@/shared/types/user";
import { can } from "../policy-utils";
import { PERMISSIONS } from "@/shared/constants/permissions/permissions";

export const dashboardPolicy = {
  canAccessDashboard(role: UserRole, area: "admin" | "advertiser"): boolean {
    if (area === "admin") {
      return can(role, PERMISSIONS.DASHBOARD_ACCESS_ADMIN);
    }

    return can(role, PERMISSIONS.DASHBOARD_ACCESS_ADVERTISER);
  },
};

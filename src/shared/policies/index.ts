import { dashboardPolicy } from "./modules/dashboard-policy";
import { userPolicy } from "./modules/user-policy";


export const authorizationPolicy = {
  user: userPolicy,
  dashboard: dashboardPolicy,
};

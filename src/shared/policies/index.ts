import { billboardPolicy } from './modules/billboard-policy';
import { dashboardPolicy } from './modules/dashboard-policy';
import { campaignPolicy } from './modules/campaign-policy';
import { adCreativePolicy } from './modules/ad-creative-policy';
import { userPolicy } from './modules/user-policy';

export const authorizationPolicy = {
  user: userPolicy,
  dashboard: dashboardPolicy,
  billboard: billboardPolicy,
  campaign: campaignPolicy,
  adCreative: adCreativePolicy,
};

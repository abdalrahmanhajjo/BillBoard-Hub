import { adCreativePolicy } from './modules/ad-creative-policy';
import { billboardPolicy } from './modules/billboard-policy';
import { bookingPolicy } from './modules/booking-policy';
import { campaignPolicy } from './modules/campaign-policy';
import { creativePolicy } from './modules/creative-policy';
import { dashboardPolicy } from './modules/dashboard-policy';
import { impressionPolicy } from './modules/impression-policy';
import { playlistPolicy } from './modules/playlist-policy';
import { schedulePolicy } from './modules/schedule-policy';
import { userPolicy } from './modules/user-policy';
import { paymentPolicy } from './modules/payment-policy';

export const authorizationPolicy = {
  user: userPolicy,
  dashboard: dashboardPolicy,
  billboard: billboardPolicy,
  creative: creativePolicy,
  playlist: playlistPolicy,
  schedule: schedulePolicy,
  impression: impressionPolicy,
  booking: bookingPolicy,
  campaign: campaignPolicy,
  adCreative: adCreativePolicy,
  payment: paymentPolicy,
};

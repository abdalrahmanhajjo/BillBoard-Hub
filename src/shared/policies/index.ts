import { billboardPolicy } from './modules/billboard-policy';
import { advertiserProfilePolicy } from './modules/advertiser-profile-policy';

import { bookingPolicy } from './modules/booking-policy';
import { creativePolicy } from './modules/creative-policy';
import { dashboardPolicy } from './modules/dashboard-policy';
import { impressionPolicy } from './modules/impression-policy';
import { playlistPolicy } from './modules/playlist-policy';
import { schedulePolicy } from './modules/schedule-policy';
import { userPolicy } from './modules/user-policy';

export const authorizationPolicy = {
  user: userPolicy,
  advertiserProfile: advertiserProfilePolicy,
  dashboard: dashboardPolicy,
  billboard: billboardPolicy,
  creative: creativePolicy,
  playlist: playlistPolicy,
  schedule: schedulePolicy,
  impression: impressionPolicy,
  booking: bookingPolicy,
};

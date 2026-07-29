# Application routes

## Public and guest pages

| Route                                   | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `/`                                     | Marketing homepage                      |
| `/billboards`                           | Searchable public inventory             |
| `/billboards/{billboardId}`             | Billboard details and campaign calendar |
| `/billboards/{billboardId}/reservation` | Authenticated reservation checkout      |
| `/login`                                | Credentials login                       |
| `/register`                             | Advertiser registration                 |
| `/forgot-password`                      | Password recovery placeholder           |
| `/about`                                | Company overview                        |
| `/blog`                                 | Editorial landing page                  |
| `/guides`                               | Guides landing page                     |
| `/case-studies`                         | Case studies                            |
| `/solutions/brands`                     | Brand solutions                         |
| `/solutions/agencies`                   | Agency solutions                        |
| `/solutions/campaign-planning`          | Campaign planning                       |
| `/solutions/audience-targeting`         | Audience targeting                      |
| `/media-kit`                            | Media resources                         |
| `/help`                                 | Help content                            |
| `/partners`                             | Partner information                     |
| `/careers`                              | Careers                                 |
| `/press`                                | Press                                   |
| `/privacy`                              | Privacy policy                          |
| `/terms`                                | Terms                                   |
| `/cookies`                              | Cookie policy                           |

## Admin dashboard

| Route                                  | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `/user/admin/dashboard`                | Admin overview                             |
| `/user/admin/reports`                  | Reports area                               |
| `/user/admin/billboards`               | Inventory management                       |
| `/user/admin/billboards/create`        | Create inventory                           |
| `/user/admin/billboards/{billboardId}` | Billboard detail management                |
| `/user/admin/playlists`                | Playlist builder                           |
| `/user/admin/schedules`                | Screen scheduling                          |
| `/user/admin/playback`                 | Rotation preview                           |
| `/user/admin/campaigns`                | Campaign moderation                        |
| `/user/admin/bookings`                 | Reservation moderation                     |
| `/user/admin/impressions`              | Impression analytics                       |
| `/user/admin/advertisers`              | Advertiser directory with account activity |
| `/user/admin/users`                    | User area                                  |
| `/user/admin/settings`                 | Admin account and platform settings        |

## Advertiser dashboard

| Route                         | Purpose                 |
| ----------------------------- | ----------------------- |
| `/user/advertiser`            | Advertiser overview     |
| `/user/advertiser/reports`    | Delivery reports        |
| `/user/advertiser/billboards` | Authenticated inventory |
| `/user/advertiser/bookings`   | Owned reservations      |
| `/user/advertiser/creatives`  | Creative management     |
| `/user/advertiser/campaigns`  | Campaign area           |
| `/user/advertiser/invoices`   | Billing records         |
| `/user/advertiser/profile`    | Profile area            |
| `/user/advertiser/settings`   | Settings area           |

Both areas render the same `WorkspaceShell` sidebar frame — `AdminShell` and `AdvertiserShell` only
supply the nav groups and the area label. `/user` redirects to the correct role-specific dashboard.
`/unauthorized` is the role-denial destination.

## Route protection

- `src/proxy.ts` performs coarse dashboard cookie checks.
- Dashboard layouts verify the Auth.js session and role.
- Reservation checkout renders a sign-in prompt for guests and redirects to login when they try
  to continue.
- API authorization is documented in [API reference](api.md).

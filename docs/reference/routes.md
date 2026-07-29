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

| Route                                       | Purpose                     |
| ------------------------------------------- | --------------------------- |
| `/dashboard/admin`                          | Admin overview              |
| `/dashboard/admin/billboards`               | Inventory management        |
| `/dashboard/admin/billboards/create`        | Create inventory            |
| `/dashboard/admin/billboards/{billboardId}` | Billboard detail management |
| `/dashboard/admin/bookings`                 | Reservation moderation      |
| `/dashboard/admin/impressions`              | Impression analytics        |
| `/dashboard/admin/playlists`                | Playlist builder            |
| `/dashboard/admin/schedules`                | Screen scheduling           |
| `/dashboard/admin/playback`                 | Rotation preview            |
| `/dashboard/admin/users`                    | User area                   |
| `/dashboard/admin/advertisers`              | Advertiser area             |
| `/dashboard/admin/reports`                  | Reports area                |

## Advertiser dashboard

| Route                              | Purpose                 |
| ---------------------------------- | ----------------------- |
| `/dashboard/advertiser`            | Advertiser overview     |
| `/dashboard/advertiser/billboards` | Authenticated inventory |
| `/dashboard/advertiser/bookings`   | Owned reservations      |
| `/dashboard/advertiser/creatives`  | Creative management     |
| `/dashboard/advertiser/campaigns`  | Campaign area           |
| `/dashboard/advertiser/profile`    | Profile area            |
| `/dashboard/advertiser/settings`   | Settings area           |

`/dashboard` redirects to the correct role-specific dashboard. `/unauthorized` is the role-denial
destination.

## Route protection

- `src/proxy.ts` performs coarse dashboard cookie checks.
- Dashboard layouts verify the Auth.js session and role.
- Reservation checkout renders a sign-in prompt for guests and redirects to login when they try
  to continue.
- API authorization is documented in [API reference](api.md).

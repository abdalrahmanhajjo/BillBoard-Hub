# BillBoard Hub — Website Presentation Prep

**Scope:** the public-facing website only — everything a visitor or advertiser sees _before_ they enter a dashboard. Admin and advertiser workspaces (`/user/*`) are deliberately excluded.

**Assumed audience:** a mixed stakeholder/client demo — decision-makers who care about the product story, with at least one technical person in the room. Section 9 (Technical Highlights) and Section 10 (Q&A) cover the technical follow-ups; skip or keep them as backup depending on who shows up.

**Assumed length:** 20–25 minutes presenting + 10 minutes Q&A. Section 2 has a 10-minute cut.

---

## 1. The one-sentence pitch

> BillBoard Hub turns outdoor advertising in Lebanon from a phone-calls-and-spreadsheets business into a marketplace where a brand can discover a billboard, check real availability, price a campaign, and submit a reservation in a single session.

**The three claims everything else supports:**

1. **Verified, live inventory** — what you see is what exists, priced and dated.
2. **Transparent pricing** — the full cost is computed on screen before you commit, not quoted later by email.
3. **You are not charged until the dates are approved** — the card is verified and saved, never charged upfront.

Claim 3 is the strongest differentiator in the room. Lead with it if you only get one point.

---

## 2. Agenda & timing

| #   | Segment                                | Time   | Purpose                               |
| --- | -------------------------------------- | ------ | ------------------------------------- |
| 1   | The problem                            | 2 min  | Why OOH booking is broken today       |
| 2   | The solution + home page tour          | 4 min  | Establish the story visually          |
| 3   | **Live demo: discovery → reservation** | 10 min | The core of the presentation          |
| 4   | Content & SEO surface                  | 3 min  | Show it's a business, not a prototype |
| 5   | Trust, security & engineering          | 3 min  | Credibility                           |
| 6   | Roadmap & ask                          | 2 min  | Close                                 |
| —   | Q&A                                    | 10 min |                                       |

**10-minute cut:** Problem (1 min) → Demo, straight to `/billboards` (7 min) → Close (2 min). Drop the home tour, content pages, and engineering section entirely.

---

## 3. Narrative arc

Build the presentation on a single advertiser's journey. Give them a name and use it throughout — it keeps an abstract feature list concrete.

> **Rania** runs marketing for a Beirut coffee chain. She's launching a new store in Hamra and wants three weeks of outdoor presence. Today that means calling four media houses, waiting two days for availability, and getting a PDF quote she can't compare.

Then: _"Here's what that same afternoon looks like on BillBoard Hub."_

Every demo step below maps to a beat in Rania's story. Return to her name at each transition.

---

## 4. Pre-flight checklist

Run this **the day before**, not five minutes prior.

**Data**

- [ ] Database seeded with a realistic spread of billboards — at minimum 8–12 across 3+ cities, mixed static and digital. The home page stats (`placements`, `cities`) are computed live from inventory, so a thin database shows a thin number.
- [ ] At least one **digital** billboard with a complete digital spec (resolution, brightness, slot duration, loop) — this powers the digital spec showcase, which is the most visually impressive block on the site.
- [ ] Every demo billboard has real uploaded images. An empty gallery is the fastest way to lose the room.
- [ ] At least one billboard has approved bookings on known dates, so you can _show_ a date conflict being caught.

**Accounts**

- [ ] A clean advertiser account with a known password, already registered — so you can log in instantly if registration goes sideways.
- [ ] A second throwaway email ready for the live registration demo.

**Payments**

- [ ] Stripe in **test mode**. Confirm the publishable key is the test key.
- [ ] Test card memorized: `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.
- [ ] Verify a SetupIntent completes end-to-end once, the day before.

**Environment**

- [ ] `IMAGEKIT_PRIVATE_KEY`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` set — without them uploads return _"Image uploads are not configured."_
- [ ] Run against a production build (`pnpm build && pnpm start`), not `pnpm dev`. Dev-mode compile pauses on first page visit look like the site is slow.
- [ ] Pre-visit every URL in the demo path once to warm the routes.

**Browser**

- [ ] Logged out, in a clean profile or incognito. **Critical:** the public layout redirects logged-in admins to the admin dashboard — presenting while signed in as an admin will bounce you out of the public site.
- [ ] Zoom at 110–125% for projector legibility.
- [ ] Bookmarks bar hidden, notifications silenced, second tab open on the catalog as a fallback.

**Backup**

- [ ] Screen recording of the full reservation flow saved locally. If the network or Stripe fails live, you narrate the recording and lose 30 seconds instead of the room.

---

## 5. Slide-by-slide with speaker notes

### Slide 1 — Title

**BillBoard Hub — Outdoor advertising, booked online.**

> Say: nothing. Let it sit for three seconds, then start with the problem.

### Slide 2 — The problem

Three bullets, no more:

- Availability lives in someone's inbox
- Pricing is quoted, never published
- A campaign takes days to book and nobody can compare options

> Say: _"Outdoor is the only major advertising channel where you still can't find out what's available without making a phone call."_

### Slide 3 — The solution

The three claims from Section 1. One line each.

### Slide 4 — Where the inventory lives

Screenshot of the home page hero with the live city map.

> Say: _"Every number on this page is read from the live inventory database at request time — placement count, city count, the top-five city breakdown. Nothing here is hardcoded marketing copy."_

This is worth saying explicitly. It's a credibility beat.

### Slide 5 — **Switch to live demo**

Blank slide, large text: **Live Demo**. Switch to browser.

Run Section 6 in full.

### Slide 6 — Back from demo: the content surface

Screenshot grid of the solutions, blog, and guides pages.

> Say: _"Twenty-four public pages, all indexed, all in the sitemap. This is built to acquire traffic, not just to serve people who already know us."_

### Slide 7 — Trust & security

Four bullets from Section 8.

### Slide 8 — Roadmap & ask

Whatever your actual ask is. Keep it to one slide.

---

## 6. THE FULL DEMO FLOW

This is the heart of the presentation. Follow the click path exactly — it's ordered so every screen sets up the next.

### Step 0 — Start at the home page (`/`)

**Scroll slowly through all eleven sections in order.** Don't narrate every one; call out four.

| #   | Section                | Say this                                                                                                                          |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Hero**               | _"Live placement count, live city count, and a map of Lebanon showing where inventory actually is."_                              |
| 2   | Brands                 | (scroll past)                                                                                                                     |
| 3   | **How It Works**       | _"Three steps: Search & Discover, Plan & Book, Launch & Measure. That's the whole promise."_                                      |
| 4   | **Billboard Formats**  | _"Five formats — highway, digital screens, rooftop, mall, street-level."_                                                         |
| 5   | **Inventory Showcase** | _"Real billboards from the live database, not stock photos."_                                                                     |
| 6   | Stats                  | (scroll past — animated counters)                                                                                                 |
| 7   | Features               | (scroll past)                                                                                                                     |
| 8   | Reviews                | (scroll past)                                                                                                                     |
| 9   | FAQ                    | Pause 2 seconds — _"Five questions, and this block is marked up as structured data so it can appear directly in Google results."_ |
| 10  | Contact                | (scroll past)                                                                                                                     |
| 11  | CTA                    | Land here, then click **Billboards** in the nav.                                                                                  |

> **Timing:** 90 seconds maximum. The temptation is to linger. Don't — the reservation flow is what sells.

### Step 1 — Browse the catalog (`/billboards`)

1. Let the grid load. _"Every billboard currently listed."_
2. **Filter to Digital.** Point out the URL becomes `/billboards?type=digital`. _"Filters are in the URL — this is a shareable, linkable, indexable page. A media planner can send this exact view to a client."_
3. **Type a city into search.** Show results narrowing.
4. Say: _"Note the page title changed too — the metadata adapts to the filter, so the digital-billboards view is its own SEO landing page."_

> **Beat:** _"Rania filters to digital screens in Beirut. Thirty seconds, no phone call."_

### Step 2 — Open a billboard (`/billboards/[id]`)

Pick your best-photographed **digital** billboard.

1. **Gallery** — click through 2–3 images.
2. **Quick facts** — dimensions, city, estimated monthly traffic, monthly price. _"Published pricing. Not 'contact us for a quote.'"_
3. **Scroll to the digital spec showcase.** This is your visual highlight — pause here.

   > Say: _"For digital screens we show the actual media plan: resolution, brightness, how long each ad slot runs, how many ads are in the rotation, the full loop time — and then the two numbers an advertiser actually cares about: **spots per hour** and **share of screen**. That's derived, not typed in."_

4. Scroll to **"Start your campaign"** and click **Reserve**.

> **Beat:** _"She knows exactly what she's buying — down to how many times an hour her ad plays."_

### Step 3 — Reservation, Step 1 of 4: Booking Details

The checkout is a four-step wizard: **Booking Details → Review & Confirm → Payment & Invoice → Confirmation**. The stepper is visible at the top the whole time; completed steps are clickable to go back.

1. **Pick campaign dates.** Choose ~3 weeks.
2. **Watch the price panel update live.** This is the moment to slow down:

   > Say: _"The quote is computed as you type. The monthly rate divided across thirty days, times the number of days, plus a 5.5% service fee, plus 11% VAT. Every line is itemized. There is no 'we'll send you a quote.'"_

3. **Demonstrate the conflict check** — enter dates you know are already approved on this billboard. Show the rejection.

   > Say: _"Availability is checked against approved reservations. And note the rule: only *approved* bookings block the calendar. Two advertisers can request the same dates — the operator decides. That's deliberate; it means demand is visible rather than lost to a first-come lock."_

   Add if it lands: _"A static billboard takes one campaign per day. A digital screen takes up to six, because it rotates."_

4. Fill campaign name and objective (Awareness / Product Launch / Store Visits / Engagement).
5. **Upload a creative.** Drag in an image.

   > Say: _"The file goes straight from the browser to our CDN — it never passes through our servers. Faster for the advertiser, and cheaper to run."_

   If you have a digital billboard selected, mention: _"For digital screens, video creatives must be under ten seconds — we read the actual duration out of the file in the browser and reject it before it ever uploads."_

6. Click **Next**.

### Step 4 — Reservation, Step 2 of 4: Review & Confirm

1. Walk the summary: billboard, dates, creative, itemized pricing.
2. Click back to Step 1 via the stepper, then forward again. _"They can revise anything until they commit."_
3. Click **Continue**.

### Step 5 — Reservation, Step 3 of 4: Payment & Invoice

**This is the most important screen in the presentation.** Slow all the way down.

1. Show the two payment options: **Visa through Stripe** and **cash or Whish**.
2. Select Visa. The Stripe card element mounts.
3. Enter `4242 4242 4242 4242`, future expiry, any CVC.
4. **Read the on-screen line aloud, verbatim:**

   > _"Stripe verifies and saves your Visa now without charging it. Payment is collected only after the dates are approved."_

5. Then say:

   > _"This is the trust mechanic of the whole product. We are asking someone to commit to a few thousand dollars of outdoor advertising on dates that aren't confirmed yet. So we don't take the money. Stripe validates the card and stores it — a SetupIntent, not a charge. If the operator rejects the dates, nothing was ever taken. No refund, no dispute, no support ticket."_

6. Point out the **Submit** button stays disabled until the card is verified. _"You can't submit a card-payment reservation with an unverified card."_
7. Click **Submit**.

> **Beat:** _"Rania has committed. Her card is on file. Nothing has been charged."_

### Step 6 — Reservation, Step 4 of 4: Confirmation

1. Show the confirmation summary and the reservation reference.
2. Say: _"Status is **pending**. The operator now reviews it and approves or rejects. On approval, payment is collected against the saved card."_
3. Name the full lifecycle: **pending → approved or rejected → completed or cancelled.**

### Step 7 — Registration (`/register`)

Do this _after_ the reservation, not before — the flow is more compelling when the audience already wants the product.

1. Show **Step 1: Account** — name, email, password. Type a weak password and let the **strength meter** react.
2. Click through to **Step 2: Company** — advertiser profile.
3. Say:

   > _"Two steps, one request. The account and the advertiser profile are created together or not at all — there's no state where someone has a login but no company, or a company with no owner."_

4. Submit and land in the workspace. **Stop at the doorway** — don't enter the dashboard, it's out of scope for this presentation. Say: _"And that's where the advertiser workspace begins — separate conversation."_

### Step 8 — The content surface (fast, 60 seconds)

Click through three or four, don't read them:

- `/solutions/brands` and `/solutions/agencies` — _"Two distinct buyer personas, each with a landing page."_
- `/blog` — five published articles
- `/guides`, `/help`, `/case-studies`
- `/about`, `/contact`

> Say: _"Twenty-four public pages. Solutions, blog, guides, help centre, case studies, press, careers, partners, media kit, plus terms, privacy, and cookies. All in the sitemap, all indexable."_

### Step 9 — Close

Return to the home page. Let the hero sit on screen during Q&A.

---

## 7. Complete public site map

Use this to answer _"what else is there?"_ without hesitating.

**Core commerce flow**

| Route                          | What it is                                       |
| ------------------------------ | ------------------------------------------------ |
| `/`                            | Home — 11 sections, live inventory stats         |
| `/billboards`                  | Catalog with search + type filter, URL-driven    |
| `/billboards/[id]`             | Billboard detail, gallery, digital spec showcase |
| `/billboards/[id]/reservation` | 4-step reservation checkout                      |

**Authentication**

| Route              | What it is                                |
| ------------------ | ----------------------------------------- |
| `/login`           | Sign in                                   |
| `/register`        | Two-step registration (account → company) |
| `/forgot-password` | Request a reset link                      |
| `/reset-password`  | Set a new password                        |

**Payment outcomes**

| Route              | What it is           |
| ------------------ | -------------------- |
| `/payment/success` | Post-payment success |
| `/payment/cancel`  | Payment cancelled    |

**Solutions (4)** — `/solutions/brands`, `/solutions/agencies`, `/solutions/campaign-planning`, `/solutions/audience-targeting`

**Resources (5)** — `/blog`, `/blog/[slug]`, `/guides`, `/help`, `/case-studies`

**Company (5)** — `/about`, `/careers`, `/partners`, `/press`, `/media-kit`, `/contact`

**Legal (3)** — `/terms`, `/privacy`, `/cookies`

**System** — `/unauthorized`, plus `sitemap.xml` and `robots.txt` generated at runtime

---

## 8. Numbers and facts worth quoting

Memorize these six. They're the ones that get asked about.

| Fact                      | Value                                      | Where it comes from                   |
| ------------------------- | ------------------------------------------ | ------------------------------------- |
| Service fee               | **5.5%** of subtotal                       | `BOOKING_SERVICE_FEE_RATE`            |
| VAT                       | **11%**, applied to subtotal + service fee | `BOOKING_VAT_RATE`                    |
| Daily rate                | monthly price ÷ **30**                     | `BOOKING_DAYS_PER_MONTH`              |
| Static billboard capacity | **1** campaign per day                     | `STATIC_RESERVATION_DAILY_LIMIT`      |
| Digital screen capacity   | **6** campaigns per day                    | `DIGITAL_RESERVATION_DAILY_LIMIT`     |
| Max video creative length | **under 10 seconds**                       | `MAX_CREATIVE_VIDEO_DURATION_SECONDS` |

**Worked example — have this ready on paper.** A $3,000/month billboard for 21 days:

- Daily rate: $100
- Subtotal: $2,100
- Service fee (5.5%): $115.50
- VAT (11% of $2,215.50): $243.71
- **Total: $2,459.21**

Currencies supported: **USD, EUR, LBP.**

Booking statuses: **pending, approved, rejected, completed, cancelled.**
Payment statuses: **unpaid, pending, partially paid, paid, refund pending, refunded.**

---

## 9. Technical highlights

Deploy these only if a technical person is in the room, or in answer to a direct question.

**Stack** — Next.js 16, React 19, MongoDB with Mongoose, Auth.js v5 with database sessions, Stripe, ImageKit CDN, Zod for validation, Tailwind + shadcn, TanStack Query and Table.

**Four points worth making:**

1. **Pricing is never trusted from the client.** The browser computes the quote for live preview; the server recomputes it independently and uses its own number as authoritative. A tampered request can't change what's charged.

2. **Uploads bypass the server.** The browser requests short-lived signed credentials, then uploads directly to ImageKit. The private key never leaves the server, and video files never consume server bandwidth.

3. **Validation is shared, not duplicated.** One set of Zod schemas is imported by both the browser and the API, so client-side and server-side rules cannot drift apart. The 10-second video rule, for example, is enforced at four layers from one constant.

4. **Security headers are set globally** — HSTS with a two-year max-age, `X-Frame-Options: DENY`, `nosniff`, a restrictive `Permissions-Policy`, and `no-store` on every API response so authenticated JSON is never cached or replayed.

**SEO** — per-page metadata, JSON-LD structured data (Organization, WebSite, FAQ, Product, Breadcrumb), a sitemap that includes every live billboard and blog post with images, and correct `noindex` on search results and the reservation page so thin and private pages stay out of the index.

**Accessibility** — skip-to-content link, focus-managed main landmark, `aria-current` on the wizard stepper, `role="alert"` on error messages.

---

## 10. Q&A preparation

**"What stops two people booking the same billboard for the same dates?"**
Approved reservations block the calendar; pending requests don't. Multiple advertisers can request the same window, and the operator picks. Deliberate — it surfaces demand instead of hiding it behind a first-come lock. Static boards take one campaign a day, digital screens up to six.

**"When is the customer actually charged?"**
Never at reservation. Stripe verifies and saves the card via a SetupIntent. Payment is collected only after the operator approves the dates. If it's rejected, nothing was ever taken.

**"What if they don't want to use a card?"**
Cash or Whish is offered as an alternative at the same step. Bank transfer is also modelled in the system.

**"Can someone tamper with the price?"**
No. The client-side figure is a preview only. The server recomputes the quote from the billboard's own stored monthly price and the requested dates, and that value is what's stored and charged.

**"Is the site multilingual / does it support Arabic?"**
Not today — English only, and the layout is left-to-right. Worth being straight about this; it's a known roadmap item rather than a hidden gap.

**"How do you know traffic estimates are accurate?"**
They're operator-entered per billboard and displayed as estimates. Be honest — don't claim measurement the platform doesn't do yet. Impressions tracking exists on the operator side as a separate capability.

**"What happens to the creative after upload?"**
It's stored on ImageKit's CDN and attached to the reservation for operator review. For digital screens it enters the rotation once the booking is approved.

**"How does this make money?"**
The 5.5% service fee on every booking. Have a view ready on whether that's the long-term model.

**"How many billboards are on the platform?"**
Read the live number off the home page rather than quoting from memory — it's computed from the database and it will be correct.

---

## 11. Known gaps — do not demo these

Be aware so you don't wander into them, and so you answer honestly if asked.

- **No Arabic / RTL support.** English only.
- **File size and duration limits are enforced in the browser only.** Because uploads go directly to the CDN, the server can't independently verify the size or length of what was uploaded. Don't claim server-side enforcement.
- **Upload limits are inconsistent across the site** — 5 MB for billboard images, 50 MB in the creative form, 10 MB / 200 MB in the campaign uploader. Nobody will notice in a demo, but don't invite it by discussing limits.
- **No rate limiting on the upload-credentials endpoint.**
- **Uploaded images are served unoptimized** — the CDN host isn't registered with Next's image optimizer, so they bypass automatic resizing. Fine on a laptop, worth knowing if someone asks about mobile performance.
- **The campaign creative uploader doesn't enforce the 10-second video rule** — only the main creative form does.

If asked about any of these directly, name it plainly and say it's tracked. A known, articulated gap reads as engineering maturity. A gap you fumble reads as a surprise.

---

## 12. Presentation-day quick card

Print or keep on a phone.

```
DEMO PATH
  /  →  /billboards  →  filter Digital  →  open a digital board
     →  Reserve  →  dates  →  creative  →  Next
     →  Review  →  Continue
     →  Visa · 4242 4242 4242 4242  →  Submit
     →  Confirmation (status: pending)
     →  /register  (2 steps)  →  stop at the workspace door
     →  /solutions/brands, /blog  →  home

THREE LINES THAT MATTER
  1. "Every number on this page is live from the inventory database."
  2. "The card is verified and saved. It is not charged until the dates
      are approved."
  3. "The server recomputes the price. The client's number is a preview."

NUMBERS
  5.5% service fee · 11% VAT · monthly ÷ 30 = daily
  static 1/day · digital 6/day · video < 10s
  $3,000/mo × 21 days = $2,459.21 total

IF IT BREAKS
  Stripe fails      → switch to cash/Whish, keep going
  Upload fails      → skip it, the step still advances
  Total failure     → play the backup recording, narrate
  Bounced to admin  → you are logged in as admin; use incognito
```

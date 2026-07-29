import type { PublicBillboard } from '@/shared/types/billboard';

/* ---------- Dynamic (DB-derived) ---------- */

export type MarketOverviewEntry = {
  city: string;
  count: number;
};

export type HomeStats = {
  placements: number;
  cities: number;
};

export type HomeData = {
  billboards: PublicBillboard[];
  marketOverview: MarketOverviewEntry[];
  stats: HomeStats;
  content: HomepageContent;
};

/* ---------- Static content (data/homepage.ts) ---------- */
/* Shaped so it can later be sourced from a CMS/DB without touching the UI. */

export type HomeIconKey =
  | 'badge-check'
  | 'bar-chart'
  | 'building'
  | 'bus'
  | 'calendar-check'
  | 'file-text'
  | 'life-buoy'
  | 'map-pin'
  | 'monitor-play'
  | 'rocket'
  | 'search'
  | 'signpost'
  | 'store'
  | 'tag'
  | 'target'
  | 'users'
  | 'zap';

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

type HeroChip = {
  label: string;
  icon: HomeIconKey;
};

export type HeroContent = {
  headline: string;
  subheadline: string;
  searchPlaceholder: string;
  primaryCta: NavItem;
  secondaryCta: NavItem;
  chips: HeroChip[];
};

export type BrandItem = {
  name: string;
  /**
   * Path to an existing, licensed brand asset under `public/brands/`. When
   * omitted, the carousel renders its local generated wordmark without making
   * an asset request.
   */
  logo?: string;
};

export type HowItWorksStep = {
  number: number;
  icon: HomeIconKey;
  title: string;
  description: string;
};

export type BillboardFormat = {
  icon: HomeIconKey;
  title: string;
  description: string;
  gradient: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type FeatureItem = {
  icon: HomeIconKey;
  title: string;
  description: string;
  outcome: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Review = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

export type StatItem = {
  icon: HomeIconKey;
  value: number;
  suffix: string;
  label: string;
  /** When set, the live value from `HomeStats` overrides the static one. */
  dynamicKey?: keyof HomeStats;
};

export type SocialKey = 'facebook' | 'instagram' | 'linkedin' | 'youtube';

export type SocialLink = {
  label: string;
  href: string;
  icon: SocialKey;
};

export type FooterColumnData = {
  title: string;
  links: NavItem[];
};

export type ContactInfo = {
  location: string;
  phone: string;
  email: string;
};

export type HomepageContent = {
  hero: HeroContent;
  brands: BrandItem[];
  howItWorks: HowItWorksStep[];
  formats: BillboardFormat[];
  stats: StatItem[];
  features: FeatureItem[];
  faqs: FaqItem[];
  reviews: Review[];
};

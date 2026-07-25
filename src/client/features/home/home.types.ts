import type { LucideIcon } from 'lucide-react';
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
  cities: string[];
  marketOverview: MarketOverviewEntry[];
  stats: HomeStats;
};

/* ---------- Static content (data/homepage.ts) ---------- */
/* Shaped so it can later be sourced from a CMS/DB without touching the UI. */

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type HeroChip = {
  label: string;
  icon: LucideIcon;
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
};

export type HowItWorksStep = {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
};

export type BillboardFormat = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type StatItem = {
  icon: LucideIcon;
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

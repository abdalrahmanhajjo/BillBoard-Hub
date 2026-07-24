import {
  BadgeCheck,
  BarChart3,
  Building2,
  Bus,
  CalendarCheck,
  FileText,
  LifeBuoy,
  MapPin,
  MonitorPlay,
  Rocket,
  Search,
  Signpost,
  Store,
  Tag,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import type {
  BillboardFormat,
  BrandItem,
  ContactInfo,
  FaqItem,
  FeatureItem,
  FooterColumnData,
  HeroContent,
  HowItWorksStep,
  NavGroup,
  NavItem,
  SocialLink,
  StatItem,
} from '@/client/features/home/home.types';

export const brandName = 'Boardly';

export const navLinks: NavItem[] = [
  { label: 'Billboards', href: '/billboards' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
];

export const solutionsGroup: NavGroup = {
  label: 'Solutions',
  items: [
    { label: 'For Brands', href: '/#formats' },
    { label: 'For Agencies', href: '/#formats' },
    { label: 'Campaign Planning', href: '/#features' },
    { label: 'Audience Targeting', href: '/#features' },
  ],
};

export const heroContent: HeroContent = {
  headline: 'Book billboard ads that reach Lebanon.',
  subheadline:
    'The easiest way for brands and agencies to discover, plan, and book out of home campaigns across Lebanon.',
  searchPlaceholder: 'Search location (e.g., Beirut, Zouk Mosbeh...)',
  primaryCta: { label: 'Get Started', href: '/register' },
  secondaryCta: { label: 'See How It Works', href: '/#how-it-works' },
  chips: [
    { label: 'Premium inventory', icon: BadgeCheck },
    { label: 'Real-time availability', icon: Zap },
    { label: 'Transparent pricing', icon: Tag },
  ],
};

export const brands: BrandItem[] = [
  { name: 'alfa' },
  { name: 'touch' },
  { name: 'ABC' },
  { name: 'Spinneys' },
  { name: 'BeitMisk' },
  { name: 'OMT' },
  { name: 'CMA CGM' },
  { name: 'mtv' },
  { name: 'KIA' },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    icon: Search,
    title: 'Search & Discover',
    description: 'Find billboards by location, format, audience, and availability.',
  },
  {
    number: 2,
    icon: CalendarCheck,
    title: 'Plan & Book',
    description: 'Choose your dates, compare rates, and instantly request a quote.',
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Launch & Measure',
    description: 'We handle the execution while you track performance in real time.',
  },
];

export const billboardFormats: BillboardFormat[] = [
  {
    icon: Signpost,
    title: 'Highway Billboards',
    description: 'High-visibility static billboards along major highways.',
    gradient: 'from-blue-500/15 to-blue-600/5',
    image: '/images/formats/lebanon-highway-billboard.png',
    imageAlt: "Large roadside billboard overlooking Lebanon's Mediterranean coast",
    href: '/billboards',
  },
  {
    icon: MonitorPlay,
    title: 'Digital Screens',
    description: 'Dynamic digital billboards in prime urban locations.',
    gradient: 'from-indigo-500/15 to-indigo-600/5',
    image: '/images/formats/beirut-digital-screen.png',
    imageAlt: 'Large digital advertising screen at a modern Beirut intersection',
    href: '/billboards',
  },
  {
    icon: Building2,
    title: 'Rooftop Boards',
    description: 'Large-format billboards on rooftops with skyline visibility.',
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    image: '/images/formats/beirut-rooftop-board.png',
    imageAlt: 'Large rooftop billboard above the Beirut skyline at sunset',
    href: '/billboards',
  },
  {
    icon: Store,
    title: 'Mall Advertising',
    description: 'Engage shoppers inside premium malls.',
    gradient: 'from-amber-500/15 to-amber-600/5',
    image: '/images/formats/beirut-mall-advertising.png',
    imageAlt: 'Large digital advertising display inside a premium shopping mall',
    href: '/billboards',
  },
  {
    icon: Bus,
    title: 'Street-Level',
    description: 'Posters, street furniture, and transit placements.',
    gradient: 'from-rose-500/15 to-rose-600/5',
    image: '/images/formats/beirut-street-level.png',
    imageAlt: 'Street-level digital advertising display on a busy Beirut boulevard',
    href: '/billboards',
  },
];

export const stats: StatItem[] = [
  {
    icon: BarChart3,
    value: 1250,
    suffix: '+',
    label: 'Premium Placements',
    dynamicKey: 'placements',
  },
  { icon: MapPin, value: 25, suffix: '+', label: 'Cities Across Lebanon', dynamicKey: 'cities' },
  { icon: Rocket, value: 3400, suffix: '+', label: 'Campaigns Launched' },
  { icon: Users, value: 320, suffix: '+', label: 'Happy Clients' },
];

export const features: FeatureItem[] = [
  {
    icon: Store,
    title: 'Marketplace',
    description: 'Access premium inventory with real-time availability and clear pricing.',
  },
  {
    icon: Target,
    title: 'Campaign Planning',
    description: 'Plan across dates and locations, see reach estimates before you commit.',
  },
  {
    icon: Users,
    title: 'Audiences',
    description: 'Target by location, demographics, and behavior to reach the right people.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Monitor live performance with attribution, causal insights, and device-level data.',
  },
  {
    icon: FileText,
    title: 'Reporting',
    description: 'Export clean, automated reports that show what matters most.',
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    description: 'Expert guidance, dedicated support, and local know-how when you need it.',
  },
];

export const faqs: FaqItem[] = [
  {
    question: 'How do I book a billboard campaign?',
    answer:
      'Browse inventory by location and format, choose a placement and preferred dates, then send a reservation request. Our team confirms availability, final pricing, and production details before anything is booked.',
  },
  {
    question: 'Can I see availability and pricing online?',
    answer:
      'Every listing shows its current inventory status and monthly media rate. Because campaign dates can overlap, our team performs a final availability check before confirming your reservation.',
  },
  {
    question: 'What formats and locations are available?',
    answer:
      'We cover highway billboards, digital screens, rooftop boards, mall advertising, and street-level placements across cities all over Lebanon.',
  },
  {
    question: 'How do payments and invoicing work?',
    answer:
      'You receive a clear quote up front and a consolidated invoice for your campaign. Reach out to our team for enterprise billing arrangements.',
  },
  {
    question: 'Can you help plan my campaign?',
    answer:
      'Yes. Our planning team can recommend locations, formats, campaign length, and audience coverage based on your objectives and budget.',
  },
];

export const footerColumns: FooterColumnData[] = [
  {
    title: 'Product',
    links: [
      { label: 'Marketplace', href: '/billboards' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Request a Demo', href: '/register' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Brands', href: '/#formats' },
      { label: 'For Agencies', href: '/#formats' },
      { label: 'Campaign Planning', href: '/#features' },
      { label: 'Audience Targeting', href: '/#features' },
      { label: 'Case Studies', href: '/#features' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/#' },
      { label: 'Guides', href: '/#' },
      { label: 'Billboard Locations', href: '/billboards' },
      { label: 'Media Kit', href: '/#' },
      { label: 'Help Center', href: '/#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/#' },
      { label: 'Careers', href: '/#' },
      { label: 'Partners', href: '/#' },
      { label: 'Press', href: '/#' },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: 'Facebook', href: '/#', icon: 'facebook' },
  { label: 'Instagram', href: '/#', icon: 'instagram' },
  { label: 'LinkedIn', href: '/#', icon: 'linkedin' },
  { label: 'YouTube', href: '/#', icon: 'youtube' },
];

export const contactInfo: ContactInfo = {
  location: 'Beirut, Lebanon',
  phone: '+961 1 234 567',
  email: 'hello@boardly.com',
};

export const footerDescription =
  'The leading billboard advertising platform in Lebanon. Discover, plan, book, and measure high-impact out of home campaigns.';

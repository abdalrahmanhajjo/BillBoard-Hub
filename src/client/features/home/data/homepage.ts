import type {
  BillboardFormat,
  BrandItem,
  ContactInfo,
  FaqItem,
  FeatureItem,
  FooterColumnData,
  HeroContent,
  HowItWorksStep,
  HomepageContent,
  NavGroup,
  NavItem,
  Review,
  SocialLink,
  StatItem,
} from '@/client/features/home/home.types';

export const brandName = 'Boardly';

export const navLinks: NavItem[] = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
];

/* "Billboards" mega-item: the trigger links to the full catalog, and each item
   deep-links into a real, working view of the inventory. */
export const exploreGroup: NavGroup = {
  label: 'Billboards',
  items: [
    {
      label: 'All billboards',
      href: '/billboards',
      description: 'Browse every placement across Lebanon',
    },
    {
      label: 'Digital screens',
      href: '/billboards?type=digital',
      description: 'Dynamic LED displays with rotating ads',
    },
    {
      label: 'Static billboards',
      href: '/billboards?type=static',
      description: 'Classic printed roadside formats',
    },
    {
      label: 'Formats & placements',
      href: '/#formats',
      description: 'Highway, rooftop, mall, and street-level',
    },
  ],
};

const heroContent: HeroContent = {
  headline: 'Book billboard ads that reach Lebanon.',
  subheadline:
    'The easiest way for brands and agencies to discover, plan, and book out of home campaigns across Lebanon.',
  searchPlaceholder: 'Search location (e.g., Beirut, Zouk Mosbeh...)',
  primaryCta: { label: 'Get Started', href: '/register' },
  secondaryCta: { label: 'See How It Works', href: '/#how-it-works' },
  chips: [
    { label: 'Verified inventory', icon: 'badge-check' },
    { label: 'Availability checked before confirmation', icon: 'zap' },
    { label: 'Clear monthly pricing', icon: 'tag' },
  ],
};

// Each brand points at its real logo asset in `public/brands/` (see the README
// there for sourcing and rights notes). Add a `logo` path only after the
// matching file exists; entries without one fall back to the generated wordmark
// instead of requesting a missing asset.
const brands: BrandItem[] = [
  { name: 'alfa', logo: '/brands/alfa.png' },
  { name: 'touch', logo: '/brands/touch.svg' },
  { name: 'ABC', logo: '/brands/abc.svg' },
  { name: 'Spinneys', logo: '/brands/spinneys.png' },
  { name: 'BeitMisk', logo: '/brands/beitmisk.png' },
  { name: 'OMT', logo: '/brands/omt.svg' },
  { name: 'CMA CGM', logo: '/brands/cma-cgm.svg' },
  { name: 'mtv', logo: '/brands/mtv.svg' },
  { name: 'KIA', logo: '/brands/kia.svg' },
];

const howItWorksSteps: HowItWorksStep[] = [
  {
    number: 1,
    icon: 'search',
    title: 'Search & Discover',
    description: 'Find billboards by location, format, audience, and availability.',
  },
  {
    number: 2,
    icon: 'calendar-check',
    title: 'Plan & Book',
    description: 'Choose your dates, compare rates, and instantly request a quote.',
  },
  {
    number: 3,
    icon: 'bar-chart',
    title: 'Launch & Measure',
    description: 'Coordinate production, confirm launch, and review campaign delivery.',
  },
];

const billboardFormats: BillboardFormat[] = [
  {
    icon: 'signpost',
    title: 'Highway Billboards',
    description: 'High-visibility static billboards along major highways.',
    gradient: 'from-blue-500/15 to-blue-600/5',
    image: '/images/billboards/jounieh-highway-static.png',
    imageAlt: 'Large static highway billboard on the Jounieh coastal highway',
    href: '/billboards',
  },
  {
    icon: 'monitor-play',
    title: 'Digital Screens',
    description: 'Dynamic digital billboards in prime urban locations.',
    gradient: 'from-indigo-500/15 to-indigo-600/5',
    image: '/images/formats/beirut-digital-screen.png',
    imageAlt: 'Large digital advertising screen at a modern Beirut intersection',
    href: '/billboards',
  },
  {
    icon: 'building',
    title: 'Rooftop Boards',
    description: 'Large-format billboards on rooftops with skyline visibility.',
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    image: '/images/formats/beirut-rooftop-board.png',
    imageAlt: 'Large rooftop billboard above the Beirut skyline at sunset',
    href: '/billboards',
  },
  {
    icon: 'store',
    title: 'Mall Advertising',
    description: 'Engage shoppers inside premium malls.',
    gradient: 'from-amber-500/15 to-amber-600/5',
    image: '/images/formats/beirut-mall-advertising.png',
    imageAlt: 'Large digital advertising display inside a premium shopping mall',
    href: '/billboards',
  },
  {
    icon: 'bus',
    title: 'Street-Level',
    description: 'Posters, street furniture, and transit placements.',
    gradient: 'from-rose-500/15 to-rose-600/5',
    image: '/images/formats/beirut-street-level.png',
    imageAlt: 'Street-level digital advertising display on a busy Beirut boulevard',
    href: '/billboards',
  },
];

const stats: StatItem[] = [
  {
    icon: 'bar-chart',
    value: 1250,
    suffix: '+',
    label: 'Premium Placements',
    dynamicKey: 'placements',
  },
  {
    icon: 'map-pin',
    value: 25,
    suffix: '+',
    label: 'Cities Across Lebanon',
    dynamicKey: 'cities',
  },
  { icon: 'rocket', value: 3400, suffix: '+', label: 'Campaigns Launched' },
  { icon: 'users', value: 320, suffix: '+', label: 'Happy Clients' },
];

const features: FeatureItem[] = [
  {
    icon: 'store',
    title: 'Marketplace',
    description: 'Access premium inventory with real-time availability and clear pricing.',
    outcome: 'Inventory + availability',
  },
  {
    icon: 'target',
    title: 'Campaign Planning',
    description: 'Plan across dates and locations, see reach estimates before you commit.',
    outcome: 'Dates + reach',
  },
  {
    icon: 'users',
    title: 'Audiences',
    description: 'Target by location, demographics, and behavior to reach the right people.',
    outcome: 'Location + audience',
  },
  {
    icon: 'bar-chart',
    title: 'Analytics',
    description: 'Review traffic estimates, campaign dates, and placement delivery in one view.',
    outcome: 'Traffic + delivery',
  },
  {
    icon: 'file-text',
    title: 'Reporting',
    description: 'Export clean, automated reports that show what matters most.',
    outcome: 'Exports + summaries',
  },
  {
    icon: 'life-buoy',
    title: 'Support',
    description: 'Expert guidance, dedicated support, and local know-how when you need it.',
    outcome: 'Local campaign guidance',
  },
];

const faqs: FaqItem[] = [
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

export const reviews: Review[] = [
  {
    quote:
      'Booking a highway billboard used to take a week of phone calls. With Boardly our campaign was live in two days.',
    author: 'Rana Khoury',
    role: 'Marketing Lead, Retail brand',
    rating: 5,
  },
  {
    quote:
      'Real-time availability and the digital screen rotation made planning our product launch effortless.',
    author: 'Karim Haddad',
    role: 'Founder, D2C startup',
    rating: 5,
  },
  {
    quote:
      'As an agency we manage dozens of placements — the dashboard and reporting save us hours every week.',
    author: 'Lea Mansour',
    role: 'Media Director, Agency',
    rating: 5,
  },
  {
    quote:
      'Transparent locations and traffic data meant no surprises. Our reach estimates were spot on.',
    author: 'Tarek Saad',
    role: 'Growth Manager',
    rating: 5,
  },
  {
    quote:
      'The team helped us pick the right mix of rooftop and street-level. Genuinely great local know-how.',
    author: 'Nour Aoun',
    role: 'Brand Manager',
    rating: 5,
  },
  {
    quote:
      'From reservation to going live, everything was in one place. Exactly what out-of-home needed.',
    author: 'Elie Gharios',
    role: 'CMO, Consumer goods',
    rating: 5,
  },
];

export const footerColumns: FooterColumnData[] = [
  {
    title: 'Product',
    links: [
      { label: 'Marketplace', href: '/billboards' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Reviews', href: '/#reviews' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Request a Demo', href: '/register' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Brands', href: '/solutions/brands' },
      { label: 'For Agencies', href: '/solutions/agencies' },
      { label: 'Campaign Planning', href: '/solutions/campaign-planning' },
      { label: 'Audience Targeting', href: '/solutions/audience-targeting' },
      { label: 'Case Studies', href: '/case-studies' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Guides', href: '/guides' },
      { label: 'Billboard Locations', href: '/billboards' },
      { label: 'Media Kit', href: '/media-kit' },
      { label: 'Help Center', href: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Partners', href: '/partners' },
      { label: 'Press', href: '/press' },
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

/**
 * Serializable homepage content contract.
 *
 * Replace this object with a CMS/repository result to move the marketing copy
 * to the database; section components do not need to change.
 */
export const homepageContent: HomepageContent = {
  hero: heroContent,
  brands,
  howItWorks: howItWorksSteps,
  formats: billboardFormats,
  stats,
  features,
  faqs,
  reviews,
};

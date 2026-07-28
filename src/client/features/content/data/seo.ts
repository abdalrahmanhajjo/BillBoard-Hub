export type ContentSeoEntry = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  noIndex?: boolean;
  pageType?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ContactPage';
  service?: boolean;
};

export const CONTENT_SEO = {
  about: {
    title: 'About Boardly, Lebanon’s Billboard Marketplace',
    description:
      'Learn how Boardly makes billboard advertising across Lebanon easier to discover, plan and reserve for brands and agencies.',
    path: '/about',
    keywords: ['Boardly Lebanon', 'billboard marketplace Lebanon', 'outdoor advertising platform'],
    pageType: 'AboutPage',
  },
  blog: {
    title: 'Outdoor Advertising Insights and Billboard Guides',
    description:
      'Read practical insights about billboard advertising, digital OOH, campaign planning, creative design and media buying in Lebanon.',
    path: '/blog',
    keywords: ['billboard advertising blog', 'OOH advertising Lebanon', 'digital OOH insights'],
    pageType: 'CollectionPage',
  },
  careers: {
    title: 'Careers at Boardly',
    description:
      'Explore careers at Boardly and help build the technology platform for billboard and out-of-home advertising across Lebanon.',
    path: '/careers',
    keywords: ['Boardly careers', 'advertising jobs Beirut', 'Next.js jobs Lebanon'],
  },
  caseStudies: {
    title: 'Billboard Advertising Case Studies in Lebanon',
    description:
      'See how brands and agencies plan high-impact static and digital billboard campaigns across Beirut and Lebanon with Boardly.',
    path: '/case-studies',
    keywords: [
      'billboard advertising case studies',
      'OOH campaign examples Lebanon',
      'Beirut advertising campaigns',
    ],
    pageType: 'CollectionPage',
  },
  guides: {
    title: 'Billboard Advertising Guides for Lebanon',
    description:
      'Plan better outdoor campaigns with guides to billboard formats, locations, creative design, reach estimates and measurement.',
    path: '/guides',
    keywords: ['billboard advertising guide', 'how to advertise in Lebanon', 'OOH campaign guide'],
    pageType: 'CollectionPage',
  },
  help: {
    title: 'Billboard Booking Help Center',
    description:
      'Get help finding billboard inventory, selecting campaign dates, submitting reservations and preparing outdoor creative.',
    path: '/help',
    keywords: ['billboard booking help', 'Boardly support', 'reserve billboard Lebanon'],
  },
  contact: {
    title: 'Contact Boardly for Billboard Advertising in Lebanon',
    description:
      'Talk to Boardly about billboard locations, campaign dates, formats and budgets for outdoor advertising across Beirut and Lebanon.',
    path: '/contact',
    keywords: [
      'contact billboard advertising Lebanon',
      'billboard campaign quote Beirut',
      'outdoor advertising consultation',
    ],
    pageType: 'ContactPage',
  },
  mediaKit: {
    title: 'Boardly Media Kit',
    description:
      'Request Boardly brand assets, product visuals, company information and audience facts for press and partner communications.',
    path: '/media-kit',
    keywords: ['Boardly media kit', 'Boardly logo', 'billboard marketplace press assets'],
  },
  partners: {
    title: 'Partner with Boardly',
    description:
      'Media owners, agencies and technology providers can partner with Boardly to reach advertisers and manage billboard inventory.',
    path: '/partners',
    keywords: [
      'billboard media owner partnership',
      'outdoor advertising partners Lebanon',
      'list billboard inventory',
    ],
  },
  press: {
    title: 'Boardly Press and Company Information',
    description:
      'Find company facts and press resources about Boardly and Lebanon’s billboard advertising marketplace.',
    path: '/press',
    keywords: ['Boardly press', 'Lebanon OOH marketplace', 'Boardly company information'],
  },
  solutionsAgencies: {
    title: 'Billboard Planning and Booking for Agencies',
    description:
      'Plan and reserve static and digital billboard campaigns across Lebanon for multiple clients from one agency workspace.',
    path: '/solutions/agencies',
    keywords: [
      'billboard advertising for agencies',
      'OOH media planning Lebanon',
      'agency billboard booking',
    ],
    service: true,
  },
  audienceTargeting: {
    title: 'OOH Audience and Location Targeting in Lebanon',
    description:
      'Match billboard locations, traffic and environments to how your target audience moves through Beirut and cities across Lebanon.',
    path: '/solutions/audience-targeting',
    keywords: [
      'OOH audience targeting',
      'billboard location targeting',
      'outdoor advertising audience Lebanon',
    ],
    service: true,
  },
  solutionsBrands: {
    title: 'Billboard Advertising Solutions for Brands',
    description:
      'Discover verified billboard locations, compare media rates and plan high-impact outdoor campaigns for your brand in Lebanon.',
    path: '/solutions/brands',
    keywords: [
      'billboard advertising for brands',
      'outdoor media buying Lebanon',
      'brand awareness billboards',
    ],
    service: true,
  },
  campaignPlanning: {
    title: 'Billboard Campaign Planning in Lebanon',
    description:
      'Compare billboard locations, formats, dates, traffic estimates and pricing to plan an effective outdoor campaign across Lebanon.',
    path: '/solutions/campaign-planning',
    keywords: [
      'billboard campaign planning',
      'OOH media planning Lebanon',
      'outdoor advertising campaign',
    ],
    service: true,
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms governing the use of the Boardly billboard marketplace and reservations.',
    path: '/terms',
    keywords: [],
    noIndex: true,
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How Boardly collects, uses and protects personal information.',
    path: '/privacy',
    keywords: [],
    noIndex: true,
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'How Boardly uses cookies and similar browser technologies.',
    path: '/cookies',
    keywords: [],
    noIndex: true,
  },
} as const satisfies Record<string, ContentSeoEntry>;

import type { ContentPageData } from '@/client/features/content/components/content-page';

const browseCta = { label: 'Browse billboards', href: '/billboards' };
const startCta = { label: 'Get started', href: '/register' };
const contactCta = { label: 'Contact the team', href: '/contact' };

export const PAGES: Record<string, ContentPageData> = {
  // ---------------- Company ----------------
  about: {
    eyebrow: 'Company',
    title: 'About Boardly',
    intro:
      'Boardly is the easiest way for brands and agencies to discover, plan, book, and measure out-of-home advertising across Lebanon — all in one place.',
    sections: [
      {
        heading: 'Our mission',
        paragraphs: [
          'Out-of-home advertising has always been powerful and stubbornly hard to buy. Availability lives in spreadsheets, pricing is opaque, and booking means days of phone calls. We started Boardly to change that.',
          'We connect advertisers with premium billboard inventory through a transparent marketplace — real locations, real availability, and clear pricing — so a campaign can go from idea to live in days, not weeks.',
        ],
      },
      {
        heading: 'What we believe',
        bullets: [
          'Transparency beats guesswork — every listing shows its status, format, and rate.',
          'Local expertise matters — we know Lebanese roads, cities, and audiences.',
          'Digital and static belong together — one workflow for both.',
          'Great support is part of the product, not an afterthought.',
        ],
      },
      {
        heading: 'By the numbers',
        cards: [
          {
            title: '1,250+ placements',
            description: 'Premium static and digital inventory nationwide.',
          },
          {
            title: '25+ cities',
            description: 'Coverage across Lebanon, from Beirut to the coast.',
          },
          {
            title: '300+ advertisers',
            description: 'Brands and agencies running campaigns on Boardly.',
          },
          { title: '2-hour replies', description: 'Average first response from our Beirut team.' },
        ],
      },
    ],
    cta: startCta,
  },

  careers: {
    eyebrow: 'Company',
    title: 'Careers at Boardly',
    intro:
      'We are a small, fast-moving team building the out-of-home marketplace for Lebanon. If you like ownership, clear thinking, and real impact, we would love to meet you.',
    sections: [
      {
        heading: 'Why join us',
        bullets: [
          'Real ownership of the problems you solve.',
          'A product used by real brands from day one.',
          'A collaborative, low-ego team based in Beirut.',
          'Room to grow as the company grows.',
        ],
      },
      {
        heading: 'Open roles',
        cards: [
          {
            title: 'Full-stack Engineer',
            description: 'Next.js, TypeScript, MongoDB. Ship features end to end.',
          },
          {
            title: 'Sales & Partnerships',
            description: 'Grow our advertiser and media-owner network.',
          },
          {
            title: 'Campaign Success',
            description: 'Help advertisers plan and launch great campaigns.',
          },
          { title: 'Product Designer', description: 'Craft clean, fast, delightful experiences.' },
        ],
      },
      {
        heading: 'How to apply',
        paragraphs: [
          'Do not see the perfect role but think you would be a great fit? Reach out anyway — we hire for talent and drive.',
          'Email us a short note and your CV, or get in touch through the contact section on our home page.',
        ],
      },
    ],
    cta: contactCta,
  },

  partners: {
    eyebrow: 'Company',
    title: 'Partner with Boardly',
    intro:
      'Own billboard inventory or serve advertisers? Partner with Boardly to reach more buyers, fill more slots, and manage everything through one platform.',
    sections: [
      {
        heading: 'Who we partner with',
        cards: [
          {
            title: 'Media owners',
            description: 'List your static and digital inventory and reach active advertisers.',
          },
          {
            title: 'Agencies',
            description: 'Plan and book across many clients from a single dashboard.',
          },
          {
            title: 'Technology partners',
            description: 'Integrate screens, playback, and reporting with our platform.',
          },
        ],
      },
      {
        heading: 'Why partner',
        bullets: [
          'More demand for your placements from vetted advertisers.',
          'Transparent availability and scheduling that reduces double-booking.',
          'Digital rotation and impression tracking built in.',
          'A dedicated point of contact on our team.',
        ],
      },
    ],
    cta: contactCta,
  },

  press: {
    eyebrow: 'Company',
    title: 'Press & media',
    intro:
      'Resources for journalists and media covering Boardly and the out-of-home advertising market in Lebanon.',
    sections: [
      {
        heading: 'Media kit',
        paragraphs: [
          'Our media kit includes the Boardly logo, brand colors, product screenshots, and company facts. For assets and interviews, reach out to our team.',
        ],
      },
      {
        heading: 'Company facts',
        bullets: [
          'Boardly is an out-of-home advertising marketplace for Lebanon.',
          'Advertisers can discover, plan, book, and measure campaigns in one place.',
          'The platform supports both static billboards and digital screens.',
        ],
      },
    ],
    cta: contactCta,
  },

  // ---------------- Resources ----------------
  blog: {
    eyebrow: 'Resources',
    title: 'The Boardly blog',
    intro:
      'Insights on out-of-home advertising, campaign planning, and the Lebanese media landscape — from the team building Boardly.',
    sections: [
      {
        heading: 'Latest articles',
        cards: [
          {
            title: 'A beginner’s guide to billboard advertising',
            description: 'Formats, locations, and what actually drives results.',
            href: '/blog/billboard-advertising-lebanon-guide',
          },
          {
            title: 'Digital vs. static: which should you choose?',
            description: 'When rotating LED screens beat classic printed boards.',
            href: '/blog/digital-vs-static-billboards',
          },
          {
            title: 'How to plan a nationwide OOH campaign',
            description: 'From objectives to placements to measurement.',
            href: '/blog/plan-nationwide-ooh-campaign-lebanon',
          },
          {
            title: 'Reading traffic and reach estimates',
            description: 'Make sense of the numbers before you book.',
            href: '/blog/billboard-traffic-reach-estimates',
          },
        ],
      },
      {
        paragraphs: [
          'New articles are published regularly. Want a topic covered? Let us know through the contact section.',
        ],
      },
    ],
    cta: browseCta,
  },

  guides: {
    eyebrow: 'Resources',
    title: 'Guides',
    intro: 'Practical, no-fluff guides to help you plan and run effective out-of-home campaigns.',
    sections: [
      {
        heading: 'Start here',
        cards: [
          {
            title: 'OOH basics',
            description: 'The vocabulary and formats every advertiser should know.',
          },
          {
            title: 'Choosing locations',
            description: 'Match placements to how your audience moves.',
          },
          {
            title: 'Creative that works outdoors',
            description: 'Designing for a three-second glance.',
          },
          {
            title: 'Measuring impact',
            description: 'Traffic, reach, and what to track during a campaign.',
          },
        ],
      },
    ],
    cta: browseCta,
  },

  mediaKit: {
    eyebrow: 'Resources',
    title: 'Media kit',
    intro:
      'Everything you need to represent Boardly accurately — brand assets, product visuals, and audience facts.',
    sections: [
      {
        heading: 'What’s inside',
        bullets: [
          'Boardly logo in light and dark variants.',
          'Brand colors and typography guidance.',
          'Product screenshots and short descriptions.',
          'Company facts and boilerplate copy.',
        ],
      },
      {
        heading: 'Audience snapshot',
        cards: [
          { title: 'Nationwide reach', description: 'Inventory across 25+ Lebanese cities.' },
          {
            title: 'Premium placements',
            description: 'Highways, rooftops, malls, and street-level.',
          },
        ],
      },
      {
        paragraphs: ['To request the full kit or specific assets, contact our team.'],
      },
    ],
    cta: contactCta,
  },

  help: {
    eyebrow: 'Resources',
    title: 'Help center',
    intro:
      'Answers to common questions about finding inventory, booking, and running your campaign. Still stuck? Our team is one message away.',
    sections: [
      {
        heading: 'Popular topics',
        cards: [
          {
            title: 'Finding billboards',
            description: 'Search and filter by city, format, availability, and budget.',
          },
          {
            title: 'Requesting a reservation',
            description: 'Pick your dates and submit a request in minutes.',
          },
          {
            title: 'Tracking your status',
            description: 'Follow pending, approved, and completed reservations.',
          },
          {
            title: 'Creatives & guidelines',
            description: 'File formats, sizes, and best practices for outdoor.',
          },
        ],
      },
      {
        heading: 'Need a hand?',
        paragraphs: [
          'The FAQ on our home page covers booking, pricing, and availability. For anything else, reach out and a real person will help.',
        ],
      },
    ],
    cta: contactCta,
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Plan your billboard campaign',
    intro:
      'Tell us where you want to advertise, when the campaign should run, and what you need to achieve. Our Beirut-based team will help you compare suitable billboard locations.',
    sections: [
      {
        heading: 'Campaign planning support',
        paragraphs: [
          'For the fastest recommendation, include your target cities or roads, preferred dates, approximate budget, billboard format, and campaign objective.',
        ],
        cards: [
          {
            title: 'Browse first',
            description: 'Compare live billboard inventory, dimensions, traffic and monthly rates.',
            href: '/billboards',
          },
          {
            title: 'Email the team',
            description: 'Send campaign requirements to hello@boardly.com.',
            href: 'mailto:hello@boardly.com',
          },
        ],
      },
      {
        heading: 'What happens next',
        bullets: [
          'We review the audience, locations, dates and budget.',
          'We recommend a focused shortlist of suitable placements.',
          'You submit a structured reservation request for final availability review.',
        ],
      },
    ],
    cta: browseCta,
  },

  // ---------------- Solutions ----------------
  solutionsBrands: {
    eyebrow: 'Solutions',
    title: 'Boardly for brands',
    intro:
      'Reach your audience where they live, commute, and shop — with premium billboards you can plan and book in one place.',
    sections: [
      {
        heading: 'What you get',
        bullets: [
          'A marketplace of premium static and digital inventory.',
          'Transparent availability and clear media rates.',
          'Campaign planning help from a local team.',
          'Traffic and reach estimates before you commit.',
        ],
      },
      {
        heading: 'Made for real campaigns',
        cards: [
          { title: 'Launches', description: 'High-impact placements to put a product on the map.' },
          {
            title: 'Always-on brand',
            description: 'Sustained presence across key routes and cities.',
          },
          {
            title: 'Store traffic',
            description: 'Drive footfall with nearby, targeted placements.',
          },
        ],
      },
    ],
    cta: browseCta,
  },

  solutionsAgencies: {
    eyebrow: 'Solutions',
    title: 'Boardly for agencies',
    intro:
      'Plan and book out-of-home across all your clients from a single dashboard — faster proposals, fewer phone calls, cleaner reporting.',
    sections: [
      {
        heading: 'Built for multi-client teams',
        bullets: [
          'One workspace for every client and campaign.',
          'Live availability so proposals are always accurate.',
          'Scheduling that helps prevent double-booking.',
          'Reporting you can hand straight to clients.',
        ],
      },
    ],
    cta: contactCta,
  },

  campaignPlanning: {
    eyebrow: 'Solutions',
    title: 'Campaign planning',
    intro:
      'Plan across dates and locations, compare formats, and see reach estimates before you book — so every placement earns its spot.',
    sections: [
      {
        heading: 'Plan with confidence',
        bullets: [
          'Compare highway, rooftop, mall, and street-level placements.',
          'Check availability for your exact campaign window.',
          'Estimate reach from traffic data.',
          'Balance digital rotation with static exclusivity.',
        ],
      },
    ],
    cta: browseCta,
  },

  audienceTargeting: {
    eyebrow: 'Solutions',
    title: 'Audience targeting',
    intro:
      'Reach the right people by matching placements to how your audience actually moves through the city.',
    sections: [
      {
        heading: 'Target by what matters',
        bullets: [
          'Location — pick cities, roads, and neighborhoods.',
          'Environment — highways, malls, rooftops, or street-level.',
          'Traffic — prioritize high-visibility, high-volume sites.',
          'Timing — schedule around the moments that count.',
        ],
      },
    ],
    cta: browseCta,
  },

  caseStudies: {
    eyebrow: 'Solutions',
    title: 'Case studies',
    intro:
      'How brands and agencies use Boardly to plan, book, and measure out-of-home campaigns across Lebanon.',
    sections: [
      {
        heading: 'Featured stories',
        cards: [
          {
            title: 'Retail launch, Beirut',
            description: 'A digital-screen rotation drove a two-week launch to full awareness.',
          },
          {
            title: 'Nationwide brand',
            description: 'A mix of highway and rooftop boards kept a brand present across cities.',
          },
          {
            title: 'Agency rollout',
            description: 'One team managed dozens of client placements from a single dashboard.',
          },
        ],
      },
      {
        paragraphs: ['Want your campaign featured? Talk to our team.'],
      },
    ],
    cta: contactCta,
  },

  // ---------------- Legal ----------------
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    intro:
      'These terms govern your use of the Boardly platform. By creating an account or submitting a reservation, you agree to them.',
    updated: 'July 2026',
    sections: [
      {
        heading: '1. Using Boardly',
        paragraphs: [
          'Boardly provides a marketplace to discover and request out-of-home advertising placements. You are responsible for the accuracy of the information you provide and for keeping your account credentials secure.',
        ],
      },
      {
        heading: '2. Reservations',
        paragraphs: [
          'Submitting a reservation is a request, not a confirmed booking. Availability and final pricing are confirmed by our team before any campaign goes live. Displayed amounts are estimates and may vary based on availability, dates, and specifications.',
        ],
      },
      {
        heading: '3. Content and creatives',
        paragraphs: [
          'You retain ownership of the creatives you provide and are responsible for ensuring you have the rights to use them. Creatives must comply with applicable advertising standards and our guidelines.',
        ],
      },
      {
        heading: '4. Changes',
        paragraphs: [
          'We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the updated terms.',
        ],
      },
    ],
    cta: contactCta,
  },

  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro:
      'This policy explains what information Boardly collects, how we use it, and the choices you have.',
    updated: 'July 2026',
    sections: [
      {
        heading: 'Information we collect',
        bullets: [
          'Account details you provide, such as your name and email.',
          'Reservation and campaign information you submit.',
          'Basic usage data to operate and improve the platform.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use your information to provide the service, process reservation requests, communicate with you about your campaigns, and improve the platform. We do not sell your personal information.',
        ],
      },
      {
        heading: 'Data security',
        paragraphs: [
          'We take reasonable measures to protect your data, including hashed passwords and access controls. No system is perfectly secure, so please use a strong, unique password.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can access and update your account information at any time, or contact us to request changes to your data.',
        ],
      },
    ],
    cta: contactCta,
  },

  cookies: {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    intro: 'This policy explains how Boardly uses cookies and similar technologies.',
    updated: 'July 2026',
    sections: [
      {
        heading: 'What cookies we use',
        bullets: [
          'Essential cookies that keep you signed in and the platform working.',
          'Preference cookies that remember your settings.',
          'Analytics that help us understand and improve usage.',
        ],
      },
      {
        heading: 'Managing cookies',
        paragraphs: [
          'You can control cookies through your browser settings. Disabling essential cookies may affect core functionality, such as staying signed in.',
        ],
      },
    ],
    cta: contactCta,
  },
};

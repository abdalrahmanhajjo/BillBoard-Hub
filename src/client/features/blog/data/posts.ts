import type { BlogPost } from '@/client/features/blog/blog.types';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'billboard-advertising-lebanon-guide',
    title: 'A Practical Guide to Billboard Advertising in Lebanon',
    description:
      'Learn how to choose billboard formats, locations, campaign dates and budgets for an outdoor advertising campaign in Lebanon.',
    publishedAt: '2026-08-05',
    updatedAt: '2026-08-05',
    author: 'Boardly',
    readingMinutes: 8,
    keywords: [
      'billboard advertising Lebanon',
      'outdoor advertising Lebanon',
      'billboard campaign guide',
    ],
    image: '/images/formats/lebanon-highway-billboard.png',
    imageAlt: 'Highway billboard advertising location overlooking the Lebanese coast',
    sections: [
      {
        heading: 'Start with the campaign objective',
        paragraphs: [
          'A billboard plan should begin with the action or memory you want to create. Brand launches need broad, repeated visibility, while store-opening campaigns benefit from placements close to the destination. Defining the objective first prevents a high-traffic location from becoming an expensive but poorly matched choice.',
          'Write down the target geography, audience, campaign window and one measurable outcome before comparing inventory.',
        ],
      },
      {
        heading: 'Choose locations by audience movement',
        paragraphs: [
          'In Lebanon, city names alone are not enough. Direction of travel, road speed, nearby landmarks and congestion patterns affect how long the audience can see a message. Compare placements using monthly traffic, orientation and the environment around the board.',
        ],
        bullets: [
          'Use highway placements for repeated commuter reach.',
          'Use urban digital screens for timely messages and flexible creative rotation.',
          'Use street-level and mall formats when proximity and dwell time matter.',
        ],
      },
      {
        heading: 'Budget for media and production',
        paragraphs: [
          'The media rate is only one part of the campaign. Static boards require printing and installation, while digital screens require correctly sized creative and may rotate several advertisers. Confirm what the quoted price includes before approval.',
          'Browse Boardly inventory to compare monthly rates, dimensions and availability before submitting a reservation request.',
        ],
      },
    ],
  },
  {
    slug: 'digital-vs-static-billboards',
    title: 'Digital vs. Static Billboards: Which Format Should You Choose?',
    description:
      'Compare digital and static billboard advertising by visibility, flexibility, creative requirements, exclusivity and campaign objective.',
    publishedAt: '2026-08-12',
    updatedAt: '2026-08-12',
    author: 'Boardly',
    readingMinutes: 7,
    keywords: ['digital vs static billboard', 'digital billboard Lebanon', 'static billboard ads'],
    image: '/images/formats/beirut-digital-screen.png',
    imageAlt: 'Digital LED billboard at a busy Beirut intersection at night',
    sections: [
      {
        heading: 'When digital billboards work best',
        paragraphs: [
          'Digital screens make it possible to change creative without reprinting and to rotate different messages by campaign phase. They suit launches, events, time-sensitive offers and brands that need several creative variations in one location.',
          'Because digital inventory can rotate multiple advertisers, confirm slot duration, rotation count and expected share of voice.',
        ],
      },
      {
        heading: 'When static billboards work best',
        paragraphs: [
          'Static boards provide continuous presence during the booked period. They are effective for simple brand messages, directional campaigns and long-duration awareness where exclusivity matters more than rapid creative changes.',
          'Printing and installation require more lead time, so final artwork should be approved early.',
        ],
      },
      {
        heading: 'A simple decision framework',
        paragraphs: [
          'Choose the format that supports the campaign rather than treating digital as automatically better. Compare message frequency, campaign length, creative changes, production timing and the viewing environment.',
        ],
        bullets: [
          'Choose digital for flexibility and multiple messages.',
          'Choose static for uninterrupted presence and long-term recognition.',
          'Combine both when the campaign needs scale and timely reinforcement.',
        ],
      },
    ],
  },
  {
    slug: 'plan-nationwide-ooh-campaign-lebanon',
    title: 'How to Plan a Nationwide OOH Campaign in Lebanon',
    description:
      'Build a nationwide outdoor advertising plan across Beirut, Mount Lebanon, the North, Bekaa and the South without wasting coverage.',
    publishedAt: '2026-08-19',
    updatedAt: '2026-08-19',
    author: 'Boardly',
    readingMinutes: 9,
    keywords: [
      'nationwide OOH campaign Lebanon',
      'outdoor media planning Lebanon',
      'billboard campaign planning',
    ],
    image: '/images/inventory/featured-coastal-billboard.png',
    imageAlt: 'Large billboard beside a high-traffic coastal road in Lebanon',
    sections: [
      {
        heading: 'Build coverage around markets, not a map',
        paragraphs: [
          'Nationwide does not mean placing one billboard in every city. Start with the markets that contribute most to the objective, then identify the routes that connect residential, commercial and retail areas.',
          'Assign each market a role such as launch, reinforcement or directional support.',
        ],
      },
      {
        heading: 'Control frequency and duplication',
        paragraphs: [
          'Several boards on the same commuter path may create useful frequency, but overlapping placements can also consume budget without adding new reach. Group inventory by audience route and compare the purpose of each location.',
        ],
        bullets: [
          'Use a small number of high-impact anchor sites.',
          'Add supporting placements where they extend reach or improve frequency.',
          'Keep creative consistent enough to build recognition across regions.',
        ],
      },
      {
        heading: 'Coordinate dates and approvals',
        paragraphs: [
          'Availability can change while a plan is being reviewed. Reserve the most constrained sites first, keep replacement options, and centralize the final dates and creative specifications.',
          'Boardly’s campaign-planning workflow is designed to compare locations and submit structured reservation requests instead of coordinating through separate spreadsheets.',
        ],
      },
    ],
  },
  {
    slug: 'billboard-traffic-reach-estimates',
    title: 'How to Read Billboard Traffic and Reach Estimates',
    description:
      'Understand what billboard traffic counts mean, how they differ from reach and impressions, and how to compare outdoor locations responsibly.',
    publishedAt: '2026-08-26',
    updatedAt: '2026-08-26',
    author: 'Boardly',
    readingMinutes: 7,
    keywords: [
      'billboard traffic estimates',
      'billboard impressions',
      'measure outdoor advertising reach',
    ],
    image: '/images/inventory/featured-digital-intersection.png',
    imageAlt: 'Digital billboard at a high-traffic city intersection in Lebanon',
    sections: [
      {
        heading: 'Traffic is not the same as reach',
        paragraphs: [
          'A traffic count estimates movement past a location. Reach estimates the number of different people exposed, while impressions represent total exposure opportunities, including repeat journeys. Treating these numbers as interchangeable can overstate campaign performance.',
        ],
      },
      {
        heading: 'Compare visibility, not only volume',
        paragraphs: [
          'A location with lower traffic can outperform a larger road when the board is closer, better oriented or visible for longer. Road speed, angle, obstruction, lighting and message complexity all affect whether an exposure becomes noticeable.',
        ],
        bullets: [
          'Compare boards using the same reporting period.',
          'Ask how and when traffic was measured.',
          'Review photographs from the actual viewing direction.',
          'Use estimates for planning, not as guaranteed outcomes.',
        ],
      },
      {
        heading: 'Measure the campaign outcome',
        paragraphs: [
          'Connect the billboard plan to outcomes the business can observe: branded search, store visits, direct traffic, campaign codes or geographic lift. No single metric proves impact by itself, so define the measurement plan before launch.',
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

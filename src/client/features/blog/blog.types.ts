type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  readingMinutes: number;
  keywords: string[];
  image: string;
  imageAlt: string;
  sections: BlogSection[];
};

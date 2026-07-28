import Link from 'next/link';
import { Separator } from '@/client/ui/components/ui/separator';
import { Container } from '@/client/features/home/components/container';
import { BrandLogo } from '@/client/features/home/components/brand-logo';
import { FooterColumn } from '@/client/features/home/components/footer-column';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from '@/client/features/home/components/social-icons';
import {
  brandName,
  contactInfo,
  footerColumns,
  footerDescription,
  socialLinks,
} from '@/client/features/home/data/homepage';
import type { SocialKey } from '@/client/features/home/home.types';

const SOCIAL_ICONS: Record<SocialKey, (props: { className?: string }) => React.ReactElement> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <Container className="py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)_1.2fr] lg:gap-12">
          <div className="space-y-4">
            <BrandLogo markClassName="size-8" textClassName="text-lg" />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500">{footerDescription}</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-blue-200 hover:text-blue-600"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 lg:contents">
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} column={column} />
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>{contactInfo.location}</li>
              <li>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="inline-flex min-h-10 items-center transition-colors hover:text-zinc-900"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="inline-flex min-h-10 items-center transition-colors hover:text-zinc-900"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-zinc-200 lg:my-12" />

        <div className="flex flex-col gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {brandName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="transition-colors hover:text-zinc-900">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-zinc-900">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-zinc-900">
              Cookie Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

import { Container } from '@/client/features/home/components/container';
import { BrandCarousel } from '@/client/features/home/components/brand-carousel';
import { brands } from '@/client/features/home/data/homepage';

export function Brands() {
  return (
    <section className="border-b border-zinc-100 bg-white">
      <Container className="py-10 sm:py-14 lg:py-16">
        <p className="text-center text-sm font-semibold tracking-wider text-zinc-400 uppercase">
          Trusted by leading brands and agencies
        </p>
        <div className="mt-7 sm:mt-10">
          <BrandCarousel brands={brands} />
        </div>
      </Container>
    </section>
  );
}

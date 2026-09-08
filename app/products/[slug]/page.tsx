import { socialMetadata, brandImage } from '@/lib/social';
import { seedProducts } from '@/lib/content/catalog';
import { LocalProduct } from '@/components/local-pages';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = seedProducts.find((p) => p.slug === slug);
  if (!p) return { title: 'Piece not found' };
  return socialMetadata(
    p.name,
    p.description,
    `/products/${slug}`,
    seedProducts.some((item) => item.slug === slug)
      ? `/images/social/product-${slug}.jpg`
      : brandImage,
  );
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LocalProduct slug={slug} />;
}

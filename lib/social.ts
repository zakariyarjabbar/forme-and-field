import type { Metadata } from 'next';

export const brandDescription =
  'Furniture, lighting, and the spaces between. Explore considered pieces and thoughtfully composed rooms from FORME & FIELD.';
export const brandImage = '/images/social/home.jpg';

export function socialMetadata(
  title: string,
  description: string,
  path?: string,
  image = brandImage,
): Metadata {
  const displayTitle = title === 'FORME & FIELD' ? title : `${title} — FORME & FIELD`;
  const alt =
    image === brandImage
      ? 'FORME & FIELD — a warm, sunlit living room with a linen sofa, oak lounge chair and travertine side table.'
      : `${title} — FORME & FIELD`;
  return {
    title:
      title === 'FORME & FIELD'
        ? { absolute: 'FORME & FIELD — Furniture, lighting, and the spaces between.' }
        : title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      title: displayTitle,
      description,
      siteName: 'FORME & FIELD',
      locale: 'en_US',
      type: 'website',
      ...(path ? { url: path } : {}),
      images: [{ url: image, width: 1200, height: 630, type: 'image/jpeg', alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
      images: [{ url: image, alt }],
    },
  };
}

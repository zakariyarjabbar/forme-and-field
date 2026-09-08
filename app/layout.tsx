import { socialMetadata, brandDescription } from '@/lib/social';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { StoreProvider } from '@/components/store-provider';
import { session } from '@/lib/server/session';
import { state } from '@/lib/server/store';
const newsreader = localFont({
  src: [
    {
      path: '../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
const manrope = localFont({
  src: '../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  weight: '400 600',
  variable: '--font-manrope',
  display: 'swap',
  adjustFontFallback: 'Arial',
});
export const runtime = 'nodejs';
export const metadata: Metadata = {
  ...socialMetadata('FORME & FIELD', brandDescription),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'FORME & FIELD — Furniture, lighting, and the spaces between.',
    template: '%s — FORME & FIELD',
  },
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ws = await session();
  return (
    <html lang="en" className={`${newsreader.variable} ${manrope.variable}`}>
      <body>
        <StoreProvider initial={state(ws?.id)}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
        <noscript>
          <div className="noscript">
            Browsing works without JavaScript. Enable JavaScript to save pieces and use the
            simulated checkout.
          </div>
        </noscript>
      </body>
    </html>
  );
}

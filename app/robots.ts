import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', disallow: '/' },
      {
        userAgent: [
          'Discordbot',
          'facebookexternalhit',
          'Facebot',
          'Twitterbot',
          'Slackbot',
          'LinkedInBot',
          'WhatsApp',
          'TelegramBot',
        ],
        allow: '/',
        disallow: ['/account', '/admin', '/api', '/cart', '/checkout', '/wishlist', '/demo'],
      },
    ],
  };
}

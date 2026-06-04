import type { MetadataRoute } from 'next';

/**
 * @fileOverview Technical SEO Registry for Search Engine Crawlers.
 * Disallows indexing of sensitive workshop dossiers and personnel registries to maintain data sovereignty.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login'],
      disallow: [
        '/dashboard',
        '/customers',
        '/vehicles',
        '/bookings',
        '/services',
        '/job-cards',
        '/inventory',
        '/suppliers',
        '/invoices',
        '/payments',
        '/reports',
        '/staff',
        '/communications',
        '/audit-logs',
        '/settings',
        '/customer-portal',
      ],
    },
    sitemap: 'https://makros.ug/sitemap.xml',
  };
}

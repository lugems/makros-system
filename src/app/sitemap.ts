import type { MetadataRoute } from 'next';

/**
 * @fileOverview Technical Sitemap Registry.
 * Forensically restricts indexing to public entry points only.
 * Disallows discovery of sensitive workshop dossiers and internal management routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://makros.ug';
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}

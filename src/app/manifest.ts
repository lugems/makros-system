import type { MetadataRoute } from 'next';

/**
 * @fileOverview Programmatic Web App Manifest for the Makros System.
 * Synchronizes PWA parameters with the technical icon registry.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Makros System Professional Workshop OS',
    short_name: 'Makros System',
    description: 'Complete Garage Workshop Management System with AI Diagnostics',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#023891',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

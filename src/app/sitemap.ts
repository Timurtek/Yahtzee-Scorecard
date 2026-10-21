import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// One entry per real page. In-page sections (#how-to-play, #faq, …) are not
// separate URLs to a crawler, so they do not belong in the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}

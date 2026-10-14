import type { MetadataRoute } from 'next'
import { SITE_URL } from '@bconnect/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/signup',
        '/instagram',
        '/api/',
        '/calendar',
        '/messages',
        '/notifications',
        '/settings',
        '/storage',
        '/recommendations',
        '/profile$',
        '/profile/edit',
        '/profile/about/edit',
        '/profile/certifications',
        '/profile/coworkers',
        '/profile/recommendations',
        '/profile/posts',
      ],
    },
    sitemap: `${SITE_URL.career}/sitemap.xml`,
  }
}

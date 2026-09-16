import type { MetadataRoute } from 'next'
import { SITE_URL } from '@bconnect/config/site'

const isProdDeploy = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV) === 'production'

export default function robots(): MetadataRoute.Robots {
  if (!isProdDeploy) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/signup', '/instagram', '/api/'],
    },
    sitemap: `${SITE_URL.career}/sitemap.xml`,
  }
}

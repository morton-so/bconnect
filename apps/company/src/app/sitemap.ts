import type { MetadataRoute } from 'next'
import { SITE_URL } from '@bconnect/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.company
  return [
    { url: base },
    { url: `${base}/career` },
    { url: `${base}/one-click` },
    { url: `${base}/privacy` },
    { url: `${base}/terms` },
    { url: `${base}/marketing` },
  ]
}

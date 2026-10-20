const isProdDeploy = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV) === 'production'

export function noindexHeaders() {
  if (isProdDeploy) return []

  return [
    {
      source: '/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    },
  ]
}

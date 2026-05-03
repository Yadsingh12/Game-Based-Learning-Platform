import withPWAInit from 'next-pwa'

const withPWA = withPWAInit({
  dest:        'public',
  register:    true,
  skipWaiting: true,
  disable:     process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler:    'NetworkFirst',
      options: {
        cacheName:             'offlineCache',
        expiration:            { maxEntries: 200 },
        networkTimeoutSeconds: 15,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler:    'CacheFirst',
      options: {
        cacheName:  'images',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:mp4|webm)$/,
      handler:    'CacheFirst',
      options: {
        cacheName:  'videos',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/data\/packs\/.+\.json$/,
      handler:    'CacheFirst',
      options: {
        cacheName:  'pack-data',
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      handler:    'CacheFirst',
      options: {
        cacheName:  'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},       // ← tells Next.js 16 we acknowledge Turbopack
}

export default withPWA(nextConfig)
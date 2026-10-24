import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NutriStats — Nutrition Facts from USDA Data',
    short_name: 'NutriStats',
    description: 'Nutrition facts for every food, from official USDA data.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfaf5',
    theme_color: '#c2571b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}

import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/site'
import { allCategories, allFoods } from '@/lib/fdc'

/** 全量 URL:静态页 + 每食品一页 + 每类目一页 + 6 个排行页。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/rankings`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
  ]

  const foodEntries: MetadataRoute.Sitemap = allFoods().map((f) => ({
    url: `${BASE}/food/${f.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }))

  const categoryEntries: MetadataRoute.Sitemap = allCategories().map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const rankingEntries: MetadataRoute.Sitemap = ['protein', 'fiber', 'potassium', 'iron', 'vitC', 'calcium'].map(
    (key) => ({
      url: `${BASE}/rankings/${key}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }),
  )

  return [...staticEntries, ...rankingEntries, ...categoryEntries, ...foodEntries]
}

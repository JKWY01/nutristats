import Link from 'next/link'
import type { Metadata } from 'next'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE } from '@/lib/site'
import { allCategories, categoryCounts, meta } from '@/lib/fdc'

/** 食品类目目录:全部 USDA 类目。"list of foods with calories" 意图 + 内链枢纽。 */
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'All Food Categories — Browse Nutrition Facts',
  description: `Every USDA food category (${meta().foods.toLocaleString('en-US')} foods): vegetables, fruits, meats, dairy, grains, snacks and more, each food with full nutrition facts.`,
  alternates: { canonical: '/categories' },
}

export default function CategoriesPage() {
  const cats = [...allCategories()].sort(
    (a, b) => (categoryCounts()[b.slug] ?? 0) - (categoryCounts()[a.slug] ?? 0),
  )
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Foods' },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">Directory</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Browse foods</h1>
      <p className="mt-3 text-[15px] text-ink/65">
        {meta().foods.toLocaleString('en-US')} foods in {meta().categories} USDA categories, each
        with calories, macros, vitamins and minerals per 100g.
      </p>

      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {cats.map((c) => (
          <li key={c.slug} className="rounded-lg border border-ink/10 bg-white px-4 py-3">
            <Link href={`/category/${c.slug}`} className="group flex items-baseline justify-between gap-3">
              <span className="text-[14.5px] font-semibold group-hover:text-brand">{c.name}</span>
              <span className="text-[13px] text-ink/50">{categoryCounts()[c.slug] ?? 0} foods</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

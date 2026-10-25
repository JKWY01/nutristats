import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE } from '@/lib/site'
import { allCategories, categoryName, foodsInCategory } from '@/lib/fdc'
import FilterBox from '@/components/FilterBox'

/** 类目页:"vegetable calorie chart" / "fruits with protein" 意图。 */
export const revalidate = 86400

export function generateStaticParams() {
  return allCategories().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = categoryName(slug)
  if (!name) return {}
  const count = foodsInCategory(slug).length
  return {
    title: `${name} — Calories and Nutrition Facts (${count} Foods)`,
    description: `All ${count} ${name.toLowerCase()} in the USDA database with calories, protein, carbs and fat per 100g. One detailed page per food.`,
    alternates: { canonical: `/category/${slug}` },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const name = categoryName(slug)
  if (!name) notFound()
  const foods = [...foodsInCategory(slug)].sort(
    (a, b) => (a.n.kcal ?? 1e9) - (b.n.kcal ?? 1e9),
  )

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Foods', url: `${BASE}/categories` },
    { name },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {foods.length} foods · USDA SR Legacy
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{name} nutrition</h1>
      <p className="mt-3 text-[15px] text-ink/65">
        Every {name.toLowerCase().replace(/s$/, '')} in the USDA database, sorted by calories per
        100g (lowest first). Each row links to the full nutrition-facts page.
      </p>

      <AdSlot slot="category-top" />

      <FilterBox targetId="cat-table" placeholder="Filter foods…" />
      <div id="cat-table" className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-[13.5px] sticky-head">
          <thead>
            <tr className="border-b border-ink/10 text-left text-[12px] uppercase tracking-wider text-ink/45">
              <th className="px-4 py-2.5">Food</th>
              <th className="px-4 py-2.5 text-right">kcal</th>
              <th className="px-4 py-2.5 text-right">Protein</th>
              <th className="px-4 py-2.5 text-right">Carbs</th>
              <th className="px-4 py-2.5 text-right">Fat</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((f) => (
              <tr key={f.slug} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-2">
                  <Link href={`/food/${f.slug}`} className="font-medium hover:text-brand">
                    {f.desc}
                  </Link>
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {f.n.kcal != null ? Math.round(f.n.kcal) : '—'}
                </td>
                <td className="px-4 py-2 text-right text-ink/70">
                  {f.n.protein != null ? `${Math.round(f.n.protein * 10) / 10}g` : '—'}
                </td>
                <td className="px-4 py-2 text-right text-ink/70">
                  {f.n.carbs != null ? `${Math.round(f.n.carbs * 10) / 10}g` : '—'}
                </td>
                <td className="px-4 py-2 text-right text-ink/70">
                  {f.n.fat != null ? `${Math.round(f.n.fat * 10) / 10}g` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot slot="category-bottom" />

      <nav className="mt-8">
        <Link
          href="/categories"
          className="rounded-lg bg-ink px-4 py-2 text-[14px] font-semibold text-white hover:bg-ink/85"
        >
          All categories →
        </Link>
      </nav>
    </div>
  )
}

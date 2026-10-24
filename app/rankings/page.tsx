import Link from 'next/link'
import type { Metadata } from 'next'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, NUTRIENTS } from '@/lib/site'
import { topByNutrient } from '@/lib/fdc'

/** 排行榜索引 + 各榜内联 Top 10:"high protein foods" / "high fiber foods" 意图。 */
export const revalidate = 86400

const RANKINGS = [
  { key: 'protein', title: 'Highest-protein foods' },
  { key: 'fiber', title: 'Highest-fiber foods' },
  { key: 'potassium', title: 'Highest-potassium foods' },
  { key: 'iron', title: 'Highest-iron foods' },
  { key: 'vitC', title: 'Highest vitamin-C foods' },
  { key: 'calcium', title: 'Highest-calcium foods' },
] as const

export const metadata: Metadata = {
  title: 'Nutrition Rankings — Highest Protein, Fiber, Potassium Foods & More',
  description: 'Top-100 USDA foods by protein, fiber, potassium, iron, vitamin C and calcium per 100g — public-domain data, ranked honestly.',
  alternates: { canonical: '/rankings' },
}

export default function RankingsPage() {
  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Rankings' },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">Rankings</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Foods ranked by nutrient</h1>
      <p className="mt-3 text-[15px] text-ink/65">
        Top 10 below; each section links to the full top-100 list. Per 100g, USDA SR Legacy data —
        concentrated products (dried, powdered) naturally top these lists.
      </p>

      <div className="mt-8 space-y-10">
        {RANKINGS.map((r) => {
          const rows = topByNutrient(r.key, 10, { excludeCategories: [] })
          const unit = NUTRIENTS[r.key].unit
          return (
            <section key={r.key}>
              <h2 className="text-lg font-semibold tracking-tight">{r.title}</h2>
              <ol className="mt-3 divide-y divide-ink/8 text-[14px]">
                {rows.map((row, i) => (
                  <li key={row.food.slug} className="py-2">
                    <Link
                      href={`/food/${row.food.slug}`}
                      className="flex items-baseline justify-between gap-3 hover:text-brand"
                    >
                      <span className="font-medium">
                        <span className="mr-2 text-ink/40">{i + 1}</span>
                        {row.food.desc}
                      </span>
                      <span className="shrink-0 text-ink/55">
                        {Math.round(row.value * 10) / 10} {unit}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Link
                href={`/rankings/${r.key}`}
                className="mt-2 inline-block text-[13.5px] font-medium text-brand hover:underline"
              >
                Full top 100 →
              </Link>
            </section>
          )
        })}
      </div>
    </div>
  )
}

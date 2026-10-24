import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { breadcrumbLd } from '@/lib/jsonld'
import { BASE, NUTRIENTS } from '@/lib/site'
import { topByNutrient } from '@/lib/fdc'

/** 单营养素 Top 100:"foods highest in protein" 意图。 */
export const revalidate = 86400

const KEYS = ['protein', 'fiber', 'potassium', 'iron', 'vitC', 'calcium'] as const

export function generateStaticParams() {
  return KEYS.map((key) => ({ key }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>
}): Promise<Metadata> {
  const { key } = await params
  if (!KEYS.includes(key as (typeof KEYS)[number])) return {}
  const m = NUTRIENTS[key]
  return {
    title: `Top 100 Foods Highest in ${m.name}`,
    description: `The 100 USDA-database foods with the most ${m.name.toLowerCase()} per 100g, with exact values and a full nutrition page for each food.`,
    alternates: { canonical: `/rankings/${key}` },
  }
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  if (!KEYS.includes(key as (typeof KEYS)[number])) notFound()
  const m = NUTRIENTS[key]
  const rows = topByNutrient(key, 100)

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: 'Rankings', url: `${BASE}/rankings` },
    { name: `Highest ${m.name}` },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        Ranking · per 100g · USDA SR Legacy
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Top 100 foods highest in {m.name.toLowerCase()}
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">
        Ranked by {m.name.toLowerCase()} per 100g of food. Concentrated and dried products
        naturally rank high — check each food&rsquo;s page for per-serving values.
      </p>

      <AdSlot slot="ranking-top" />

      <ol className="mt-6 divide-y divide-ink/8 text-[14px]">
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
              <span className="shrink-0 font-semibold">
                {Math.round(row.value * 10) / 10} {m.unit}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <AdSlot slot="ranking-bottom" />

      <nav className="mt-8 flex flex-wrap gap-3 text-[14px]">
        <Link
          href="/rankings"
          className="rounded-lg bg-ink px-4 py-2 font-semibold text-white hover:bg-ink/85"
        >
          All rankings →
        </Link>
        <Link
          href="/categories"
          className="rounded-lg border border-ink/15 px-4 py-2 font-semibold text-ink hover:border-ink/35"
        >
          Browse foods
        </Link>
      </nav>
    </div>
  )
}

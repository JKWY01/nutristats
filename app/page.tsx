import Link from 'next/link'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { jsonLdScript } from '@/lib/jsonld'
import { BASE, SITE_NAME } from '@/lib/site'
import { allCategories, categoryCounts, meta, searchFoods, topByNutrient } from '@/lib/fdc'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Nutrition Facts for Every Food — Official USDA Data',
  description: `Calories, protein, carbs, fat, vitamins and minerals for thousands of foods, per 100g and per serving. Straight from the USDA FoodData Central database — public-domain data, no guesses.`,
  alternates: { canonical: '/' },
}

const COMMON_FOODS = [
  'banana', 'apple', 'chicken breast', 'egg', 'rice', 'oats', 'broccoli', 'almond',
  'avocado', 'salmon', 'potato', 'milk', 'peanut butter', 'greek yogurt', 'lentils', 'spinach',
]

export default function Home() {
  const m = meta()
  const popular = COMMON_FOODS.flatMap((q) => searchFoods(q, 1)).slice(0, 16)
  const topProtein = topByNutrient('protein', 5)
  const cats = [...allCategories()]
    .sort((a, b) => (categoryCounts()[b.slug] ?? 0) - (categoryCounts()[a.slug] ?? 0))
    .slice(0, 12)

  const siteLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${BASE}/`,
    description: 'Nutrition facts for every food from official USDA data.',
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteLd }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {m.foods.toLocaleString('en-US')} foods · {m.categories} categories
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Nutrition facts for every food
      </h1>
      <p className="mt-3 text-[15px] text-ink/65">
        Every number comes from the U.S. Department of Agriculture&rsquo;s FoodData Central
        database (SR Legacy release, public domain) — calories, macros, 26 vitamins and minerals
        per 100g, plus per-serving math on the official figures. One honest page per food.
      </p>

      <AdSlot slot="home-top" />

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Common foods</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {popular.map((f) => (
            <li key={f.slug} className="rounded-lg border border-ink/10 bg-white px-4 py-3">
              <Link href={`/food/${f.slug}`} className="group">
                <span className="block text-[14.5px] font-semibold group-hover:text-brand">
                  {f.desc}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink/55">
                  {f.n.kcal != null ? `${Math.round(f.n.kcal)} kcal` : ''} / 100g
                  {f.n.protein != null ? ` · ${Math.round(f.n.protein * 10) / 10}g protein` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="home-middle" />

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Browse categories</h2>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px] sm:grid-cols-3">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="font-medium hover:text-brand">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/categories"
          className="mt-3 inline-block rounded-lg bg-ink px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-ink/85"
        >
          All {m.categories} categories →
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Highest-protein foods</h2>
        <ol className="mt-3 divide-y divide-ink/8 text-[14px]">
          {topProtein.map((row, i) => (
            <li key={row.food.slug} className="py-2">
              <Link
                href={`/food/${row.food.slug}`}
                className="flex items-baseline justify-between gap-3 hover:text-brand"
              >
                <span className="font-medium">
                  <span className="mr-2 text-ink/40">{i + 1}</span>
                  {row.food.desc}
                </span>
                <span className="shrink-0 text-ink/55">{Math.round(row.value * 10) / 10}g / 100g</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link
          href="/rankings"
          className="mt-2 inline-block text-[13.5px] font-medium text-brand hover:underline"
        >
          All nutrition rankings →
        </Link>
      </section>
    </div>
  )
}

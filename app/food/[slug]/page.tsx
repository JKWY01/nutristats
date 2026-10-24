import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import { jsonLdScript, breadcrumbLd } from '@/lib/jsonld'
import { BASE, KEY_ORDER, NUTRIENTS, amount, perPortion } from '@/lib/site'
import { allFoods, categoryName, foodBySlug, foodsInCategory } from '@/lib/fdc'

/** 食品详情页:"calories in X" / "X protein per 100g" 长尾着陆页。 */
export const revalidate = 86400

export function generateStaticParams() {
  return allFoods().map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const f = foodBySlug(slug)
  if (!f) return {}
  const kcal = f.n.kcal != null ? `${Math.round(f.n.kcal)} kcal` : 'calories'
  return {
    title: `${f.desc} — Calories, Protein, Nutrition Facts (per 100g)`,
    description: `${f.desc}: ${kcal}, ${f.n.protein ?? '?'}g protein, ${f.n.carbs ?? '?'}g carbs, ${f.n.fat ?? '?'}g fat per 100g${f.p[0] ? `, plus per-serving values (${f.p[0].label} = ${f.p[0].g}g)` : ''}. Full vitamin and mineral profile from official USDA data.`,
    alternates: { canonical: `/food/${f.slug}` },
  }
}

export default async function FoodPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const f = foodBySlug(slug)
  if (!f) notFound()

  const catName = categoryName(f.cat) ?? 'Foods'
  const sameCat = foodsInCategory(f.cat)
    .filter((x) => x.slug !== f.slug)
    .slice(0, 8)
  const kcal = f.n.kcal
  const firstPortion = f.p[0]

  const faqLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...(kcal != null
        ? [
            {
              '@type': 'Question',
              name: `How many calories are in ${f.desc.toLowerCase()}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${f.desc} has ${Math.round(kcal)} calories per 100g${firstPortion ? `, which works out to about ${perPortion(kcal, firstPortion.g)} kcal per ${firstPortion.label}` : ''} (USDA SR Legacy data).`,
              },
            },
          ]
        : []),
      ...(f.n.protein != null
        ? [
            {
              '@type': 'Question',
              name: `How much protein is in ${f.desc.toLowerCase()}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${f.desc} provides ${amount(f.n.protein)}g of protein per 100g.`,
              },
            },
          ]
        : []),
      ...(f.n.carbs != null
        ? [
            {
              '@type': 'Question',
              name: `How many carbs are in ${f.desc.toLowerCase()}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${f.desc} has ${amount(f.n.carbs)}g total carbohydrate per 100g${f.n.fiber != null ? `, including ${amount(f.n.fiber)}g fiber` : ''}${f.n.sugars != null ? ` and ${amount(f.n.sugars)}g sugars` : ''}.`,
              },
            },
          ]
        : []),
    ],
  })

  const breadcrumb = breadcrumbLd([
    { name: 'Home', url: `${BASE}/` },
    { name: catName, url: `${BASE}/category/${f.cat}` },
    { name: f.desc },
  ])

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />

      <p className="text-[13px] font-semibold uppercase tracking-widest text-brand">
        {catName} · USDA SR Legacy · FDC #{f.id}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{f.desc}</h1>

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        {(
          [
            ['Calories', kcal != null ? `${Math.round(kcal)}` : '—', 'kcal / 100g'],
            ['Protein', f.n.protein != null ? `${amount(f.n.protein)}g` : '—', 'per 100g'],
            ['Carbs', f.n.carbs != null ? `${amount(f.n.carbs)}g` : '—', 'per 100g'],
            ['Fat', f.n.fat != null ? `${amount(f.n.fat)}g` : '—', 'per 100g'],
          ] as const
        ).map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-ink/10 bg-white p-4">
            <div className="text-[12px] font-medium uppercase tracking-wider text-ink/45">{label}</div>
            <div className="mt-1 text-xl font-bold">{value}</div>
            <div className="mt-0.5 text-[12px] text-ink/50">{sub}</div>
          </div>
        ))}
      </section>

      <AdSlot slot="food-below-cards" />

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Full nutrition facts per 100g</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-[13.5px]">
            <tbody>
              {KEY_ORDER.filter((k) => k in NUTRIENTS).map((key) => {
                const meta = NUTRIENTS[key]
                const v = f.n[key]
                return (
                  <tr key={key} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-2 text-ink/75">{meta.name}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {v != null ? amount(v) : '—'}
                      <span className="ml-1 text-[11px] font-normal text-ink/45">{meta.unit}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-ink/50">
          &ldquo;—&rdquo; means USDA published no value for this nutrient in this food — we never
          estimate.
        </p>
      </section>

      {f.p.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Common servings</h2>
          <p className="mt-1 text-[13px] text-ink/55">
            Proportional math on the official per-100g figures (serving weight × per-100g ÷ 100).
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-ink/10 bg-white">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-ink/10 text-left text-[12px] uppercase tracking-wider text-ink/45">
                  <th className="px-4 py-2.5">Serving</th>
                  <th className="px-4 py-2.5 text-right">Weight</th>
                  <th className="px-4 py-2.5 text-right">Calories</th>
                  <th className="px-4 py-2.5 text-right">Protein</th>
                  <th className="px-4 py-2.5 text-right">Carbs</th>
                </tr>
              </thead>
              <tbody>
                {f.p.map((p) => (
                  <tr key={p.label} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-2 font-medium">{p.label}</td>
                    <td className="px-4 py-2 text-right text-ink/70">{p.g}g</td>
                    <td className="px-4 py-2 text-right font-semibold">{perPortion(kcal, p.g)}</td>
                    <td className="px-4 py-2 text-right">
                      {f.n.protein != null ? `${perPortion(f.n.protein, p.g, 1)}g` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {f.n.carbs != null ? `${perPortion(f.n.carbs, p.g, 1)}g` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {sameCat.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">More in {catName}</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-2">
            {sameCat.map((x) => (
              <li key={x.slug} className="flex items-baseline justify-between gap-3 border-b border-ink/5 py-1.5">
                <Link href={`/food/${x.slug}`} className="truncate font-medium hover:text-brand">
                  {x.desc}
                </Link>
                <span className="shrink-0 text-[12.5px] text-ink/50">
                  {x.n.kcal != null ? `${Math.round(x.n.kcal)} kcal` : ''}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={`/category/${f.cat}`}
            className="mt-3 inline-block text-[14px] font-medium text-brand hover:underline"
          >
            All {catName.toLowerCase()} →
          </Link>
        </section>
      ) : null}
    </div>
  )
}

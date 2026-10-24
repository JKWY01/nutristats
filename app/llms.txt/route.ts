import { NextResponse } from 'next/server'
import { BASE, SITE_NAME } from '@/lib/site'
import { meta } from '@/lib/fdc'

/** llms.txt:给 AI 爬虫/agent 的站点说明书(AI 原生分发的入场券)。 */
export const revalidate = 86400

export function GET(): Response {
  const m = meta()
  const body = `# ${SITE_NAME}

> Nutrition facts for every food, from official USDA data. ${m.foods.toLocaleString('en-US')} foods across ${m.categories} categories, 26 nutrients per food.
> Live at ${BASE} . Public-domain U.S. federal data; AI crawlers and agents are welcome.

## Endpoints

- ${BASE}/api/food?slug=<food-slug> — full nutrient profile for one food (per 100g + serving portions)
- ${BASE}/api/food?q=<keyword> — search foods by keyword
- ${BASE}/sitemap.xml — full URL list

## Pages

- /food/<slug> — one page per food: calories/macros/vitamins per 100g + per-serving proportional math
- /category/<slug> — all foods in a USDA category, sorted by calories
- /rankings/<nutrient> — top-100 foods by protein/fiber/potassium/iron/vitamin C/calcium per 100g

## Facts & policy

- Source: USDA FoodData Central, SR Legacy release ${m.release} (public domain, U.S. federal work).
- Values are per 100g as published; per-serving values are proportional math (serving grams × per-100g ÷ 100), labeled as such.
- "—" means USDA published no value — never an estimate.
`
  return new NextResponse(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' },
  })
}

import { NextResponse } from 'next/server'
import { allCategories, foodBySlug, meta, searchFoods } from '@/lib/fdc'

/** 机器可读端点(agent/MCP 友好):?slug= 单食品全量营养;?q= 关键词搜索;无参 = 数据集概览。
 *  CORS 全开:USDA 数据是公共领域,欢迎任何客户端与 AI agent 引用。 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const q = searchParams.get('q')

  if (slug) {
    const f = foodBySlug(slug)
    if (!f) return NextResponse.json({ error: 'unknown food slug' }, { status: 404 })
    return NextResponse.json(
      { food: f, basis: 'per 100g', source: 'USDA FoodData Central, SR Legacy 2021-10-28' },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=86400' } },
    )
  }

  if (q) {
    const rows = searchFoods(q, 30)
    return NextResponse.json(
      { query: q, results: rows.map((f) => ({ slug: f.slug, desc: f.desc, kcal: f.n.kcal ?? null })) },
      { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' } },
    )
  }

  return NextResponse.json(
    {
      dataset: meta(),
      categories: allCategories().length,
      usage: '?slug=<food-slug> for full nutrients; ?q=<keyword> to search',
      source: 'USDA FoodData Central, SR Legacy 2021-10-28 (public domain)',
    },
    { headers: { 'access-control-allow-origin': '*', 'cache-control': 'public, max-age=3600' } },
  )
}

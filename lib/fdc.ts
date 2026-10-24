/** USDA FDC SR Legacy 数据访问层。
 *
 * 数据在 data/fdc-sr.json(同步脚本写入,随仓库分发),站点读路径零外呼。
 * 纪律:数值要么来自 USDA 原表,要么缺失(null);份量数值是 per-100g 的等比换算,页面注明。
 */

import raw from '@/data/fdc-sr.json'

export interface Portion {
  /** 该份的克重 */
  g: number
  /** 展示标签,如 "1 cup, sliced" */
  label: string
}

export interface Food {
  /** FDC ID */
  id: number
  slug: string
  /** USDA 原始描述,如 "Bananas, raw" */
  desc: string
  /** 类目 slug */
  cat: string
  /** per-100g 营养素;键名见 lib/site.ts NUTRIENTS,缺失为 null */
  n: Record<string, number | null>
  p: Portion[]
}

interface DataShape {
  meta: { source: string; release: string; foods: number; categories: number }
  categories: Array<{ slug: string; name: string }>
  foods: Food[]
}

const DATA = raw as unknown as DataShape

const BY_SLUG = new Map<string, Food>(DATA.foods.map((f) => [f.slug, f]))
const CAT_SLUG_TO_NAME = new Map<string, string>(DATA.categories.map((c) => [c.slug, c.name]))

export function meta() {
  return DATA.meta
}

export function allFoods(): Food[] {
  return DATA.foods
}

export function allCategories(): Array<{ slug: string; name: string }> {
  return DATA.categories
}

export function foodBySlug(slug: string): Food | null {
  return BY_SLUG.get(slug) ?? null
}

export function categoryName(slug: string): string | null {
  return CAT_SLUG_TO_NAME.get(slug) ?? null
}

export function foodsInCategory(catSlug: string): Food[] {
  return DATA.foods.filter((f) => f.cat === catSlug)
}

/** 类目内食品数(目录页展示)。 */
export function categoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const f of DATA.foods) counts[f.cat] = (counts[f.cat] ?? 0) + 1
  return counts
}

/** 标题词匹配(目录页的降级检索:按描述前缀/包含)。 */
export function searchFoods(q: string, limit = 30): Food[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  const starts: Food[] = []
  const contains: Food[] = []
  for (const f of DATA.foods) {
    const d = f.desc.toLowerCase()
    if (d.startsWith(needle)) {
      starts.push(f)
      if (starts.length >= limit) break
    } else if (d.includes(needle) && contains.length < limit) {
      contains.push(f)
    }
  }
  return [...starts, ...contains].slice(0, limit)
}

export interface RankedFood {
  food: Food
  value: number
}

/** 某营养素排行(降序,只取有值者;排除类目 "supplements" 之外的奇怪项由调用方决定)。 */
export function topByNutrient(key: string, limit = 100, opts?: { excludeCategories?: string[] }): RankedFood[] {
  const ex = new Set(opts?.excludeCategories ?? [])
  const rows: RankedFood[] = []
  for (const f of DATA.foods) {
    if (ex.has(f.cat)) continue
    const v = f.n[key]
    if (v != null) rows.push({ food: f, value: v })
  }
  rows.sort((a, b) => b.value - a.value)
  return rows.slice(0, limit)
}

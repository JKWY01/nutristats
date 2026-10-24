#!/usr/bin/env node
/**
 * USDA FoodData Central SR Legacy 同步。
 *
 *   源  fdc.nal.usda.gov 免鉴权全量包(FoodData_Central_sr_legacy_food_json_2021-10-28.zip,
 *        ~12.5MB,解压后单个大 JSON)。SR Legacy 是 USDA 标准参考库的最终版,公共领域。
 *        下载链:USDA 直连 → Wayback id_ 快照兜底。
 *
 *   纪律  数值要么来自 USDA 原表,要么缺失(null);份量页的换算是 per-100g 的等比乘法,页面注明。
 *
 * 运行:`node scripts/sync-fdc.mjs`。幂等:数据本体无变化不写文件。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_PATH = join(ROOT, 'data', 'fdc-sr.json')
const TMP = join(ROOT, '.fdc-tmp')
const FILE = 'FoodData_Central_sr_legacy_food_json_2021-10-28'
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

/** USDA 营养素编号 → 站内键(与 lib/site.ts NUTRIENTS 对齐)。 */
const NUTRIENT_MAP = {
  '208': 'kcal',
  '203': 'protein',
  '204': 'fat',
  '606': 'satFat',
  '605': 'transFat',
  '205': 'carbs',
  '291': 'fiber',
  '269': 'sugars',
  '601': 'cholesterol',
  '301': 'calcium',
  '303': 'iron',
  '304': 'magnesium',
  '306': 'potassium',
  '307': 'sodium',
  '309': 'zinc',
  '320': 'vitA',
  '401': 'vitC',
  '323': 'vitE',
  '430': 'vitK',
  '404': 'thiamin',
  '405': 'riboflavin',
  '406': 'niacin',
  '415': 'b6',
  '417': 'folate',
  '418': 'b12',
  '262': 'caffeine',
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function download() {
  const urls = [
    `https://fdc.nal.usda.gov/fdc-datasets/${FILE}.zip`,
    `https://web.archive.org/web/2026id_/https://fdc.nal.usda.gov/fdc-datasets/${FILE}.zip`,
  ]
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: '*/*' },
        redirect: 'follow',
        signal: AbortSignal.timeout(600_000),
      })
      if (!res.ok) {
        console.log(`[sync-fdc] ${url} → HTTP ${res.status}`)
        continue
      }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 500_000 || !buf.subarray(0, 2).equals(Buffer.from('PK'))) {
        console.log(`[sync-fdc] ${url} → not a zip (${buf.length}B)`)
        continue
      }
      mkdirSync(TMP, { recursive: true })
      const zipPath = join(TMP, 'sr.zip')
      writeFileSync(zipPath, buf)
      execFileSync('unzip', ['-o', zipPath, '-d', TMP], { stdio: 'pipe' })
      const jsonPath = execFileSync('find', [TMP, '-name', `${FILE}.json`], { encoding: 'utf8' })
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean)[0]
      if (!jsonPath) throw new Error('no json inside zip')
      console.log(`[sync-fdc] ${url} OK (${(buf.length / 1e6).toFixed(1)}MB)`)
      return jsonPath
    } catch (err) {
      console.log(`[sync-fdc] ${url} → ${err.message}`)
    }
  }
  throw new Error('all FDC candidates failed')
}

function portionLabel(p) {
  const amount = p.amount ?? 1
  const unit = p.measureUnit?.name ?? ''
  const mod = p.modifier ? `, ${p.modifier}` : ''
  const seq = p.sequence ? ` #${p.sequence}` : ''
  return `${amount} ${unit}${mod}${seq}`.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim()
}

async function main() {
  const jsonPath = await download()
  const require = createRequire(import.meta.url)
  const doc = JSON.parse(readFileSync(jsonPath, 'utf8'))
  const legacy = doc.SRLegacyFoods
  if (!Array.isArray(legacy) || legacy.length < 7000) {
    throw new Error(`payload sanity failed: ${legacy?.length ?? 0} foods`)
  }

  const categories = new Map()
  const foods = []
  const slugSeen = new Map()

  for (const f of legacy) {
    const catName = f.foodCategory?.description ?? 'Other'
    if (!categories.has(catName)) {
      categories.set(catName, { slug: slugify(catName), name: catName })
    }
    const cat = categories.get(catName)

    let slug = slugify(f.description)
    if (!slug) slug = `food-${f.fdcId}`
    if (slugSeen.has(slug)) {
      const n = slugSeen.get(slug) + 1
      slugSeen.set(slug, n)
      slug = `${slug}-${n}`
    } else {
      slugSeen.set(slug, 1)
    }

    const n = {}
    for (const fn of f.foodNutrients ?? []) {
      const key = NUTRIENT_MAP[String(fn.nutrient?.number ?? fn.number ?? '')]
      if (key && typeof fn.amount === 'number') n[key] = fn.amount
    }

    const p = (f.foodPortions ?? [])
      .filter((x) => typeof x.gramWeight === 'number' && x.gramWeight > 0)
      .slice(0, 4)
      .map((x) => ({ g: Math.round(x.gramWeight), label: portionLabel(x) }))

    foods.push({ id: f.fdcId, slug, desc: f.description, cat: cat.slug, n, p })
  }

  const catList = [...categories.values()].sort((a, b) => a.name.localeCompare(b.name))
  if (foods.length < 7000 || catList.length < 20) {
    throw new Error(`parse sanity failed: foods=${foods.length} cats=${catList.length}`)
  }

  const payload = {
    meta: {
      source: 'USDA FoodData Central — SR Legacy',
      release: '2021-10-28',
      fetched_at: new Date().toISOString(),
      foods: foods.length,
      categories: catList.length,
    },
    categories: catList,
    foods: foods.sort((a, b) => a.desc.localeCompare(b.desc)),
  }

  const prev = existsSync(DATA_PATH) ? JSON.parse(readFileSync(DATA_PATH, 'utf8')) : null
  const sameData =
    prev &&
    JSON.stringify(prev.categories) === JSON.stringify(payload.categories) &&
    JSON.stringify(prev.foods) === JSON.stringify(payload.foods)
  if (sameData) {
    console.log(`[sync-fdc] foods=${foods.length} cats=${catList.length} — no change, skip write`)
    return
  }

  mkdirSync(join(ROOT, 'data'), { recursive: true })
  writeFileSync(DATA_PATH, JSON.stringify(payload) + '\n')
  console.log(`[sync-fdc] foods=${foods.length} cats=${catList.length} — written`)
}

main()
  .catch((err) => {
    console.error(`[sync-fdc] failed: ${err.message}`)
    process.exitCode = 1
  })
  .finally(() => {
    try {
      rmSync(TMP, { recursive: true, force: true })
    } catch {
      try {
        execFileSync('rm', ['-rf', TMP], { stdio: 'ignore' })
      } catch {
        /* 留给 runner */
      }
    }
  })

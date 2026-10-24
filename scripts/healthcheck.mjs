#!/usr/bin/env node
/**
 * 线上体检(放养哨兵):每天从 GitHub Actions 对真站黑盒检查。
 * 全过 → 静默退出 0;任一失败 → 退出 1(workflow 自动开 issue 报警)。
 */

const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '')
if (!SITE_URL) {
  console.error('[health] SITE_URL not configured')
  process.exit(1)
}

const failures = []
const check = async (name, fn) => {
  try {
    await fn()
    console.log(`[health] ✓ ${name}`)
  } catch (err) {
    failures.push(name)
    console.error(`[health] ✗ ${name}: ${err.message}`)
  }
}

const get = async (path, timeout = 30_000) => {
  const res = await fetch(`${SITE_URL}${path}`, {
    signal: AbortSignal.timeout(timeout),
    headers: { 'User-Agent': 'nutristats-healthcheck' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

await check('home renders with USDA attribution', async () => {
  const html = await get('/')
  if (!/USDA/i.test(html)) throw new Error('no USDA attribution')
  if (!/Nutrition facts/i.test(html)) throw new Error('missing hero copy')
})

await check('api returns a food profile', async () => {
  const search = JSON.parse(await get('/api/food?q=banana'))
  if (!search.results?.length) throw new Error('search returned nothing')
  const body = JSON.parse(await get(`/api/food?slug=${search.results[0].slug}`))
  if (!body.food?.n?.kcal) throw new Error('missing kcal')
})

await check('food page renders facts table', async () => {
  const search = JSON.parse(await get('/api/food?q=banana'))
  const html = await get(`/food/${search.results[0].slug}`)
  if (!/per 100g/i.test(html)) throw new Error('missing per-100g table')
  if (!/Nutrition facts/i.test(html) && !/nutrition/i.test(html)) throw new Error('missing nutrition copy')
})

await check('category page renders a food table', async () => {
  const html = await get('/category/vegetables-and-vegetable-products')
  if (!/<table/i.test(html) && !/foods/i.test(html)) throw new Error('no food listing')
})

await check('ranking page lists 100 items', async () => {
  const html = await get('/rankings/protein')
  const count = (html.match(/\/food\//g) ?? []).length
  if (count < 50) throw new Error(`only ${count} food links`)
})

await check('sitemap lists the food matrix', async () => {
  const xml = await get('/sitemap.xml', 60_000)
  if (!xml.includes('<urlset')) throw new Error('not a urlset')
  const count = (xml.match(/<url>/g) ?? []).length
  if (count < 7000) throw new Error(`only ${count} URLs`)
})

await check('llms.txt documents the API', async () => {
  const body = await get('/llms.txt')
  if (!body.includes('/api/food')) throw new Error('api not documented')
})

if (failures.length > 0) {
  console.error(`[health] FAILED: ${failures.join(' | ')}`)
  process.exit(1)
}
console.log('[health] all checks passed')

import { describe, expect, it } from 'vitest'
import {
  allCategories,
  allFoods,
  categoryName,
  foodBySlug,
  foodsInCategory,
  meta,
  searchFoods,
  topByNutrient,
} from '@/lib/fdc'

const HAS_DATA = allFoods().length > 0

describe.skipIf(!HAS_DATA)('FDC data integrity', () => {
  it('has a sane dataset size', () => {
    expect(allFoods().length).toBeGreaterThanOrEqual(7000)
    expect(allCategories().length).toBeGreaterThanOrEqual(20)
  })

  it('food slugs are unique', () => {
    expect(new Set(allFoods().map((f) => f.slug)).size).toBe(allFoods().length)
  })

  it('every food has a valid category', () => {
    const cats = new Set(allCategories().map((c) => c.slug))
    for (const f of allFoods()) expect(cats.has(f.cat), f.desc).toBe(true)
  })

  it('anchor: a raw banana has plausible values', () => {
    const banana = allFoods().find((f) => /^bananas, raw$/i.test(f.desc))
    expect(banana).toBeDefined()
    expect(banana!.n.kcal).toBeGreaterThan(70)
    expect(banana!.n.kcal).toBeLessThan(110)
    expect(banana!.n.potassium).toBeGreaterThan(300)
  })

  it('rankings sort descending', () => {
    const rows = topByNutrient('protein', 50)
    expect(rows.length).toBe(50)
    for (let i = 1; i < rows.length; i += 1) {
      expect(rows[i].value).toBeLessThanOrEqual(rows[i - 1].value)
    }
  })

  it('category lookups are consistent', () => {
    for (const c of allCategories()) {
      expect(foodsInCategory(c.slug).length, c.name).toBeGreaterThan(0)
    }
    expect(categoryName('not-a-cat')).toBeNull()
  })
})

describe('accessors degrade honestly', () => {
  it('unknown slugs return null', () => {
    expect(foodBySlug('unicorn-meat')).toBeNull()
    expect(searchFoods('')).toEqual([])
  })
})

describe.skipIf(!HAS_DATA)('meta', () => {
  it('declares the USDA source', () => {
    expect(meta().source).toContain('USDA')
    expect(meta().release).toBe('2021-10-28')
  })
})

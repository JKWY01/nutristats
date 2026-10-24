/** 站点身份与全局常量。域名未配置时用 localhost(本地开发),部署时必填 NEXT_PUBLIC_SITE_URL。 */
export const SITE_NAME = 'NutriStats'
export const SITE_TAGLINE = 'Nutrition facts for every food, from official USDA data'
export const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
export const DATA_SOURCE = 'USDA FoodData Central — SR Legacy (2021-10-28 release)'

/** 营养素的单位与展示名(nutrient number → 站内键名,与同步脚本一致)。 */
export const NUTRIENTS: Record<string, { name: string; unit: string; per: '100g' }> = {
  kcal: { name: 'Calories', unit: 'kcal', per: '100g' },
  protein: { name: 'Protein', unit: 'g', per: '100g' },
  fat: { name: 'Total fat', unit: 'g', per: '100g' },
  satFat: { name: 'Saturated fat', unit: 'g', per: '100g' },
  transFat: { name: 'Trans fat', unit: 'g', per: '100g' },
  carbs: { name: 'Total carbohydrate', unit: 'g', per: '100g' },
  fiber: { name: 'Fiber', unit: 'g', per: '100g' },
  sugars: { name: 'Sugars', unit: 'g', per: '100g' },
  cholesterol: { name: 'Cholesterol', unit: 'mg', per: '100g' },
  calcium: { name: 'Calcium', unit: 'mg', per: '100g' },
  iron: { name: 'Iron', unit: 'mg', per: '100g' },
  magnesium: { name: 'Magnesium', unit: 'mg', per: '100g' },
  potassium: { name: 'Potassium', unit: 'mg', per: '100g' },
  sodium: { name: 'Sodium', unit: 'mg', per: '100g' },
  zinc: { name: 'Zinc', unit: 'mg', per: '100g' },
  vitC: { name: 'Vitamin C', unit: 'mg', per: '100g' },
  thiamin: { name: 'Thiamin (B1)', unit: 'mg', per: '100g' },
  riboflavin: { name: 'Riboflavin (B2)', unit: 'mg', per: '100g' },
  niacin: { name: 'Niacin (B3)', unit: 'mg', per: '100g' },
  b6: { name: 'Vitamin B6', unit: 'mg', per: '100g' },
  folate: { name: 'Folate (DFE)', unit: 'µg', per: '100g' },
  b12: { name: 'Vitamin B12', unit: 'µg', per: '100g' },
  vitA: { name: 'Vitamin A (RAE)', unit: 'µg', per: '100g' },
  vitE: { name: 'Vitamin E', unit: 'mg', per: '100g' },
  vitK: { name: 'Vitamin K', unit: 'µg', per: '100g' },
  caffeine: { name: 'Caffeine', unit: 'mg', per: '100g' },
}

/** 每页主表展示的顺序(其余营养素收进完整表)。 */
export const KEY_ORDER = [
  'kcal', 'protein', 'fat', 'satFat', 'transFat', 'carbs', 'fiber', 'sugars', 'cholesterol',
  'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc', 'vitA', 'vitC', 'vitE', 'vitK',
  'thiamin', 'riboflavin', 'niacin', 'b6', 'folate', 'b12', 'caffeine',
] as const

export function amount(n: number | null | undefined, digits = 1): string {
  if (n == null) return '—'
  return n >= 100 ? Math.round(n).toLocaleString('en-US') : String(Number(n.toFixed(digits)))
}

/** 份量换算:per-100g 数值 × gramWeight/100 —— 对官方数字的等比换算,不是估算。 */
export function perPortion(n: number | null | undefined, gramWeight: number, digits = 0): string | null {
  if (n == null) return null
  return amount((n * gramWeight) / 100, digits)
}

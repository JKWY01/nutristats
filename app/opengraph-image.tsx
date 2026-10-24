import { ImageResponse } from 'next/og'
import { BASE, SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start', padding: 80,
        background: 'linear-gradient(135deg, #c2571b 0%, #111111 160%)', color: '#ffffff',
      }}>
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.85 }}>{BASE.replace('https://', '')}</div>
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, marginTop: 16 }}>NutriStats</div>
        <div style={{ display: 'flex', fontSize: 40, opacity: 0.92, marginTop: 20, maxWidth: 900 }}>Nutrition facts for every food, from official USDA data</div>
      </div>
    ),
    size,
  )
}

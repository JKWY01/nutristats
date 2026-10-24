import Link from 'next/link'
import { DATA_SOURCE } from '@/lib/site'
import { meta } from '@/lib/fdc'

export default function Footer() {
  const m = meta()
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 text-[13px] leading-relaxed text-ink/55">
        <p>
          All nutrition values come from{' '}
          <a
            href="https://fdc.nal.usda.gov/"
            className="underline decoration-ink/30 underline-offset-2 hover:text-ink"
            rel="noopener noreferrer"
            target="_blank"
          >
            {DATA_SOURCE}
          </a>
          , a U.S. federal public-domain dataset — {m.foods.toLocaleString('en-US')} foods across{' '}
          {m.categories} categories. Serving values are simple proportional math on the official
          per-100g figures. Where USDA lists no value, we show &ldquo;—&rdquo;, never an estimate.
        </p>
        <p className="mt-3">
          <Link href="/sitemap.xml" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
            Sitemap
          </Link>{' '}
          ·{' '}
          <Link href="/llms.txt" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
            llms.txt
          </Link>{' '}
          ·{' '}
          <Link href="/api/food" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
            JSON API
          </Link>
        </p>
      </div>
    </footer>
  )
}

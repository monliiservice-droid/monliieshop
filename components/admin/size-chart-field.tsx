'use client'

import { useEffect, useState } from 'react'
import { ImageField } from '@/components/admin/image-field'

type Chart = { url: string; label: string }

/** Tabulka velikostí u produktu: nahrát novou, nebo vybrat některou, kterou už e-shop používá */
export function SizeChartField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [charts, setCharts] = useState<Chart[]>([])

  useEffect(() => {
    fetch('/api/admin/size-charts')
      .then((res) => (res.ok ? res.json() : []))
      .then(setCharts)
      .catch(() => setCharts([]))
  }, [])

  return (
    <div className="space-y-4">
      <ImageField
        label="Tabulka velikostí"
        value={value}
        onChange={onChange}
        aspect="wide"
        graphic
        hint="Na webu se zobrazí celá pod popisem produktu. Když necháte prázdné, podprsenky a sety dostanou výchozí měřicí tabulku."
      />
      {charts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Nebo vyberte existující</p>
          <div className="flex flex-wrap gap-2">
            {charts.map((chart) => (
              <button
                key={chart.url}
                type="button"
                onClick={() => onChange(chart.url)}
                title={chart.label}
                aria-pressed={value === chart.url}
                className={`w-28 overflow-hidden rounded-md border bg-white text-left text-[11px] leading-tight transition-colors ${value === chart.url ? 'border-gray-900 ring-1 ring-gray-900' : 'hover:border-gray-400'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={chart.url} alt="" className="h-20 w-full object-contain p-1" loading="lazy" />
                <span className="block truncate border-t px-1.5 py-1 text-gray-600">{chart.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

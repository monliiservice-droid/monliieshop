'use client'

/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react'
import { splitImage, withFocus } from '@/lib/image-focus'

/**
 * Výběr výřezu: kliknutím (nebo tažením) na fotku zvolíte bod, který má při ořezu zůstat vidět.
 * Náhledy ukazují, jak fotka vyjde v rámečku na šířku a na výšku.
 */
export function FocusPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { src, x, y } = splitImage(value)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragging = useRef(false)

  const setFrom = (clientX: number, clientY: number) => {
    const rect = imgRef.current?.getBoundingClientRect()
    if (!rect) return
    onChange(withFocus(src, ((clientX - rect.left) / rect.width) * 100, ((clientY - rect.top) / rect.height) * 100))
  }
  const position = `${x}% ${y}%`

  return (
    <div className="space-y-3 rounded-lg border bg-gray-50 p-3">
      <p className="text-xs text-gray-600">Klikněte na místo, které má zůstat vidět (např. obličej nebo výrobek). Web pak fotku ořízne kolem něj.</p>
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="relative inline-block cursor-crosshair touch-none select-none"
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            setFrom(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => dragging.current && setFrom(e.clientX, e.clientY)}
          onPointerUp={() => (dragging.current = false)}
        >
          <img ref={imgRef} src={src} alt="" draggable={false} className="block max-h-72 max-w-full rounded" />
          <span
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.6)]"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Náhled ořezu</p>
          <div className="flex items-end gap-2">
            <div className="text-center text-[11px] text-gray-500">
              <img src={src} alt="" className="h-20 w-[183px] rounded object-cover" style={{ objectPosition: position }} />
              na šířku
            </div>
            <div className="text-center text-[11px] text-gray-500">
              <img src={src} alt="" className="h-28 w-[90px] rounded object-cover" style={{ objectPosition: position }} />
              na výšku
            </div>
          </div>
          <button type="button" onClick={() => onChange(src)} className="text-xs text-gray-600 underline">Zpět na střed</button>
        </div>
      </div>
    </div>
  )
}

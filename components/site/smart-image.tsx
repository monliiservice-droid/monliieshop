'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { splitImage } from '@/lib/image-focus'

/** Obrázky z našeho webu a z Vercel Blob se optimalizují; libovolná jiná URL (vložená v adminu) se načte přímo */
export function isOptimizable(src: string): boolean {
  return src.startsWith('/') || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src)
}

/** Zvětší délky v atributu sizes (jen hodnoty, ne podmínky v závorkách) */
export function scaleSizes(sizes: string, factor: number): string {
  return sizes
    .split(',')
    .map((part) => part.replace(/(\d+(?:\.\d+)?)(vw|px)\s*$/, (_, n: string, unit: string) => `${Math.ceil(parseFloat(n) * factor)}${unit}`))
    .join(',')
}

/**
 * Obrázek s optimalizací. U ořezávaných obrázků (fill) se po načtení porovná tvar fotky s rámečkem:
 * fotka na šířku v rámečku na výšku se zvětší a ořízne, takže potřebuje větší rozlišení, než říká `sizes`.
 * V tom případě se `sizes` zvětší a prohlížeč si dotáhne ostřejší verzi.
 */
export function SmartImage({ src: value, alt, sizes, onLoad, style, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  const [factor, setFactor] = useState(1)
  // Výřez zvolený v administraci (#focus=x,y v adrese) – ořez se drží kolem něj
  const { src, x, y } = splitImage(value)

  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={!isOptimizable(src)}
      style={x !== 50 || y !== 50 ? { ...style, objectPosition: `${x}% ${y}%` } : style}
      sizes={sizes && factor > 1 ? scaleSizes(sizes, factor) : sizes}
      onLoad={(event) => {
        onLoad?.(event)
        const img = event.currentTarget
        if (!props.fill || !sizes || !img.naturalWidth || !img.clientWidth || !img.clientHeight) return
        const needed = img.naturalWidth / img.naturalHeight / (img.clientWidth / img.clientHeight)
        // Při drobném rozdílu nic nedotahujeme; jinak zaokrouhlit nahoru na desetiny
        if (needed > 1.1) setFactor((current) => Math.max(current, Math.ceil(needed * 10) / 10))
      }}
      {...props}
    />
  )
}

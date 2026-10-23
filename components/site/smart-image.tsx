import Image, { type ImageProps } from 'next/image'

/** Obrázky z našeho webu a z Vercel Blob se optimalizují; libovolná jiná URL (vložená v adminu) se načte přímo */
export function isOptimizable(src: string): boolean {
  return src.startsWith('/') || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src)
}

export function SmartImage({ src, alt, ...props }: Omit<ImageProps, 'src'> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!isOptimizable(src)} {...props} />
}

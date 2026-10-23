import Link from 'next/link'

export function NotFoundContent({ title, text }: { title: string; text: string }) {
  return (
    <section className="site-container flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="eyebrow mb-6">Chyba 404</p>
      <h1 className="display max-w-3xl text-[clamp(3rem,7vw,6rem)]">{title}</h1>
      <p className="mt-6 max-w-xl text-lg text-ink-soft">{text}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/obchod" className="btn btn-ink">Do obchodu</Link>
        <Link href="/" className="btn btn-outline">Na úvod</Link>
      </div>
    </section>
  )
}

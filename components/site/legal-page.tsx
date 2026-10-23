export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="site-container grid gap-10 py-12 md:grid-cols-12 md:py-20">
      <header className="md:col-span-4">
        <div className="md:sticky md:top-28">
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="display text-[clamp(2.5rem,4.5vw,4rem)]">{title}</h1>
          {updated && <p className="mt-6 text-sm text-stone">{updated}</p>}
        </div>
      </header>
      <div className="prose-shop max-w-2xl md:col-span-7 md:col-start-6">{children}</div>
    </article>
  )
}

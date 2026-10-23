import Link from 'next/link'

export function EmptyState({ title, text, link }: { title: string; text?: string; link?: { text: string; href: string } }) {
  return (
    <div className="border border-dashed border-clay px-6 py-20 text-center">
      <p className="display text-4xl">{title}</p>
      {text && <p className="mx-auto mt-4 max-w-md text-ink-soft">{text}</p>}
      {link && (
        <Link href={link.href} className="btn btn-outline mt-8">
          {link.text}
        </Link>
      )}
    </div>
  )
}

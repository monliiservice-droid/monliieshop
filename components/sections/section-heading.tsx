import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SectionHeading({
  eyebrow,
  title,
  link,
  align = 'left',
  withArrows = false,
  className = '',
}: {
  eyebrow?: string
  title: string
  link?: { text: string; link: string }
  align?: 'left' | 'center'
  /** Nad posuvným pásem jsou vpravo šipky – odkaz se posune, aby se nepřekrývaly */
  withArrows?: boolean
  className?: string
}) {
  return (
    <div className={`mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14 ${align === 'center' ? 'flex-col items-center text-center' : ''} ${className}`}>
      <div className={align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="display text-[clamp(2.25rem,4.5vw,3.75rem)]">{title}</h2>
      </div>
      {link?.text && link.link && (
        <Link href={link.link} className={`group inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] ${withArrows ? 'md:mr-28' : ''}`}>
          <span className="link-line">{link.text}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}

// Jednoduché formátování textu z administrace (bez HTML – nic se nevkládá jako kód):
//   ## Nadpis, ### Podnadpis, - odrážka, **tučně**, [text odkazu](/adresa)
// Prázdný řádek = nový odstavec, Enter uvnitř odstavce = nový řádek.

import Link from 'next/link'
import type { ReactNode } from 'react'

const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g

function safeHref(href: string): string | null {
  return /^(\/|https:\/\/|http:\/\/|mailto:|tel:|#)/.test(href) ? href : null
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let i = 0
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    const key = `${keyPrefix}-${i++}`
    if (match[1] !== undefined) {
      nodes.push(<strong key={key}>{match[1]}</strong>)
    } else {
      const href = safeHref(match[3])
      if (!href) nodes.push(match[2])
      else if (href.startsWith('/')) nodes.push(<Link key={key} href={href}>{match[2]}</Link>)
      else nodes.push(<a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{match[2]}</a>)
    }
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/** Řádky odstavce oddělené <br /> */
function lines(text: string, keyPrefix: string): ReactNode[] {
  return text.split('\n').flatMap((line, i) => (i === 0 ? inline(line, `${keyPrefix}-${i}`) : [<br key={`${keyPrefix}-br${i}`} />, ...inline(line, `${keyPrefix}-${i}`)]))
}

export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const out: ReactNode[] = []
  blocks.forEach((block, b) => {
    const blockLines = block.split('\n')
    // Blok může začínat nadpisem a pokračovat textem/odrážkami bez prázdného řádku
    let rest = blockLines
    while (rest.length > 0 && /^#{2,3}\s/.test(rest[0])) {
      const [first, ...others] = rest
      const content = inline(first.replace(/^#{2,3}\s+/, ''), `h${b}-${rest.length}`)
      out.push(first.startsWith('###') ? <h3 key={`h${b}-${rest.length}`}>{content}</h3> : <h2 key={`h${b}-${rest.length}`}>{content}</h2>)
      rest = others
    }
    if (rest.length === 0) return
    if (rest.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(
        <ul key={`ul${b}`}>
          {rest.map((l, i) => (
            <li key={i}>{inline(l.replace(/^\s*[-*]\s+/, ''), `li${b}-${i}`)}</li>
          ))}
        </ul>
      )
      return
    }
    // Odstavec, za kterým hned následují odrážky (např. „Přiložte:“ + seznam)
    const firstBullet = rest.findIndex((l) => /^\s*[-*]\s+/.test(l))
    if (firstBullet > 0 && rest.slice(firstBullet).every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(<p key={`p${b}`}>{lines(rest.slice(0, firstBullet).join('\n'), `p${b}`)}</p>)
      out.push(
        <ul key={`ul${b}`}>
          {rest.slice(firstBullet).map((l, i) => (
            <li key={i}>{inline(l.replace(/^\s*[-*]\s+/, ''), `li${b}-${i}`)}</li>
          ))}
        </ul>
      )
      return
    }
    out.push(<p key={`p${b}`}>{lines(rest.join('\n'), `p${b}`)}</p>)
  })
  return <>{out}</>
}

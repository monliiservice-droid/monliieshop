const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Escapuje text pro bezpečné vložení do HTML (obsah i atributy)
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/**
 * Rekurzivně escapuje všechny stringy v plain objektech a polích.
 * Čísla, booleany, Date a jiné instance zůstávají beze změny.
 * Stringy pod klíči v `skipKeys` (např. JSON uložený jako string) se nechají být
 * a je nutné je escapovat až po naparsování.
 */
export function escapeHtmlDeep<T>(value: T, skipKeys: string[] = []): T {
  if (typeof value === 'string') {
    return escapeHtml(value) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => escapeHtmlDeep(item, skipKeys)) as T
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      result[key] = skipKeys.includes(key) && typeof item === 'string'
        ? item
        : escapeHtmlDeep(item, skipKeys)
    }
    return result as T
  }
  return value
}

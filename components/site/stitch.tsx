/**
 * Steh – přerušovaná nit, kterou při doscrollování „prošije“ jehla. Čisté CSS bez JavaScriptu
 * (animace řízená scrollem); kde ji prohlížeč neumí nebo si uživatel animace vypnul, je steh rovnou hotový.
 */
export function Stitch({ className = '' }: { className?: string }) {
  return (
    <span className={`stitch ${className}`} aria-hidden="true">
      <span className="stitch-thread" />
      <span className="stitch-needle">
        <svg viewBox="0 0 30 8" width="30" height="8" fill="none">
          <path d="M1 4h23l5-0.2v0.4L24 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="4.5" cy="4" rx="2.6" ry="1.1" stroke="currentColor" strokeWidth="0.9" />
        </svg>
      </span>
    </span>
  )
}

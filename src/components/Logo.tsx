/** The 星曆 mark: a ringed star. Colours come from --logo-* in styles.css so it reads on light and dark. */
export function Logo({ size = 32, className = 'logo' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="23" fill="none" stroke="var(--logo-line)" strokeWidth="1.2" />
      <ellipse
        cx="32"
        cy="32"
        rx="27"
        ry="11"
        fill="none"
        stroke="var(--logo-line)"
        strokeWidth=".9"
        transform="rotate(-35 32 32)"
      />
      <path d="M32 18 L35.5 28.5 L46 32 L35.5 35.5 L32 46 L28.5 35.5 L18 32 L28.5 28.5 Z" fill="var(--logo-star)" />
      <circle cx="32" cy="32" r="3" fill="var(--logo-line)" />
    </svg>
  )
}

/** The small mark set before a section heading. */
export function TitleMark() {
  return <Logo size={14} className="title-mark" />
}

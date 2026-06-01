import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
}

export function Badge({ children }: BadgeProps) {
  return <span className="rounded bg-surface-deep px-2 py-1 text-xs text-text-secondary">{children}</span>
}

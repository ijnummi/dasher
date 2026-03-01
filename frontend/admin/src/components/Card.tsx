import type { ReactNode } from 'react'

export type CardVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface CardProps {
  variant?: CardVariant
  title?: string
  description?: string
  /** Content rendered below the header divider, above the footer divider. */
  children?: ReactNode
  /** Content rendered at the bottom of the card, separated by a divider. */
  footer?: ReactNode
  /** Icon rendered to the left of the title (text, emoji, or any node). */
  icon?: ReactNode
  /** Replaces children with a skeleton placeholder. */
  loading?: boolean
  className?: string
}

const BORDER: Record<CardVariant, string> = {
  default: 'border-slate-700/70',
  primary: 'border-blue-700/50',
  success: 'border-green-700/50',
  warning: 'border-amber-700/50',
  danger:  'border-red-700/50',
}

const BG: Record<CardVariant, string> = {
  default: 'bg-slate-900',
  primary: 'bg-blue-950/40',
  success: 'bg-green-950/40',
  warning: 'bg-amber-950/30',
  danger:  'bg-red-950/40',
}

const TITLE_COLOR: Record<CardVariant, string> = {
  default: 'text-slate-100',
  primary: 'text-blue-100',
  success: 'text-green-100',
  warning: 'text-amber-100',
  danger:  'text-red-100',
}

const DIVIDER: Record<CardVariant, string> = {
  default: 'border-slate-800',
  primary: 'border-blue-800/60',
  success: 'border-green-800/60',
  warning: 'border-amber-800/60',
  danger:  'border-red-800/60',
}

const DESC_COLOR: Record<CardVariant, string> = {
  default: 'text-slate-400',
  primary: 'text-blue-300/80',
  success: 'text-green-300/80',
  warning: 'text-amber-300/80',
  danger:  'text-red-300/80',
}

export function Card({
  variant = 'default',
  title,
  description,
  children,
  footer,
  icon,
  loading = false,
  className = '',
}: CardProps) {
  const hasHeader = title || description || icon

  return (
    <div
      className={[
        'rounded-xl border overflow-hidden',
        BORDER[variant],
        BG[variant],
        className,
      ].join(' ')}
    >
      {/* Header */}
      {hasHeader && (
        <div className={['px-4 py-3', children || footer ? `border-b ${DIVIDER[variant]}` : ''].join(' ')}>
          <div className="flex items-start gap-2.5">
            {icon && (
              <span className="mt-0.5 text-lg leading-none shrink-0">{icon}</span>
            )}
            <div className="min-w-0">
              {title && (
                <p className={['text-sm font-semibold leading-snug', TITLE_COLOR[variant]].join(' ')}>
                  {title}
                </p>
              )}
              {description && (
                <p className={['text-xs mt-0.5 leading-snug', DESC_COLOR[variant]].join(' ')}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="px-4 py-4 space-y-2">
          <div className="h-3 rounded bg-slate-800 animate-pulse w-3/4" />
          <div className="h-3 rounded bg-slate-800 animate-pulse w-1/2" />
          <div className="h-3 rounded bg-slate-800 animate-pulse w-2/3" />
        </div>
      ) : children ? (
        <div className="px-4 py-3 text-sm text-slate-300">
          {children}
        </div>
      ) : null}

      {/* Footer */}
      {footer && (
        <div className={['px-4 py-2.5 border-t text-xs text-slate-500', DIVIDER[variant]].join(' ')}>
          {footer}
        </div>
      )}
    </div>
  )
}

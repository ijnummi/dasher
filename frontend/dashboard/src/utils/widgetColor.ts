/** Convert HSL values to a CSS hex color string (#rrggbb). */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const value = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * value).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Stable color derived from the widget ID. Adapts to dark/light mode. */
export function deterministicColor(id: string, dark: boolean): string {
  const hue = hashStr(id) % 360
  return dark
    ? hslToHex(hue, 30, 18)  // dark muted
    : hslToHex(hue, 35, 88)  // light muted
}

/** Random color in the same palette range as deterministic colors. */
export function randomWidgetColor(dark: boolean): string {
  const hue = Math.floor(Math.random() * 360)
  return dark
    ? hslToHex(hue, 40, 22)
    : hslToHex(hue, 45, 85)
}

/**
 * Compute WCAG relative luminance for a hex color (#rrggbb).
 * Returns a value in [0, 1] where 0 = black, 1 = white.
 */
function relativeLuminance(hex: string): number {
  const linearize = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const r = linearize(parseInt(hex.slice(1, 3), 16) / 255)
  const g = linearize(parseInt(hex.slice(3, 5), 16) / 255)
  const b = linearize(parseInt(hex.slice(5, 7), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Decide whether a background color needs dark or light foreground text.
 * Uses the WCAG neutral point (equal contrast ratio against white and black).
 * Falls back to 'dark' for any non-hex value.
 */
export function getBgTheme(color: string): 'light' | 'dark' {
  if (!color.startsWith('#') || color.length < 7) return 'dark'
  // Neutral luminance ≈ 0.179 — above it white bg, below it dark bg
  return relativeLuminance(color) > 0.179 ? 'light' : 'dark'
}

/**
 * Resolve the effective background color for a widget.
 * Priority: localStorage override > API-stored color > deterministic fallback.
 */
export function resolveWidgetColor(
  id: string,
  apiColor: string | null | undefined,
  override: string | undefined,
  dark: boolean,
): string {
  return override ?? apiColor ?? deterministicColor(id, dark)
}

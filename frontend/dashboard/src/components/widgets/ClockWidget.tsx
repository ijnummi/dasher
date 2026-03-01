import { useState, useEffect } from 'react'
import type { WidgetDefinition, WidgetProps } from '../../sdk'

function handCoords(angleDeg: number, length: number, cx: number, cy: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return {
    x: cx + length * Math.cos(rad),
    y: cy + length * Math.sin(rad),
  }
}

function ClockWidget(_: WidgetProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Tick every 10 s — minute hand feels smooth without burning cycles
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])

  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds()

  // Smooth continuous angles (fractions carry over from smaller units)
  const minuteAngle = (m + s / 60) * 6          // 6° per minute
  const hourAngle   = (h + m / 60 + s / 3600) * 30  // 30° per hour

  const cx = 50
  const cy = 50
  const r  = 46

  const minuteEnd = handCoords(minuteAngle, r * 0.78, cx, cy)
  const hourEnd   = handCoords(hourAngle,   r * 0.52, cx, cy)

  // 12 tick marks
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30
    const inner = i % 3 === 0 ? r * 0.78 : r * 0.85
    const outer = r * 0.94
    const start = handCoords(angle, inner, cx, cy)
    const end   = handCoords(angle, outer, cx, cy)
    return { start, end, major: i % 3 === 0 }
  })

  return (
    <div className="flex items-center justify-center h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[min(100%,100cqh)] p-2">
        {/* Face */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--widget-rule)"
          strokeWidth="1.5"
        />

        {/* Tick marks */}
        {ticks.map(({ start, end, major }, i) => (
          <line
            key={i}
            x1={start.x} y1={start.y}
            x2={end.x}   y2={end.y}
            stroke="var(--widget-fg-muted)"
            strokeWidth={major ? 1.8 : 0.9}
            strokeLinecap="round"
          />
        ))}

        {/* Hour hand */}
        <line
          x1={cx} y1={cy}
          x2={hourEnd.x} y2={hourEnd.y}
          stroke="var(--widget-fg)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={cx} y1={cy}
          x2={minuteEnd.x} y2={minuteEnd.y}
          stroke="var(--widget-fg)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="2.5" fill="var(--widget-fg)" />
      </svg>
    </div>
  )
}

export const definition: WidgetDefinition = {
  type: 'clock',
  label: 'Clock',
  description: 'Analog clock showing the current time.',
  component: ClockWidget,
  defaultSize: { w: 2, h: 2 },
}

export default ClockWidget

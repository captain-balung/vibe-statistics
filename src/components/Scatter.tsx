import { useId } from 'react'

export type Pt = { x: number; y: number }

// 散佈圖（自繪 SVG）。可點圖加點、可疊最小平方回歸線（珊瑚色）。domain 為兩軸共用範圍。
export default function Scatter({
  points,
  onAdd,
  line,
  domain = [0, 100],
}: {
  points: Pt[]
  onAdd?: (p: Pt) => void
  line?: { slope: number; intercept: number } | null
  domain?: [number, number]
}) {
  const clipId = useId()
  const W = 480
  const H = 360
  const pad = 36
  const [lo, hi] = domain
  const xPix = (x: number) => pad + ((x - lo) / (hi - lo)) * (W - 2 * pad)
  const yPix = (y: number) => H - pad - ((y - lo) / (hi - lo)) * (H - 2 * pad)

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!onAdd) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const py = ((e.clientY - rect.top) / rect.height) * H
    const x = lo + ((px - pad) / (W - 2 * pad)) * (hi - lo)
    const y = lo + ((H - pad - py) / (H - 2 * pad)) * (hi - lo)
    if (x >= lo && x <= hi && y >= lo && y <= hi) onAdd({ x: Math.round(x), y: Math.round(y) })
  }

  const ticks = [lo, lo + (hi - lo) / 4, lo + (hi - lo) / 2, lo + (3 * (hi - lo)) / 4, hi]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, cursor: onAdd ? 'crosshair' : 'default', touchAction: 'none' }}
      onClick={handleClick}
      role="img"
      aria-label="散佈圖，可點擊加入資料點"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} />
        </clipPath>
      </defs>
      {/* 外框與格線 */}
      <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="#fff" stroke="#e5e8dd" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xPix(t)} y1={pad} x2={xPix(t)} y2={H - pad} stroke="#f0f2ea" />
          <line x1={pad} y1={yPix(t)} x2={W - pad} y2={yPix(t)} stroke="#f0f2ea" />
          <text x={xPix(t)} y={H - pad + 14} fontSize="10" fill="#8b917f" textAnchor="middle">
            {Number(t.toFixed(0))}
          </text>
          <text x={pad - 6} y={yPix(t) + 3} fontSize="10" fill="#8b917f" textAnchor="end">
            {Number(t.toFixed(0))}
          </text>
        </g>
      ))}
      {/* 回歸線（珊瑚色），裁切在繪圖區內 */}
      {line && Number.isFinite(line.slope) && (
        <line
          x1={xPix(lo)}
          y1={yPix(line.slope * lo + line.intercept)}
          x2={xPix(hi)}
          y2={yPix(line.slope * hi + line.intercept)}
          stroke="#d85a30"
          strokeWidth={2}
          clipPath={`url(#${clipId})`}
        />
      )}
      {/* 資料點 */}
      {points.map((p, i) => (
        <circle key={i} cx={xPix(p.x)} cy={yPix(p.y)} r={4} fill="#639922" fillOpacity={0.8} clipPath={`url(#${clipId})`} />
      ))}
    </svg>
  )
}

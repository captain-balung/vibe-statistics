// 標準常態曲線（自繪 SVG），左尾填色至 z。設計系統高度客製互動用 SVG（見 design.md）。
const GREEN_FILL = '#eaf3de'
const GREEN_LINE = '#3b6d11'
const CORAL = '#d85a30'

export default function NormalCurve({ z }: { z: number }) {
  const W = 560
  const H = 200
  const pad = 28
  const zmin = -3.8
  const zmax = 3.8
  const xOf = (zz: number) => pad + ((zz - zmin) / (zmax - zmin)) * (W - 2 * pad)
  const pdf = (zz: number) => Math.exp((-zz * zz) / 2)
  const maxP = pdf(0)
  const baseY = H - pad
  const yOf = (p: number) => baseY - (p / maxP) * (H - 2 * pad)

  const N = 120
  const zs = Array.from({ length: N + 1 }, (_, i) => zmin + (i / N) * (zmax - zmin))
  const curve = zs
    .map((zz, i) => `${i ? 'L' : 'M'}${xOf(zz).toFixed(1)} ${yOf(pdf(zz)).toFixed(1)}`)
    .join(' ')

  const inRange = Number.isFinite(z) && z > zmin && z < zmax
  const zc = Math.max(zmin, Math.min(zmax, Number.isFinite(z) ? z : zmin))
  const fillZs = zs.filter((zz) => zz <= zc)
  const fill =
    `M${xOf(zmin).toFixed(1)} ${baseY} ` +
    fillZs.map((zz) => `L${xOf(zz).toFixed(1)} ${yOf(pdf(zz)).toFixed(1)}`).join(' ') +
    ` L${xOf(zc).toFixed(1)} ${baseY} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W }}
      role="img"
      aria-label={`標準常態曲線，左尾填色至 z=${Number.isFinite(z) ? z.toFixed(2) : '—'}`}
    >
      <line x1={pad} y1={baseY} x2={W - pad} y2={baseY} stroke="#cdd2c0" />
      <path d={fill} fill={GREEN_FILL} />
      <path d={curve} fill="none" stroke={GREEN_LINE} strokeWidth={2} />
      {inRange && (
        <line x1={xOf(zc)} y1={baseY} x2={xOf(zc)} y2={yOf(pdf(zc))} stroke={CORAL} strokeWidth={2} />
      )}
      {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
        <text key={t} x={xOf(t)} y={baseY + 16} fontSize="11" fill="#8b917f" textAnchor="middle">
          {t}
        </text>
      ))}
    </svg>
  )
}

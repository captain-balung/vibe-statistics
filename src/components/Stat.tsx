// 共用結果數值卡片。highlight 用於強調主要結果。
export default function Stat({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={highlight ? 'stat-card stat-card--highlight' : 'stat-card'}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

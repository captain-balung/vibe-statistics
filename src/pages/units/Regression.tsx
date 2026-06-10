import { useState } from 'react'
import ToolTabs, { DESCRIPTIVE_TABS } from '../../components/ToolTabs'
import Stat from '../../components/Stat'
import Scatter, { type Pt } from '../../components/Scatter'
import { pearsonR, linearRegression } from '../../lib/stats'
import { downloadCsv } from '../../lib/csv'

// F-DESC-04 相關與線性回歸。r 與回歸線由 lib/stats 即時運算（對照手算一致）。
const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(4)).toString() : '—')

function genCorrelated(): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < 24; i++) {
    const x = Math.round(10 + Math.random() * 80)
    const y = Math.round(Math.max(2, Math.min(98, 0.7 * x + 15 + (Math.random() - 0.5) * 30)))
    pts.push({ x, y })
  }
  return pts
}

export default function Regression() {
  const [points, setPoints] = useState<Pt[]>(() => genCorrelated())

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const r = pearsonR(xs, ys)
  const { slope, intercept } = linearRegression(xs, ys)
  const enough = points.length >= 2

  return (
    <section className="page">
      <h1>描述統計</h1>
      <ToolTabs tabs={DESCRIPTIVE_TABS} />
      <h2>相關與回歸</h2>
      <p className="lead">
        在圖上點一點加入資料點，即時看到 Pearson 相關係數 r 與最小平方回歸線。
      </p>

      <div className="actions-row">
        <button className="btn" onClick={() => setPoints(genCorrelated())}>
          自動產生
        </button>
        <button className="btn btn--secondary" onClick={() => setPoints([])}>
          清空
        </button>
        <button
          className="btn btn--secondary"
          onClick={() => downloadCsv('scatter.csv', ['x', 'y'], points.map((p) => [p.x, p.y]))}
        >
          匯出 CSV
        </button>
      </div>

      <div className="reg-layout">
        <Scatter
          points={points}
          onAdd={(p) => setPoints((prev) => [...prev, p])}
          line={enough ? { slope, intercept } : null}
        />
        <div className="stats-col">
          <Stat label="資料點數" value={`${points.length}`} />
          <Stat label="Pearson r" value={fmt(r)} highlight />
          <Stat label="回歸線斜率" value={fmt(slope)} />
          <Stat label="回歸線截距" value={fmt(intercept)} />
        </div>
      </div>

      <p className="placeholder-note">點圖上任意位置可新增一個點；至少 2 點才會算出 r 與回歸線。</p>

      <div className="explain explain--coral">
        <strong>相關不等於因果</strong>
        <p>
          r 介於 −1 到 1：越接近 ±1 代表兩個變數越呈直線關係，接近 0 代表幾乎沒有直線關係。
          但即使 r 很高，也<b>不能</b>就說一個變數「造成」另一個——相關只描述「一起變動」，不代表因果。
          目前 r＝{fmt(r)}。
        </p>
      </div>
    </section>
  )
}

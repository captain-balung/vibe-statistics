import { useState } from 'react'
import ToolTabs, { PROBABILITY_TABS } from '../../../components/ToolTabs'
import LineChart, { type Series } from '../../../components/LineChart'

// F-PROB-04 連續下注模擬 A（固定注）：固定押注、勝率 105/216、200 注、三條獨立餘額曲線。
const START = 1000
const BET = 50
const WIN_P = 105 / 216
const BETS = 200
const COLORS = ['#639922', '#3b6d11', '#d85a30']

function runOne(): number[] {
  const bal = [START]
  let cur = START
  for (let i = 0; i < BETS; i++) {
    if (cur < BET) {
      bal.push(cur)
      continue
    }
    cur += Math.random() < WIN_P ? BET : -BET
    bal.push(cur)
  }
  return bal
}

export default function FixedBet() {
  const [runs, setRuns] = useState<number[][]>(() => [runOne(), runOne(), runOne()])

  const series: Series[] = runs.map((r, i) => ({
    label: `玩家 ${i + 1}`,
    values: r,
    color: COLORS[i % COLORS.length],
  }))
  series.push({ label: '起始資金', values: Array(BETS + 1).fill(START), color: '#8b917f', dashed: true })

  return (
    <section className="page">
      <h1>機率模擬</h1>
      <ToolTabs tabs={PROBABILITY_TABS} />
      <h2>固定注模擬</h2>
      <p className="lead">
        三個人都帶 ${START} 進場，每注固定押 ${BET}（勝率 {(WIN_P * 100).toFixed(1)}%），連下 {BETS} 注。看看他們的餘額怎麼走。
      </p>

      <div className="actions-row">
        <button className="btn" onClick={() => setRuns([runOne(), runOne(), runOne()])}>
          再跑一次
        </button>
      </div>

      <div style={{ maxWidth: 720 }}>
        <LineChart labels={Array.from({ length: BETS + 1 }, (_, i) => i)} series={series} />
      </div>

      <div className="explain explain--coral">
        <strong>長期向下漂</strong>
        <p>
          因為勝率不到一半（{(WIN_P * 100).toFixed(1)}%），每一注的期望值是負的。短期內也許有人手氣好往上衝，
          但隨著注數累積，三條線整體都會往「起始資金」虛線下方漂——這就是負期望值的長期威力。
          每次「再跑一次」結果都不同，但向下的趨勢一再重現。
        </p>
      </div>
    </section>
  )
}

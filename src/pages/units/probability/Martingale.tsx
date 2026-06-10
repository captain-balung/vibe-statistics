import { useState } from 'react'
import ToolTabs, { PROBABILITY_TABS } from '../../../components/ToolTabs'
import LineChart, { type Series } from '../../../components/LineChart'

// F-PROB-05 連續下注模擬 B（馬丁格爾）：輸了加倍、贏了回基礎注；單條餘額 + 破產偵測。
const START = 1000
const BASE = 10
const WIN_P = 105 / 216
const MAX_BETS = 200

function run(): { bal: number[]; bust: boolean; bustAt: number } {
  const bal = [START]
  let cur = START
  let bet = BASE
  let bust = false
  let bustAt = -1
  for (let i = 0; i < MAX_BETS; i++) {
    if (cur < bet) {
      bust = true
      bustAt = i
      bal.push(cur)
      break
    }
    if (Math.random() < WIN_P) {
      cur += bet
      bet = BASE // 贏了回基礎注
    } else {
      cur -= bet
      bet *= 2 // 輸了加倍
    }
    bal.push(cur)
  }
  return { bal, bust, bustAt }
}

export default function Martingale() {
  const [sim, setSim] = useState(() => run())

  const series: Series[] = [
    { label: '餘額', values: sim.bal, color: '#639922' },
    { label: '起始資金', values: Array(sim.bal.length).fill(START), color: '#8b917f', dashed: true },
  ]

  return (
    <section className="page">
      <h1>機率模擬</h1>
      <ToolTabs tabs={PROBABILITY_TABS} />
      <h2>馬丁格爾策略</h2>
      <p className="lead">
        「輸了就加倍、贏了就回到基礎注」——聽起來穩賺？帶 ${START}、基礎注 ${BASE}、勝率 {(WIN_P * 100).toFixed(1)}%，實際跑一次看看。
      </p>

      <div className="actions-row">
        <button className="btn" onClick={() => setSim(run())}>
          再跑一次
        </button>
        {sim.bust && <span className="tag tag--coral">第 {sim.bustAt} 注時破產（無法再加倍）</span>}
      </div>

      <div style={{ maxWidth: 720 }}>
        <LineChart labels={sim.bal.map((_, i) => i)} series={series} />
      </div>

      <div className="explain explain--coral">
        <strong>把小贏很多次，換成偶爾大輸一次</strong>
        <p>
          馬丁格爾大部分時候都在小幅獲利，曲線緩緩上升——直到連輸幾把，注額翻倍翻到你<b>再也加不起</b>，
          一次把前面贏的全部吐回去甚至破產。它沒有改變負的期望值，只是把虧損「藏」成偶爾的一次大崩盤。
          多按幾次「再跑一次」，遲早會看到那道斷崖。
        </p>
      </div>
    </section>
  )
}

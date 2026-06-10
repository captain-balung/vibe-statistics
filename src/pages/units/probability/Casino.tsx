import { useState } from 'react'
import ToolTabs, { PROBABILITY_TABS } from '../../../components/ToolTabs'
import Stat from '../../../components/Stat'

// F-PROB-03 賭場優勢：以視覺拆解負期望值。EV 與理論值一致。
type Bet = {
  key: string
  label: string
  winNum: number
  total: number
  payout: number // 賠率（贏時每 1 元淨得 payout 元）
}
const BETS: Bet[] = [
  { key: 'red', label: '輪盤・押紅（18/38）', winNum: 18, total: 38, payout: 1 },
  { key: 'single', label: '輪盤・押單號（1/38，賠 35）', winNum: 1, total: 38, payout: 35 },
  { key: 'big', label: '骰寶・押大（105/216）', winNum: 105, total: 216, payout: 1 },
]
const fmt = (n: number) => Number(n.toFixed(4)).toString()

export default function Casino() {
  const [key, setKey] = useState('red')
  const bet = BETS.find((b) => b.key === key)!
  const winP = bet.winNum / bet.total
  const loseP = 1 - winP
  // 每 1 元下注的期望值
  const ev = winP * bet.payout - loseP * 1
  const houseEdge = -ev

  return (
    <section className="page">
      <h1>機率模擬</h1>
      <ToolTabs tabs={PROBABILITY_TABS} />
      <h2>賭場優勢</h2>
      <p className="lead">為什麼賭場長期一定贏？把每一種賭法的「每注期望值」算出來，你會發現它們都是負的。</p>

      <div className="param-row">
        <label>
          賭法
          <select className="num-input" style={{ width: 280 }} value={key} onChange={(e) => setKey(e.target.value)}>
            {BETS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="stats-grid">
        <Stat label="獲勝機率" value={(winP * 100).toFixed(2) + '%'} />
        <Stat label="賠率" value={`${bet.payout} : 1`} />
        <Stat label="每注期望值（每 1 元）" value={fmt(ev)} highlight />
        <Stat label="莊家優勢" value={(houseEdge * 100).toFixed(2) + '%'} />
      </div>

      <div className="ratio-bar" aria-hidden="true">
        <div className="ratio-win" style={{ width: `${winP * 100}%` }}>
          贏 {(winP * 100).toFixed(1)}%
        </div>
        <div className="ratio-lose" style={{ width: `${loseP * 100}%` }}>
          輸 {(loseP * 100).toFixed(1)}%
        </div>
      </div>

      <div className="explain explain--coral">
        <strong>每注期望值是負的</strong>
        <p>
          期望值 ＝ 獲勝機率 × 賠率 − 落敗機率 × 1 ＝ <b>{fmt(ev)}</b>（每下注 1 元，長期平均「賠掉」
          {fmt(-ev)} 元）。這正是莊家優勢 {(houseEdge * 100).toFixed(2)}% 的來源。
          不管哪種賭法、不管短期手氣多好，<b>長期期望值都是負的</b>——這是數學事實，沒有任何「保證贏」的玩法。
        </p>
      </div>
    </section>
  )
}

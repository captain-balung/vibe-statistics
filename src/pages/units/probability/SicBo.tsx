import { useState } from 'react'
import ToolTabs, { PROBABILITY_TABS } from '../../../components/ToolTabs'

// F-PROB-06 骰寶：三顆骰下注盤，結算金額符合賠率規則。
const CHIPS = [10, 50, 100]
const START = 1000
// 指定總點賠率表
const TOTAL_PAYOUT: Record<number, number> = {
  4: 60, 17: 60, 5: 30, 16: 30, 6: 17, 15: 17, 7: 12, 14: 12, 8: 8, 13: 8,
  9: 6, 10: 6, 11: 6, 12: 6,
}

type Dice = [number, number, number]

// 骰子點數 SVG
function Die({ v }: { v: number }) {
  const pips: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
  }
  return (
    <svg viewBox="0 0 100 100" className="die" width="48" height="48">
      <rect x="4" y="4" width="92" height="92" rx="16" fill="#fff" stroke="#cdd2c0" />
      {(pips[v] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#3b6d11" />
      ))}
    </svg>
  )
}

function roll(): Dice {
  return [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]
}

export default function SicBo() {
  const [balance, setBalance] = useState(START)
  const [chip, setChip] = useState(50)
  const [bets, setBets] = useState<Record<string, number>>({})
  const [dice, setDice] = useState<Dice>([1, 1, 1])
  const [result, setResult] = useState<string>('下好離手，按「開骰」。')
  const [net, setNet] = useState<number | null>(null)

  const staged = Object.values(bets).reduce((a, b) => a + b, 0)

  function place(key: string) {
    if (balance < chip) return
    setBalance((b) => b - chip)
    setBets((prev) => ({ ...prev, [key]: (prev[key] || 0) + chip }))
    setNet(null)
  }

  function clearBets() {
    setBalance((b) => b + staged)
    setBets({})
    setNet(null)
    setResult('已收回下注。')
  }

  function settle() {
    if (staged === 0) {
      setResult('請先下注。')
      return
    }
    const d = roll()
    setDice(d)
    const sum = d[0] + d[1] + d[2]
    const isTriple = d[0] === d[1] && d[1] === d[2]
    let credit = 0
    const detail: string[] = []
    for (const [key, amt] of Object.entries(bets)) {
      let ratio = -1 // -1 表示輸
      if (key === 'big') ratio = !isTriple && sum >= 11 && sum <= 17 ? 1 : -1
      else if (key === 'small') ratio = !isTriple && sum >= 4 && sum <= 10 ? 1 : -1
      else if (key === 'odd') ratio = !isTriple && sum % 2 === 1 ? 1 : -1
      else if (key === 'even') ratio = !isTriple && sum % 2 === 0 ? 1 : -1
      else if (key === 'triple') ratio = isTriple ? 24 : -1
      else if (key.startsWith('single-')) {
        const face = Number(key.split('-')[1])
        const count = d.filter((x) => x === face).length
        ratio = count > 0 ? count : -1
      } else if (key.startsWith('total-')) {
        const t = Number(key.split('-')[1])
        ratio = sum === t ? TOTAL_PAYOUT[t] : -1
      }
      if (ratio >= 0) {
        credit += amt * (1 + ratio)
        detail.push(`${labelOf(key)} 贏 +${amt * ratio}`)
      } else {
        detail.push(`${labelOf(key)} 輸 -${amt}`)
      }
    }
    setBalance((b) => b + credit)
    setNet(credit - staged)
    setResult(`點數 ${d.join(' + ')} = ${sum}${isTriple ? '（豹子！）' : ''}。 ` + detail.join('，'))
    setBets({})
  }

  function labelOf(key: string): string {
    if (key === 'big') return '大'
    if (key === 'small') return '小'
    if (key === 'odd') return '單'
    if (key === 'even') return '雙'
    if (key === 'triple') return '豹子'
    if (key.startsWith('single-')) return `點數${key.split('-')[1]}`
    if (key.startsWith('total-')) return `總點${key.split('-')[1]}`
    return key
  }

  const Cell = ({ k, children, tone }: { k: string; children: React.ReactNode; tone?: 'coral' }) => (
    <button className={`betcell${tone === 'coral' ? ' betcell--coral' : ''}`} onClick={() => place(k)}>
      <span>{children}</span>
      {bets[k] ? <span className="chip-badge">{bets[k]}</span> : null}
    </button>
  )

  return (
    <section className="page">
      <h1>機率模擬</h1>
      <ToolTabs tabs={PROBABILITY_TABS} />
      <h2>骰寶</h2>
      <p className="lead">仿真骰桌。選籌碼、在想押的格子上下注，按「開骰」結算。體驗一下莊家優勢怎麼運作。</p>

      <div className="sicbo-top">
        <div>
          <div className={`sicbo-balance${balance < START ? ' is-down' : ''}`}>${balance}</div>
          <div className="stat-label">餘額{net !== null && <strong className={net >= 0 ? ' net-win' : ' net-lose'}> 本局 {net >= 0 ? '+' : ''}{net}</strong>}</div>
        </div>
        <div className="chips">
          {CHIPS.map((c) => (
            <button key={c} className={`chip${chip === c ? ' active' : ''}`} onClick={() => setChip(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="dice-row">
          <Die v={dice[0]} />
          <Die v={dice[1]} />
          <Die v={dice[2]} />
        </div>
      </div>

      <div className="actions-row">
        <button className="btn" onClick={settle} disabled={staged === 0}>
          開骰
        </button>
        <button className="btn btn--secondary" onClick={clearBets} disabled={staged === 0}>
          收回下注
        </button>
        {balance < 10 && (
          <button className="btn btn--secondary" onClick={() => { setBalance(START); setBets({}); setNet(null) }}>
            重新儲值
          </button>
        )}
      </div>

      <p className="sicbo-result">{result}</p>

      <div className="bet-board">
        <div className="bet-row">
          <Cell k="small">小 (4–10) 1:1</Cell>
          <Cell k="big">大 (11–17) 1:1</Cell>
          <Cell k="odd">單 1:1</Cell>
          <Cell k="even">雙 1:1</Cell>
          <Cell k="triple" tone="coral">豹子 (任意三同) 24:1</Cell>
        </div>
        <div className="bet-row">
          {[1, 2, 3, 4, 5, 6].map((f) => (
            <Cell key={f} k={`single-${f}`}>單點 {f}</Cell>
          ))}
        </div>
        <div className="bet-row bet-row--totals">
          {Object.keys(TOTAL_PAYOUT)
            .map(Number)
            .sort((a, b) => a - b)
            .map((t) => (
              <Cell key={t} k={`total-${t}`}>
                {t}（賠 {TOTAL_PAYOUT[t]}）
              </Cell>
            ))}
        </div>
      </div>

      <div className="explain explain--coral">
        <strong>每種下注長期都是負期望值</strong>
        <p>
          骰寶每一格的賠率都經過設計，讓莊家長期穩賺。例如「大／小」遇到豹子莊家通吃，「指定總點」「豹子」的高賠率
          也都對應極低的中獎機率。短期你也許會贏，但<b>沒有任何一種下注的長期期望值是正的</b>——這裡不存在「保證贏」的玩法，
          純粹是體驗與理解機率，不是致富工具。
        </p>
      </div>
    </section>
  )
}

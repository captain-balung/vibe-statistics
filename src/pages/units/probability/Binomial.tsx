import { useState } from 'react'
import ToolTabs, { PROBABILITY_TABS } from '../../../components/ToolTabs'
import { choose } from '../../../lib/stats'

// F-PROB-02 硬幣二項分配：列出每個 k 的組合數、出現比例、累積比例；合計比例 = 1。
const N_OPTIONS = [4, 6, 8, 10]
const pct = (x: number) => (x * 100).toFixed(2) + '%'

export default function Binomial() {
  const [n, setN] = useState(6)
  const total = 2 ** n
  let cum = 0
  const rows = Array.from({ length: n + 1 }, (_, k) => {
    const c = choose(n, k)
    const p = c / total
    cum += p
    return { k, c, p, cum }
  })
  const sum = rows.reduce((a, r) => a + r.p, 0)

  return (
    <section className="page">
      <h1>機率模擬</h1>
      <ToolTabs tabs={PROBABILITY_TABS} />
      <h2>二項分配</h2>
      <p className="lead">拋 n 枚公平硬幣，每種「正面數量」出現的比例。所有比例加起來必須剛好是 100%。</p>

      <div className="param-row">
        <label>
          硬幣數 n
          <select className="num-input num-input--sm" value={n} onChange={(e) => setN(Number(e.target.value))}>
            {N_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>正面數 k</th>
            <th>組合數 C(n,k)</th>
            <th>出現比例</th>
            <th>累積比例</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k}>
              <td>{r.k}</td>
              <td>{r.c}</td>
              <td>{pct(r.p)}</td>
              <td>{pct(r.cum)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>合計</td>
            <td>{total}</td>
            <td>{pct(sum)}</td>
            <td>—</td>
          </tr>
        </tfoot>
      </table>

      <div className="explain">
        <strong>白話解釋</strong>
        <p>
          總共有 {total} 種等機率的正反面排列。「出現比例」是該正面數的組合數佔總數的比例；把每一列的比例
          全部加起來，剛好是 <b>{pct(sum)}</b>——這就是機率分配「總和為 1」的鐵則。
        </p>
      </div>
    </section>
  )
}

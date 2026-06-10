import { useState } from 'react'
import ToolTabs, { PROBABILITY_TABS } from '../../../components/ToolTabs'
import BarChart from '../../../components/BarChart'
import { choose } from '../../../lib/stats'

// F-PROB-01 鐘形曲線：以硬幣組合數 C(n,k) 繪近似常態的長條圖，中央高亮。
const GREEN = '#639922'
const CORAL = '#d85a30'
const N_OPTIONS = [4, 8, 12, 16, 20]

export default function BellCurve() {
  const [n, setN] = useState(12)
  const ks = Array.from({ length: n + 1 }, (_, k) => k)
  const counts = ks.map((k) => choose(n, k))
  const mid = n / 2
  const colors = ks.map((k) => (k === mid ? CORAL : GREEN))

  return (
    <section className="page">
      <h1>機率模擬</h1>
      <ToolTabs tabs={PROBABILITY_TABS} />
      <h2>鐘形曲線</h2>
      <p className="lead">
        拋 n 枚硬幣，剛好出現 k 枚正面有幾種組合？把每個 k 的組合數畫成長條，就會浮現鐘形。
      </p>

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

      <div style={{ maxWidth: 680 }}>
        <BarChart labels={ks} values={counts} label="組合數" colors={colors} />
      </div>

      <div className="explain">
        <strong>白話解釋</strong>
        <p>
          每根棒子是「剛好 k 枚正面」的組合數 C({n}, k)。
          <span style={{ color: CORAL, fontWeight: 600 }}>中央那根（k＝{mid}）最高</span>
          ——因為「一半正面、一半反面」的排列方式最多；越往兩邊（全正或全反）越少。
          硬幣越多，這條曲線就越接近常態分佈的鐘形。
        </p>
      </div>
    </section>
  )
}

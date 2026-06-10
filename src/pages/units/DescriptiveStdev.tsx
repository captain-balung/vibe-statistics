import { useState } from 'react'
import Formula from '../../components/Formula'
import BarChart from '../../components/BarChart'
import {
  parseNumbers,
  mean,
  meanAbsoluteDeviation,
  variance,
  standardDeviation,
  deviations,
} from '../../lib/stats'

// F-DESC-01 標準差互動圖解（Phase 0 MVP）。
// 貼資料 → 平均/平均離差/變異數/標準差 + 離差長條圖 + 白話解釋。
// 所有數值由 lib/stats 即時運算（不造假）；資料問題以紅字提示（不靜默算錯）。

const DEFAULT_DATA = '2, 4, 4, 4, 5, 5, 7, 9'
const GREEN = '#639922'
const CORAL = '#D85A30'

function fmt(n: number): string {
  // 最多四位小數、去掉尾零
  return Number(n.toFixed(4)).toString()
}

export default function DescriptiveStdev() {
  const [text, setText] = useState(DEFAULT_DATA)
  const { values, invalid } = parseNumbers(text)
  const hasData = values.length > 0

  const m = mean(values)
  const mad = meanAbsoluteDeviation(values)
  const varc = variance(values)
  const sd = standardDeviation(values)
  const devs = deviations(values)

  return (
    <section className="page">
      <h1>描述統計 · 標準差圖解</h1>
      <p className="lead">
        貼上一組數字，即時看到它的平均、離散程度，以及每筆資料離平均有多遠。
      </p>

      <label className="field-label" htmlFor="data-input">
        輸入資料（用逗號、空白或換行分隔）
      </label>
      <textarea
        id="data-input"
        className="data-input"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {invalid.length > 0 && (
        <p className="error-note">
          ⚠ 已忽略無法辨識的資料：{invalid.join('、')}。請確認輸入只含數字。
        </p>
      )}

      {!hasData ? (
        <p className="error-note">請至少輸入一個數字。</p>
      ) : (
        <>
          <div className="stats-grid">
            <Stat label="平均數" value={fmt(m)} />
            <Stat label="平均離差（絕對值）" value={fmt(mad)} />
            <Stat label="變異數（母體）" value={fmt(varc)} />
            <Stat label="標準差（母體）" value={fmt(sd)} highlight />
          </div>

          <h2>公式</h2>
          <p>母體標準差：先算每筆資料與平均的差、平方、取平均，再開根號。</p>
          <Formula
            block
            tex={'\\sigma = \\sqrt{\\dfrac{1}{N}\\sum_{i=1}^{N}\\left(x_i - \\bar{x}\\right)^2}'}
          />

          <h2>離差圖</h2>
          <p>
            每根棒子是一筆資料對平均的離差（xᵢ − x̄）：
            <span style={{ color: GREEN, fontWeight: 600 }}> 綠色在平均之上</span>、
            <span style={{ color: CORAL, fontWeight: 600 }}>珊瑚色在平均之下</span>，
            棒子越長代表離平均越遠。
          </p>
          <div style={{ maxWidth: 640 }}>
            <BarChart
              labels={values.map((v) => v)}
              values={devs}
              label="離差"
              colors={devs.map((d) => (d >= 0 ? GREEN : CORAL))}
              beginAtZero={false}
            />
          </div>

          <div className="explain">
            <strong>白話解釋</strong>
            <p>
              這組 {values.length} 筆資料的平均是 <b>{fmt(m)}</b>。標準差 <b>{fmt(sd)}</b>{' '}
              衡量資料「平均而言離中心有多遠」——數字越大代表越分散、越小代表越集中在平均附近。
              變異數（{fmt(varc)}）是標準差的平方，單位較不直觀，所以我們通常看標準差。
              上面的離差圖把每筆資料與平均的距離畫出來，幫你「看見」這份離散程度。
            </p>
          </div>
        </>
      )}
    </section>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? 'stat-card stat-card--highlight' : 'stat-card'}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

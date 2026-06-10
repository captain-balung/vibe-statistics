import { useState } from 'react'
import ToolTabs, { DESCRIPTIVE_TABS } from '../../components/ToolTabs'
import Stat from '../../components/Stat'
import BarChart from '../../components/BarChart'
import { genNormalIntegers, histogram, mean, standardDeviation } from '../../lib/stats'
import { downloadCsv } from '../../lib/csv'

// F-DESC-03 常態分佈資料模擬：設定 μ/σ/n → 產生整數資料 + 直方圖 + 摘要 + CSV 匯出。
const fmt = (n: number) => Number(n.toFixed(3)).toString()

export default function NormalSim() {
  const [mu, setMu] = useState('100')
  const [sigma, setSigma] = useState('15')
  const [n, setN] = useState('200')
  const [data, setData] = useState<number[]>(() => genNormalIntegers(200, 100, 15))
  const [err, setErr] = useState('')

  function generate() {
    const m = Number(mu)
    const s = Number(sigma)
    const count = Number(n)
    if (!Number.isFinite(m) || !Number.isFinite(s) || s <= 0 || !Number.isInteger(count) || count < 1 || count > 10000) {
      setErr('請輸入有效參數：σ 須 > 0，n 須為 1–10000 的整數。')
      return
    }
    setErr('')
    setData(genNormalIntegers(count, m, s))
  }

  const hist = histogram(data, 12)

  return (
    <section className="page">
      <h1>描述統計</h1>
      <ToolTabs tabs={DESCRIPTIVE_TABS} />
      <h2>常態模擬</h2>
      <p className="lead">
        設定平均、標準差與筆數，電腦就幫你「抽」出一整批近似常態分佈的整數資料，看看它長什麼樣。
      </p>

      <div className="param-row">
        <label>
          平均 μ
          <input className="num-input num-input--sm" value={mu} onChange={(e) => setMu(e.target.value)} />
        </label>
        <label>
          標準差 σ
          <input className="num-input num-input--sm" value={sigma} onChange={(e) => setSigma(e.target.value)} />
        </label>
        <label>
          筆數 n
          <input className="num-input num-input--sm" value={n} onChange={(e) => setN(e.target.value)} />
        </label>
        <button className="btn" onClick={generate}>
          產生資料
        </button>
      </div>

      {err && <p className="error-note">{err}</p>}

      <div className="stats-grid">
        <Stat label="樣本數 n" value={`${data.length}`} />
        <Stat label="樣本平均" value={fmt(mean(data))} highlight />
        <Stat label="樣本標準差" value={fmt(standardDeviation(data))} />
        <Stat label="最小 / 最大" value={`${Math.min(...data)} / ${Math.max(...data)}`} />
      </div>

      <h2>直方圖</h2>
      <div style={{ maxWidth: 680 }}>
        <BarChart labels={hist.labels} values={hist.counts} label="次數" />
      </div>

      <div className="actions-row">
        <button className="btn btn--secondary" onClick={() => downloadCsv('normal-sample.csv', ['value'], data.map((v) => [v]))}>
          匯出 CSV
        </button>
      </div>

      <div className="explain">
        <strong>白話解釋</strong>
        <p>
          這 {data.length} 筆資料是電腦依「平均 {mu}、標準差 {sigma}」隨機抽出來的。直方圖中間高、兩邊低的鐘形，
          正是常態分佈的招牌長相——越靠近平均的數值出現得越頻繁。每次按「產生資料」都會重抽一批，
          樣本平均與標準差會在你設定的值附近上下浮動，這就是抽樣的隨機性。
        </p>
      </div>
    </section>
  )
}

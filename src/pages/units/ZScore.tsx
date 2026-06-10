import { useState } from 'react'
import ToolTabs, { DESCRIPTIVE_TABS } from '../../components/ToolTabs'
import Stat from '../../components/Stat'
import NormalCurve from '../../components/NormalCurve'
import { normCdf, normInv } from '../../lib/normal'

// F-DESC-02 Z 分數與累積百分比互換。與標準常態表對照誤差 < 0.001（見 lib/normal）。
type Mode = 'z2p' | 'p2z'

const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(4)).toString() : '—')

export default function ZScore() {
  const [mode, setMode] = useState<Mode>('z2p')
  const [zInput, setZInput] = useState('1.96')
  const [pInput, setPInput] = useState('97.5')

  let z = NaN
  let leftPct = NaN
  let err = ''
  if (mode === 'z2p') {
    z = Number(zInput.trim())
    if (zInput.trim() === '' || !Number.isFinite(z)) err = '請輸入有效的 Z 值（例如 1.96）'
    else leftPct = normCdf(z) * 100
  } else {
    const p = Number(pInput.trim())
    if (!Number.isFinite(p) || p <= 0 || p >= 100)
      err = '請輸入 0 到 100 之間的百分比（不含 0 與 100）'
    else {
      leftPct = p
      z = normInv(p / 100)
    }
  }
  const rightPct = 100 - leftPct

  return (
    <section className="page">
      <h1>描述統計</h1>
      <ToolTabs tabs={DESCRIPTIVE_TABS} />
      <h2>Z 分數換算</h2>
      <p className="lead">
        Z 分數與「左尾累積百分比」互相換算，並在常態曲線上看到它落在哪裡。
      </p>

      <div className="segmented">
        <button className={mode === 'z2p' ? 'seg active' : 'seg'} onClick={() => setMode('z2p')}>
          Z → 百分比
        </button>
        <button className={mode === 'p2z' ? 'seg active' : 'seg'} onClick={() => setMode('p2z')}>
          百分比 → Z
        </button>
      </div>

      {mode === 'z2p' ? (
        <>
          <label className="field-label" htmlFor="z-in">
            Z 分數
          </label>
          <input
            id="z-in"
            className="num-input"
            value={zInput}
            onChange={(e) => setZInput(e.target.value)}
          />
        </>
      ) : (
        <>
          <label className="field-label" htmlFor="p-in">
            左尾累積百分比（0–100）
          </label>
          <input
            id="p-in"
            className="num-input"
            value={pInput}
            onChange={(e) => setPInput(e.target.value)}
          />
        </>
      )}

      {err ? (
        <p className="error-note">{err}</p>
      ) : (
        <>
          <div className="stats-grid stats-grid--3">
            <Stat label="Z 分數" value={fmt(z)} highlight={mode === 'p2z'} />
            <Stat label="左尾累積 %" value={fmt(leftPct)} highlight={mode === 'z2p'} />
            <Stat label="右尾 %" value={fmt(rightPct)} />
          </div>

          <div style={{ maxWidth: 560, margin: '8px 0 4px' }}>
            <NormalCurve z={z} />
          </div>

          <div className="explain">
            <strong>白話解釋</strong>
            <p>
              左尾累積百分比 <b>{fmt(leftPct)}%</b> 代表：隨機取一個標準常態分數，大約有{' '}
              {fmt(leftPct)}% 的機會落在 Z＝{fmt(z)} 的左邊（也就是比它小）。曲線下方填色的那塊面積，
              就是這個百分比；珊瑚色直線標出 Z 的位置。
            </p>
          </div>
        </>
      )}
    </section>
  )
}

import { useState } from 'react'
import Stat from '../../components/Stat'
import NormalCurve from '../../components/NormalCurve'
import { useAi } from '../../context/AiContext'
import { callGemini } from '../../lib/gemini'
import { zTestOneSample, type Tail } from '../../lib/normal'

// F-ZTEST-01..03 Z 檢定練習：出題 / 作答 / 自我對答案 / AI 評分。
type Question = {
  stem: string
  mu0: number
  xbar: number
  sigma: number
  n: number
  alpha: number
  tail: Tail
  unit: string
}

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))

function genQuestion(): Question {
  const builders: (() => Question)[] = [
    () => {
      const mu0 = rint(20, 30)
      const xbar = mu0 + rint(-4, 4)
      return {
        stem: `某手搖飲店宣稱每杯全糖含糖量平均為 ${mu0} 克。消費者團體隨機抽測 N 杯，得平均 X̄ 克；已知母體標準差 σ 克。在顯著水準 α 下，實際含糖量是否與宣稱「不同」？`,
        mu0, xbar, sigma: rint(3, 8), n: rint(30, 60), alpha: 0.05, tail: 'two', unit: '克',
      }
    },
    () => {
      const mu0 = rint(55, 65)
      const xbar = mu0 + rint(0, 6)
      return {
        stem: `全國會考某科平均為 ${mu0} 分。某校 N 名學生平均 X̄ 分；已知母體標準差 σ 分。在顯著水準 α 下，該校是否「高於」全國平均？`,
        mu0, xbar, sigma: rint(8, 15), n: rint(36, 80), alpha: 0.05, tail: 'right', unit: '分',
      }
    },
    () => {
      const mu0 = rint(48, 52)
      const xbar = mu0 + rint(-3, 3)
      return {
        stem: `工廠生產的螺絲規格長度應為 ${mu0} mm。品管隨機抽檢 N 支，平均 X̄ mm；已知母體標準差 σ mm。在顯著水準 α 下，長度是否「偏離」規格？`,
        mu0, xbar, sigma: rint(1, 4), n: rint(30, 50), alpha: 0.01, tail: 'two', unit: 'mm',
      }
    },
    () => {
      const mu0 = rint(40, 60)
      const xbar = mu0 + rint(0, 8)
      return {
        stem: `某 App 改版前使用者平均停留 ${mu0} 秒。改版後隨機抽樣 N 人，平均 X̄ 秒；已知母體標準差 σ 秒。在顯著水準 α 下，改版後停留時間是否「變長」？`,
        mu0, xbar, sigma: rint(6, 14), n: rint(30, 70), alpha: 0.05, tail: 'right', unit: '秒',
      }
    },
  ]
  return builders[rint(0, builders.length - 1)]()
}

const tailLabel = (t: Tail) => (t === 'two' ? '雙尾' : t === 'right' ? '右尾（單尾）' : '左尾（單尾）')
const fmt = (n: number) => Number(n.toFixed(4)).toString()

export default function ZTest() {
  const { hasKey, model, apiKey } = useAi()
  const [q, setQ] = useState<Question>(() => genQuestion())
  const [ans, setAns] = useState({ h0: '', h1: '', z: '', p: '', decision: '', conclusion: '' })
  const [checked, setChecked] = useState(false)
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [aiText, setAiText] = useState('')

  const sol = zTestOneSample(q.xbar, q.mu0, q.sigma, q.n, q.tail)
  const solDecision = sol.p <= q.alpha ? 'reject' : 'fail'

  function newQuestion() {
    setQ(genQuestion())
    setAns({ h0: '', h1: '', z: '', p: '', decision: '', conclusion: '' })
    setChecked(false)
    setAiState('idle')
    setAiText('')
  }

  const zOk = Math.abs(Number(ans.z) - sol.z) <= 0.1
  const pOk = Math.abs(Number(ans.p) - sol.p) <= 0.02
  const decOk = ans.decision === solDecision

  async function gradeWithAI() {
    setAiState('loading')
    setAiText('')
    const prompt = `你是一位親切的統計學助教，用繁體中文、鼓勵且具體地評論學生的 Z 檢定作答。\n\n【題目】${q.stem}\n數據：μ₀=${q.mu0}，X̄=${q.xbar}，σ=${q.sigma}，N=${q.n}，α=${q.alpha}，${tailLabel(q.tail)}\n\n【正解】SE=${fmt(sol.se)}，Z=${fmt(sol.z)}，p=${fmt(sol.p)}，判定=${solDecision === 'reject' ? '拒絕 H₀' : '不拒絕 H₀'}\n\n【學生作答】H₀：${ans.h0}\nH₁：${ans.h1}\nZ：${ans.z}\np：${ans.p}\n結果：${ans.decision === 'reject' ? '拒絕 H₀' : ans.decision === 'fail' ? '不拒絕 H₀' : '(未填)'}\n白話結論：${ans.conclusion}\n\n請依序：1) 指出哪裡正確、哪裡需要修正（含計算與假設方向）；2) 提醒「拒絕 H₀」常是研究想要的結果、不是錯誤；3) 給一句鼓勵。約 150 字內。`
    try {
      const text = await callGemini(apiKey, model, prompt)
      setAiText(text)
      setAiState('done')
    } catch (e) {
      setAiText(e instanceof Error ? e.message : '呼叫失敗')
      setAiState('error')
    }
  }

  return (
    <section className="page">
      <h1>Z 檢定練習</h1>
      <p className="lead">自動出題、自己作答、立即對答案，還能用 AI 給你評分回饋。</p>

      {/* 題目卡 */}
      <div className="card">
        <div className="card-head">
          <strong>題目</strong>
          <button className="btn btn--secondary btn--sm" onClick={newQuestion}>
            產生新題目
          </button>
        </div>
        <p>{q.stem}</p>
        <div className="stats-grid">
          <Stat label="母體平均 μ₀" value={`${q.mu0} ${q.unit}`} />
          <Stat label="樣本平均 X̄" value={`${q.xbar} ${q.unit}`} />
          <Stat label="母體標準差 σ" value={`${q.sigma} ${q.unit}`} />
          <Stat label="樣本數 N / α / 尾數" value={`${q.n} / ${q.alpha} / ${tailLabel(q.tail)}`} />
        </div>
      </div>

      {/* 作答卡 */}
      <div className="card">
        <strong>作答</strong>
        <div className="form-grid">
          <label>
            虛無假設 H₀
            <input className="num-input" style={{ width: '100%' }} value={ans.h0} onChange={(e) => setAns({ ...ans, h0: e.target.value })} placeholder="例：μ = 25" />
          </label>
          <label>
            對立假設 H₁
            <input className="num-input" style={{ width: '100%' }} value={ans.h1} onChange={(e) => setAns({ ...ans, h1: e.target.value })} placeholder="例：μ ≠ 25" />
          </label>
          <label>
            Z 統計量
            <input className="num-input" value={ans.z} onChange={(e) => setAns({ ...ans, z: e.target.value })} />
          </label>
          <label>
            p 值
            <input className="num-input" value={ans.p} onChange={(e) => setAns({ ...ans, p: e.target.value })} />
          </label>
        </div>
        <div className="segmented" style={{ marginTop: 12 }}>
          <button className={ans.decision === 'reject' ? 'seg active' : 'seg'} onClick={() => setAns({ ...ans, decision: 'reject' })}>
            拒絕 H₀
          </button>
          <button className={ans.decision === 'fail' ? 'seg active' : 'seg'} onClick={() => setAns({ ...ans, decision: 'fail' })}>
            不拒絕 H₀
          </button>
        </div>
        <label className="field-label">白話結論</label>
        <textarea className="data-input" rows={2} value={ans.conclusion} onChange={(e) => setAns({ ...ans, conclusion: e.target.value })} placeholder="用一句白話說明這個檢定的結論" />
        <div className="actions-row">
          <button className="btn" onClick={() => setChecked(true)}>
            自我對答案
          </button>
        </div>
      </div>

      {/* 正解區 */}
      {checked && (
        <div className="card">
          <strong>正解與解析</strong>
          <div className="check-row">
            <span className={zOk ? 'check-ok' : 'check-no'}>Z {zOk ? '✓ 正確' : '再想想'}</span>
            <span className={pOk ? 'check-ok' : 'check-no'}>p {pOk ? '✓ 正確' : '再想想'}</span>
            <span className={decOk ? 'check-ok' : 'check-no'}>判定 {decOk ? '✓ 正確' : '再想想'}</span>
          </div>
          <div className="stats-grid">
            <Stat label="標準誤 SE" value={fmt(sol.se)} />
            <Stat label="正解 Z" value={fmt(sol.z)} highlight />
            <Stat label="正解 p" value={fmt(sol.p)} highlight />
            <Stat label="判定" value={solDecision === 'reject' ? '拒絕 H₀' : '不拒絕 H₀'} />
          </div>
          <div style={{ maxWidth: 520 }}>
            <NormalCurve z={sol.z} />
          </div>
          <p>
            SE ＝ σ/√N ＝ {q.sigma}/√{q.n} ＝ {fmt(sol.se)}；Z ＝ (X̄ − μ₀)/SE ＝ ({q.xbar} − {q.mu0})/{fmt(sol.se)} ＝ {fmt(sol.z)}。
            {q.tail === 'two' ? '雙尾' : '單尾'} p 值 ＝ {fmt(sol.p)}，與 α＝{q.alpha} 比較：
            {solDecision === 'reject' ? ' p ≤ α，' : ' p > α，'}
            因此{solDecision === 'reject' ? '拒絕' : '不拒絕'} H₀。
          </p>
          {solDecision === 'reject' && (
            <p className="tag tag--coral" style={{ display: 'inline-block' }}>
              「拒絕 H₀」常常正是研究想要的結果，不是答錯，別把它當紅燈。
            </p>
          )}
        </div>
      )}

      {/* AI 評分 */}
      <div className="card card--ai">
        <strong>AI 評分</strong>
        {hasKey ? (
          <>
            <p className="modal-note">使用模型：{model}</p>
            <button className="btn" disabled={aiState === 'loading'} onClick={gradeWithAI}>
              {aiState === 'loading' ? '評分中…' : '送出 AI 評分'}
            </button>
            {aiState === 'error' && <p className="error-note">評分失敗：{aiText}</p>}
            {aiState === 'done' && <div className="ai-feedback">{aiText}</div>}
          </>
        ) : (
          <p className="modal-note">
            尚未設定 Gemini API key，AI 評分暫停用。請點右上「⚙ AI 設定」填入 key。
            （未填 key 時，出題、作答、自我對答案都照常可用。）
          </p>
        )}
      </div>
    </section>
  )
}

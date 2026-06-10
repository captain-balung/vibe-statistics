import { useState, useRef, type ReactNode } from 'react'
import Stat from '../../components/Stat'
import {
  parseWorkbook,
  sampleDataset,
  isNumericColumn,
  numericColumn,
  columnValues,
  groupBy,
  contingencyTable,
  type Dataset,
} from '../../lib/sheet'
import {
  oneSampleT,
  welchT,
  anovaOneWay,
  chiSquareIndependence,
  chiSquareGoodnessOfFit,
  postHocPairwise,
  parseExpectedWeights,
  type Tail,
} from '../../lib/tests'

// F-TOOL-01..05 Excel 工具箱（單一控制面板版）。SheetJS 解析（不上傳）；計算由 lib/tests（jStat）
// 即時運算、皆通過標準答案測試。資料問題以紅字提示，不靜默算錯。
// 設計：沿用全站草綠／珊瑚色票；達顯著＝珊瑚（需注意），非紅色（避免「做錯了」的誤讀）。
const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(4)).toString() : '—')
const pfmt = (p: number) => (p > 0 && p < 0.0001 ? '< 0.0001' : fmt(p))

type TestType = 'oneT' | 'welch' | 'anova' | 'chi' | 'gof'
const TESTS: { key: TestType; label: string }[] = [
  { key: 'oneT', label: '單一樣本 t 檢定' },
  { key: 'welch', label: '獨立樣本 t 檢定（Welch）' },
  { key: 'anova', label: '單因子 ANOVA' },
  { key: 'chi', label: '卡方獨立性檢定' },
  { key: 'gof', label: '卡方適配性檢定' },
]
const TAILS: { v: Tail; label: string }[] = [
  { v: 'two', label: '雙尾：≠' },
  { v: 'greater', label: '右尾：>' },
  { v: 'less', label: '左尾：<' },
]

function distinctLevels(ds: Dataset, col: number): string[] {
  const seen: string[] = []
  for (const v of columnValues(ds, col)) {
    const k = String(v)
    if (!seen.includes(k)) seen.push(k)
  }
  return seen
}

export default function Toolbox() {
  const [ds, setDs] = useState<Dataset | null>(null)
  const [source, setSource] = useState('')
  const [test, setTest] = useState<TestType>('oneT')
  const [valueCol, setValueCol] = useState(0)
  const [groupCol, setGroupCol] = useState(0)
  const [colB, setColB] = useState(0)
  const [mu0, setMu0] = useState('70')
  const [tail, setTail] = useState<Tail>('two')
  const [alpha, setAlpha] = useState('0.05')
  const [welchFmt, setWelchFmt] = useState<'long' | 'wide'>('long')
  const [wideCol2, setWideCol2] = useState(0)
  const [groupA, setGroupA] = useState('')
  const [groupB, setGroupB] = useState('')
  const [posthoc, setPosthoc] = useState<'none' | 'bonferroni' | 'holm'>('bonferroni')
  const [gofFmt, setGofFmt] = useState<'raw' | 'summary'>('raw')
  const [gofCatCol, setGofCatCol] = useState(0)
  const [gofObsCol, setGofObsCol] = useState(0)
  const [gofExpMode, setGofExpMode] = useState<'equal' | 'custom'>('equal')
  const [gofExpInput, setGofExpInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function load(d: Dataset, label: string) {
    setDs(d)
    setSource(label)
    const firstNum = d.columns.findIndex((_, i) => isNumericColumn(d, i))
    setValueCol(firstNum >= 0 ? firstNum : 0)
    setGroupCol(0)
    setColB(Math.min(1, d.columns.length - 1))
    setWideCol2(Math.min(1, d.columns.length - 1))
    setGofCatCol(0)
    setGofObsCol(Math.min(1, d.columns.length - 1))
    const lv = distinctLevels(d, 0)
    setGroupA(lv[0] ?? '')
    setGroupB(lv[1] ?? lv[0] ?? '')
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buf = await f.arrayBuffer()
      load(parseWorkbook(buf), f.name)
    } catch (err) {
      alert('檔案解析失敗：' + (err instanceof Error ? err.message : '未知錯誤'))
    }
  }

  function ColSelect({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    if (!ds) return null
    return (
      <select className="ctrl-input" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {ds.columns.map((c, i) => (
          <option key={i} value={i}>
            {c}
            {isNumericColumn(ds, i) ? '（數值）' : '（類別）'}
          </option>
        ))}
      </select>
    )
  }

  // 當分組欄改變時，重置可選的兩組
  function onGroupColChange(n: number) {
    setGroupCol(n)
    if (ds) {
      const lv = distinctLevels(ds, n)
      setGroupA(lv[0] ?? '')
      setGroupB(lv[1] ?? lv[0] ?? '')
    }
  }

  return (
    <section className="page">
      <h1>Excel 工具箱</h1>
      <p className="lead">
        上傳一份 .xlsx，挑選檢定與欄位，立刻得到 t / F / χ² 與 p 值，還有白話教學解釋。檔案只在你的瀏覽器解析，不會上傳。
      </p>

      {!ds ? (
        <div className="dropzone">
          <p>把資料整理成「第一列為欄名」的 .xlsx，上傳即可。</p>
          <div className="actions-row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              選擇 .xlsx 檔
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => load(sampleDataset(), '範例資料（班級／分數／身高／性別）')}
            >
              載入範例檔案試試
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={onFile} />
        </div>
      ) : (
        <>
          <div className="card control-panel">
            <div className="file-status">
              <span className="tag">已解析 {ds.rows.length} 列 · {ds.columns.length} 欄</span>
              <span className="modal-note" style={{ margin: 0 }}>{source}</span>
              <button className="btn btn--secondary btn--sm" onClick={() => setDs(null)}>
                換一個檔案
              </button>
            </div>

            <div className="control-grid">
              <div className="field full">
                <label className="ctrl-label">檢定類型</label>
                <select className="ctrl-input" value={test} onChange={(e) => setTest(e.target.value as TestType)}>
                  {TESTS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {renderControls()}

              <div className="field">
                <label className="ctrl-label">顯著水準 α</label>
                <input className="ctrl-input" type="number" step="0.01" min="0.001" max="0.999" value={alpha} onChange={(e) => setAlpha(e.target.value)} />
              </div>
            </div>
          </div>

          {renderResult()}
        </>
      )}
    </section>
  )

  // ---- 控制項（依檢定類型顯示） ----
  function renderControls(): ReactNode {
    if (!ds) return null
    if (test === 'oneT') {
      return (
        <>
          <div className="field">
            <label className="ctrl-label">數值欄</label>
            <ColSelect value={valueCol} onChange={setValueCol} />
          </div>
          <div className="field">
            <label className="ctrl-label">比較平均值 μ₀</label>
            <input className="ctrl-input" type="number" step="any" value={mu0} onChange={(e) => setMu0(e.target.value)} />
          </div>
          <TailField />
        </>
      )
    }
    if (test === 'welch') {
      return (
        <>
          <div className="field full">
            <label className="ctrl-label">資料格式</label>
            <div className="segmented">
              <button className={welchFmt === 'long' ? 'seg active' : 'seg'} onClick={() => setWelchFmt('long')}>
                長格式（數值欄 + 分組欄）
              </button>
              <button className={welchFmt === 'wide' ? 'seg active' : 'seg'} onClick={() => setWelchFmt('wide')}>
                寬格式（兩個數值欄）
              </button>
            </div>
          </div>
          {welchFmt === 'long' ? (
            <>
              <div className="field">
                <label className="ctrl-label">數值欄</label>
                <ColSelect value={valueCol} onChange={setValueCol} />
              </div>
              <div className="field">
                <label className="ctrl-label">分組欄</label>
                <ColSelect value={groupCol} onChange={onGroupColChange} />
              </div>
              <div className="field">
                <label className="ctrl-label">第一組</label>
                <select className="ctrl-input" value={groupA} onChange={(e) => setGroupA(e.target.value)}>
                  {distinctLevels(ds, groupCol).map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="ctrl-label">第二組</label>
                <select className="ctrl-input" value={groupB} onChange={(e) => setGroupB(e.target.value)}>
                  {distinctLevels(ds, groupCol).map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label className="ctrl-label">第一組數值欄</label>
                <ColSelect value={valueCol} onChange={setValueCol} />
              </div>
              <div className="field">
                <label className="ctrl-label">第二組數值欄</label>
                <ColSelect value={wideCol2} onChange={setWideCol2} />
              </div>
            </>
          )}
          <TailField />
        </>
      )
    }
    if (test === 'anova') {
      return (
        <>
          <div className="field">
            <label className="ctrl-label">數值欄</label>
            <ColSelect value={valueCol} onChange={setValueCol} />
          </div>
          <div className="field">
            <label className="ctrl-label">分組欄（3 組以上）</label>
            <ColSelect value={groupCol} onChange={setGroupCol} />
          </div>
          <div className="field">
            <label className="ctrl-label">事後比較</label>
            <select className="ctrl-input" value={posthoc} onChange={(e) => setPosthoc(e.target.value as typeof posthoc)}>
              <option value="bonferroni">兩兩比較 + Bonferroni 校正</option>
              <option value="holm">兩兩比較 + Holm 校正</option>
              <option value="none">不做事後比較</option>
            </select>
          </div>
        </>
      )
    }
    if (test === 'chi') {
      return (
        <>
          <div className="field">
            <label className="ctrl-label">列類別欄 A</label>
            <ColSelect value={valueCol} onChange={setValueCol} />
          </div>
          <div className="field">
            <label className="ctrl-label">欄類別欄 B</label>
            <ColSelect value={colB} onChange={setColB} />
          </div>
        </>
      )
    }
    // gof
    return (
      <>
        <div className="field full">
          <label className="ctrl-label">資料格式</label>
          <div className="segmented">
            <button className={gofFmt === 'raw' ? 'seg active' : 'seg'} onClick={() => setGofFmt('raw')}>
              原始資料（自動計數）
            </button>
            <button className={gofFmt === 'summary' ? 'seg active' : 'seg'} onClick={() => setGofFmt('summary')}>
              摘要資料（含次數欄）
            </button>
          </div>
        </div>
        <div className="field">
          <label className="ctrl-label">類別欄</label>
          <ColSelect value={gofCatCol} onChange={setGofCatCol} />
        </div>
        {gofFmt === 'summary' && (
          <div className="field">
            <label className="ctrl-label">觀察次數欄</label>
            <ColSelect value={gofObsCol} onChange={setGofObsCol} />
          </div>
        )}
        <div className="field">
          <label className="ctrl-label">期望分布</label>
          <select className="ctrl-input" value={gofExpMode} onChange={(e) => setGofExpMode(e.target.value as typeof gofExpMode)}>
            <option value="equal">平均分布（各類別相同）</option>
            <option value="custom">自訂比例／期望次數</option>
          </select>
        </div>
        {gofExpMode === 'custom' && (
          <div className="field full">
            <label className="ctrl-label">自訂比例／期望次數</label>
            <textarea
              className="ctrl-input"
              style={{ minHeight: 72, fontFamily: 'ui-monospace, Consolas, monospace' }}
              placeholder={'例：0.25, 0.25, 0.25, 0.25\n或：A=0.4, B=0.3, C=0.2, D=0.1（可用 % ）'}
              value={gofExpInput}
              onChange={(e) => setGofExpInput(e.target.value)}
            />
            <span className="panel-hint">純數字依類別順序套用；也可用「類別=比例」指定。總和不必為 1，會自動正規化。</span>
          </div>
        )}
      </>
    )
  }

  function TailField() {
    return (
      <div className="field">
        <label className="ctrl-label">對立假設</label>
        <select className="ctrl-input" value={tail} onChange={(e) => setTail(e.target.value as Tail)}>
          {TAILS.map((t) => (
            <option key={t.v} value={t.v}>{t.label}</option>
          ))}
        </select>
      </div>
    )
  }

  // ---- 結果 ----
  function renderResult(): ReactNode {
    if (!ds) return null
    const a = Number(alpha)
    if (!Number.isFinite(a) || a <= 0 || a >= 1) {
      return <ErrorNote msg="顯著水準 α 必須介於 0 與 1 之間。" />
    }
    try {
      if (test === 'oneT') return resultOneT(a)
      if (test === 'welch') return resultWelch(a)
      if (test === 'anova') return resultAnova(a)
      if (test === 'chi') return resultChi(a)
      return resultGof(a)
    } catch (err) {
      return <ErrorNote msg={err instanceof Error ? err.message : '計算失敗'} />
    }
  }

  function resultOneT(a: number): ReactNode {
    if (!ds) return null
    if (!isNumericColumn(ds, valueCol)) return <ErrorNote msg="所選欄位不是數值欄，無法做 t 檢定。請改選數值欄。" />
    const m = Number(mu0)
    if (!Number.isFinite(m)) return <ErrorNote msg="比較平均值 μ₀ 必須是數字。" />
    const data = numericColumn(ds, valueCol)
    if (data.length < 2) return <ErrorNote msg="樣本欄位至少需要 2 筆數值資料。" />
    const r = oneSampleT(data, m, tail)
    return (
      <Result
        p={r.p}
        alpha={a}
        stats={[
          ['樣本數 n', `${r.n}`],
          ['平均', fmt(r.mean)],
          ['t 值', fmt(r.t)],
          ['自由度 df', `${r.df}`],
          ['p 值', pfmt(r.p)],
        ]}
        explain={`單一樣本 t 檢定問的是：這欄資料的平均（${fmt(r.mean)}），和你指定的 ${m} 有沒有顯著差異。t＝(平均−μ₀)/標準誤＝${fmt(r.t)}，自由度 ${r.df}，${tailWord(tail)} p＝${pfmt(r.p)}。`}
      />
    )
  }

  function resultWelch(a: number): ReactNode {
    if (!ds) return null
    let g1: number[] = []
    let g2: number[] = []
    let l1 = ''
    let l2 = ''
    if (welchFmt === 'long') {
      if (!isNumericColumn(ds, valueCol)) return <ErrorNote msg="數值欄所選不是數值。請改選數值欄。" />
      if (!groupA || !groupB) return <ErrorNote msg="請選擇兩個要比較的組別。" />
      if (groupA === groupB) return <ErrorNote msg="第一組與第二組不能相同。" />
      const groups = groupBy(ds, valueCol, groupCol)
      g1 = groups[groupA] ?? []
      g2 = groups[groupB] ?? []
      l1 = groupA
      l2 = groupB
    } else {
      if (!isNumericColumn(ds, valueCol) || !isNumericColumn(ds, wideCol2))
        return <ErrorNote msg="兩欄都必須是數值欄。" />
      if (valueCol === wideCol2) return <ErrorNote msg="寬格式請選兩個不同的數值欄。" />
      g1 = numericColumn(ds, valueCol)
      g2 = numericColumn(ds, wideCol2)
      l1 = ds.columns[valueCol]
      l2 = ds.columns[wideCol2]
    }
    if (g1.length < 2) return <ErrorNote msg={`第一組「${l1}」至少需要 2 筆數值資料。`} />
    if (g2.length < 2) return <ErrorNote msg={`第二組「${l2}」至少需要 2 筆數值資料。`} />
    const r = welchT(g1, g2, tail)
    return (
      <Result
        p={r.p}
        alpha={a}
        stats={[
          [`${l1} 平均`, fmt(r.mean1)],
          [`${l2} 平均`, fmt(r.mean2)],
          ['t 值', fmt(r.t)],
          ['Welch df', fmt(r.df)],
          ['p 值', pfmt(r.p)],
        ]}
        explain={`比較「${l1}」與「${l2}」兩組的平均（${fmt(r.mean1)} vs ${fmt(r.mean2)}）。Welch t 不假設兩組變異數相等，t＝${fmt(r.t)}、自由度 ${fmt(r.df)}、${tailWord(tail)} p＝${pfmt(r.p)}。`}
      />
    )
  }

  function resultAnova(a: number): ReactNode {
    if (!ds) return null
    if (!isNumericColumn(ds, valueCol)) return <ErrorNote msg="數值欄所選不是數值。請改選數值欄。" />
    const groups = groupBy(ds, valueCol, groupCol)
    const keys = Object.keys(groups)
    if (keys.length < 3) return <ErrorNote msg={`分組欄目前有 ${keys.length} 組。ANOVA 需要 3 組以上，請改選含 3 種以上類別的欄位。`} />
    const r = anovaOneWay(keys.map((k) => groups[k]))
    const reject = r.p <= a
    const groupRows = keys.map((k, i) => (
      <tr key={k}>
        <th>{k}</th>
        <td>{groups[k].length}</td>
        <td>{fmt(r.groupMeans[i])}</td>
        <td>{fmt(Math.sqrt(sampleVar(groups[k])))}</td>
      </tr>
    ))
    let posthocNode: ReactNode = null
    if (posthoc !== 'none') {
      const comps = postHocPairwise(keys.map((k) => ({ label: k, values: groups[k] })), a, posthoc)
      posthocNode = (
        <>
          <h3 className="section-title">事後比較：兩兩組別（{posthoc === 'holm' ? 'Holm' : 'Bonferroni'} 校正）</h3>
          <p className="panel-hint" style={{ marginBottom: 8 }}>
            {reject
              ? '整體 ANOVA 已達顯著，可進一步看哪些組別彼此不同。'
              : '整體 ANOVA 未達顯著；以下兩兩比較僅供探索與教學參考，正式解讀宜保守。'}
          </p>
          <div className="table-scroll">
            <table className="data-table" style={{ maxWidth: 'none', width: '100%' }}>
              <thead>
                <tr>
                  <th>比較</th><th>平均差</th><th>t</th><th>df</th><th>原始 p</th><th>校正後 p</th><th>判定</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((c) => (
                  <tr key={`${c.a}|${c.b}`}>
                    <td>{c.a} vs {c.b}</td>
                    <td>{fmt(c.meanDiff)}</td>
                    <td>{fmt(c.t)}</td>
                    <td>{fmt(c.df)}</td>
                    <td>{pfmt(c.rawP)}</td>
                    <td>{pfmt(c.adjP)}</td>
                    <td>{c.significant ? <span className="tag tag--coral">顯著</span> : <span className="tag">不顯著</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )
    }
    return (
      <Result
        p={r.p}
        alpha={a}
        stats={[
          ['組數 k', `${keys.length}`],
          ['F 值', fmt(r.f)],
          ['組間 df', `${r.dfBetween}`],
          ['組內 df', `${r.dfWithin}`],
          ['p 值', pfmt(r.p)],
        ]}
        explain={`ANOVA 問的是「${keys.join('、')}」這 ${keys.length} 組的平均是否至少有一組與眾不同。F＝組間變異/組內變異＝${fmt(r.f)}，p＝${pfmt(r.p)}。`}
        extra={
          <>
            <div className="table-scroll">
              <table className="data-table" style={{ maxWidth: 480 }}>
                <thead>
                  <tr><th>組別</th><th>n</th><th>平均</th><th>標準差</th></tr>
                </thead>
                <tbody>{groupRows}</tbody>
              </table>
            </div>
            {posthocNode}
          </>
        }
      />
    )
  }

  function resultChi(a: number): ReactNode {
    if (!ds) return null
    if (valueCol === colB) return <ErrorNote msg="兩個類別欄不能相同，請選不同的欄位。" />
    const { rowLabels, colLabels, table } = contingencyTable(ds, valueCol, colB)
    if (rowLabels.length < 2 || colLabels.length < 2)
      return <ErrorNote msg="卡方獨立性檢定至少需要 2×2（每欄至少 2 種類別）。" />
    const r = chiSquareIndependence(table)
    return (
      <Result
        p={r.p}
        alpha={a}
        stats={[
          ['χ² 值', fmt(r.chi2)],
          ['自由度 df', `${r.df}`],
          ['p 值', pfmt(r.p)],
        ]}
        explain={`卡方獨立性檢定問：「${ds.columns[valueCol]}」與「${ds.columns[colB]}」這兩個類別變數是否相關（不獨立）。把觀察次數與「假設獨立時的期望次數」相比，χ²＝${fmt(r.chi2)}、df＝${r.df}、p＝${pfmt(r.p)}。`}
        extra={
          <div className="table-scroll">
            <table className="data-table" style={{ maxWidth: 'none' }}>
              <thead>
                <tr>
                  <th>觀察次數</th>
                  {colLabels.map((c) => (<th key={c}>{c}</th>))}
                </tr>
              </thead>
              <tbody>
                {rowLabels.map((rl, i) => (
                  <tr key={rl}>
                    <th>{rl}</th>
                    {colLabels.map((_, j) => (<td key={j}>{table[i][j]}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    )
  }

  function resultGof(a: number): ReactNode {
    if (!ds) return null
    const cats: string[] = []
    const obs: number[] = []
    const tally = new Map<string, number>()
    if (gofFmt === 'raw') {
      for (const row of ds.rows) {
        const k = String(row[gofCatCol] ?? '').trim()
        if (!k) continue
        tally.set(k, (tally.get(k) ?? 0) + 1)
      }
    } else {
      if (!isNumericColumn(ds, gofObsCol)) return <ErrorNote msg="觀察次數欄必須是數值欄。" />
      for (const row of ds.rows) {
        const k = String(row[gofCatCol] ?? '').trim()
        const v = Number(row[gofObsCol])
        if (!k || !Number.isFinite(v) || v < 0) continue
        tally.set(k, (tally.get(k) ?? 0) + v)
      }
    }
    for (const [k, v] of tally) {
      cats.push(k)
      obs.push(v)
    }
    if (cats.length < 2) return <ErrorNote msg="卡方適配性檢定至少需要 2 個類別。" />
    const weights =
      gofExpMode === 'equal' ? cats.map(() => 1) : parseExpectedWeights(gofExpInput, cats)
    const r = chiSquareGoodnessOfFit(cats, obs, weights)
    return (
      <Result
        p={r.p}
        alpha={a}
        stats={[
          ['χ² 值', fmt(r.chi2)],
          ['自由度 df', `${r.df}`],
          ['總次數', `${r.total}`],
          ['p 值', pfmt(r.p)],
        ]}
        explain={`卡方適配性檢定檢查「${ds.columns[gofCatCol]}」的觀察分布，是否符合${gofExpMode === 'equal' ? '平均分布' : '你指定的期望分布'}。觀察與期望次數差距越大，χ² 越大、p 越小。χ²＝${fmt(r.chi2)}、df＝${r.df}、p＝${pfmt(r.p)}。`}
        extra={
          <div className="table-scroll">
            <table className="data-table" style={{ maxWidth: 'none' }}>
              <thead>
                <tr><th>類別</th><th>觀察次數</th><th>期望次數</th><th>期望比例</th><th>χ² 貢獻</th></tr>
              </thead>
              <tbody>
                {r.cells.map((c) => (
                  <tr key={c.category}>
                    <th>{c.category}</th>
                    <td>{fmt(c.observed)}</td>
                    <td>{fmt(c.expected)}</td>
                    <td>{fmt(c.proportion * 100)}%</td>
                    <td>{fmt(c.contribution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    )
  }
}

function sampleVar(xs: number[]): number {
  const n = xs.length
  if (n < 2) return NaN
  const m = xs.reduce((a, b) => a + b, 0) / n
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1)
}

function tailWord(tail: Tail): string {
  return tail === 'two' ? '雙尾' : tail === 'greater' ? '右尾' : '左尾'
}

function ErrorNote({ msg }: { msg: string }) {
  return <p className="error-note">{msg}</p>
}

function Result({
  stats,
  p,
  alpha,
  explain,
  extra,
}: {
  stats: [string, string][]
  p: number
  alpha: number
  explain: string
  extra?: ReactNode
}) {
  const sig = p <= alpha
  return (
    <div className="card vs-fade-in">
      <div className="result-head">
        <h2 style={{ margin: 0, fontSize: 22 }}>計算結果</h2>
        <span className={sig ? 'tag tag--coral' : 'tag'}>
          {sig ? `達顯著（p ≤ ${alpha}）` : `不顯著（p > ${alpha}）`}
        </span>
      </div>
      <div className="stats-grid stats-grid--auto">
        {stats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} highlight={label.startsWith('p ')} />
        ))}
      </div>
      {extra}
      <div className="explain">
        <strong>白話解釋</strong>
        <p>{explain}</p>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import Stat from '../../components/Stat'
import {
  parseWorkbook,
  sampleDataset,
  isNumericColumn,
  numericColumn,
  groupBy,
  contingencyTable,
  type Dataset,
} from '../../lib/sheet'
import { oneSampleT, welchT, anovaOneWay, chiSquareIndependence } from '../../lib/tests'

// F-TOOL-01..05 Excel 工具箱。SheetJS 解析（不上傳）；四檢定由 lib/tests（jStat）即時運算，
// 已通過標準答案測試。資料問題以紅字提示，不靜默算錯。
const ALPHA = 0.05
const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(4)).toString() : '—')
const pfmt = (p: number) => (p > 0 && p < 0.0001 ? '< 0.0001' : fmt(p))

type TestType = 'oneT' | 'welch' | 'anova' | 'chi'
const TEST_CARDS: { key: TestType; label: string; desc: string }[] = [
  { key: 'oneT', label: '單一樣本 t 檢定', desc: '一個數值欄與指定平均值比較' },
  { key: 'welch', label: '獨立樣本 t（Welch）', desc: '兩組數值的平均是否不同' },
  { key: 'anova', label: '單因子 ANOVA', desc: '三組以上的平均是否有差異' },
  { key: 'chi', label: '卡方獨立性', desc: '兩個類別變數是否相關' },
]

function Verdict({ p }: { p: number }) {
  const sig = p <= ALPHA
  return (
    <span className={sig ? 'tag tag--coral' : 'tag'}>
      {sig ? `達顯著（p ≤ ${ALPHA}）` : `不顯著（p > ${ALPHA}）`}
    </span>
  )
}

export default function Toolbox() {
  const [ds, setDs] = useState<Dataset | null>(null)
  const [source, setSource] = useState('')
  const [test, setTest] = useState<TestType>('oneT')
  const [valueCol, setValueCol] = useState(0)
  const [groupCol, setGroupCol] = useState(0)
  const [colB, setColB] = useState(0)
  const [mu0, setMu0] = useState('70')
  const [welchFmt, setWelchFmt] = useState<'long' | 'wide'>('long')
  const [wideCol2, setWideCol2] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function load(d: Dataset, label: string) {
    setDs(d)
    setSource(label)
    setValueCol(d.columns.findIndex((_, i) => isNumericColumn(d, i)) >= 0 ? d.columns.findIndex((_, i) => isNumericColumn(d, i)) : 0)
    setGroupCol(0)
    setColB(Math.min(1, d.columns.length - 1))
    setWideCol2(0)
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

  const colOptions = ds
    ? ds.columns.map((c, i) => (
        <option key={i} value={i}>
          {c}
          {isNumericColumn(ds, i) ? '（數值）' : '（類別）'}
        </option>
      ))
    : null

  return (
    <section className="page">
      <h1>Excel 工具箱</h1>
      <p className="lead">
        上傳一份 .xlsx，挑選檢定與欄位，立刻得到 t / F / χ² 與 p 值，還有白話教學解釋。檔案只在你的瀏覽器解析，不會上傳。
      </p>

      {!ds ? (
        <div className="dropzone">
          <p>把資料整理成「第一列為欄名」的 .xlsx，上傳即可。</p>
          <div className="actions-row">
            <button className="btn" onClick={() => fileRef.current?.click()}>
              選擇 .xlsx 檔
            </button>
            <button className="btn btn--secondary" onClick={() => load(sampleDataset(), '範例資料（班級/分數/身高/性別）')}>
              載入範例檔案試試
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={onFile} />
        </div>
      ) : (
        <>
          <div className="file-status">
            <span className="tag">已解析 {ds.rows.length} 列 {ds.columns.length} 欄</span>
            <span className="modal-note" style={{ margin: 0 }}>{source}</span>
            <button className="btn btn--secondary btn--sm" onClick={() => setDs(null)}>
              換一個檔案
            </button>
          </div>

          {/* 資料預覽 */}
          <table className="data-table">
            <thead>
              <tr>
                {ds.columns.map((c, i) => (
                  <th key={i}>
                    {c}
                    <div className="col-type">{isNumericColumn(ds, i) ? '數值' : '類別'}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ds.rows.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  {ds.columns.map((_, j) => (
                    <td key={j}>{r[j]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* 檢定類型選擇 */}
          <div className="test-cards">
            {TEST_CARDS.map((c) => (
              <button
                key={c.key}
                className={test === c.key ? 'test-card active' : 'test-card'}
                onClick={() => setTest(c.key)}
              >
                <strong>{c.label}</strong>
                <span>{c.desc}</span>
              </button>
            ))}
          </div>

          {/* 動態欄位 + 結果 */}
          <div className="card">{renderTest()}</div>
        </>
      )}
    </section>
  )

  function ColSelect({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
    return (
      <label className="field-label">
        {label}
        <select className="num-input" style={{ width: 200 }} value={value} onChange={(e) => onChange(Number(e.target.value))}>
          {colOptions}
        </select>
      </label>
    )
  }

  function renderTest() {
    if (!ds) return null
    if (test === 'oneT') {
      const ok = isNumericColumn(ds, valueCol)
      const m = Number(mu0)
      const data = ok ? numericColumn(ds, valueCol) : []
      const r = ok && data.length >= 2 && Number.isFinite(m) ? oneSampleT(data, m) : null
      return (
        <>
          <div className="param-row">
            <ColSelect value={valueCol} onChange={setValueCol} label="數值欄" />
            <label className="field-label">
              比較平均值 μ₀
              <input className="num-input num-input--sm" value={mu0} onChange={(e) => setMu0(e.target.value)} />
            </label>
          </div>
          {!ok ? (
            <p className="error-note">所選欄位不是數值欄，無法做 t 檢定。請改選數值欄。</p>
          ) : r ? (
            <Result
              stats={[
                ['樣本數 n', `${r.n}`],
                ['平均', fmt(r.mean)],
                ['t 值', fmt(r.t)],
                ['自由度 df', `${r.df}`],
                ['雙尾 p 值', pfmt(r.p)],
              ]}
              p={r.p}
              explain={`單一樣本 t 檢定問的是：這欄資料的平均（${fmt(r.mean)}），和你指定的 ${m} 有沒有顯著差異。t＝(平均−μ₀)/標準誤＝${fmt(r.t)}，自由度 ${r.df}，雙尾 p＝${pfmt(r.p)}。`}
            />
          ) : null}
        </>
      )
    }
    if (test === 'welch') {
      return (
        <>
          <div className="segmented" style={{ marginBottom: 12 }}>
            <button className={welchFmt === 'long' ? 'seg active' : 'seg'} onClick={() => setWelchFmt('long')}>長格式（數值欄+分組欄）</button>
            <button className={welchFmt === 'wide' ? 'seg active' : 'seg'} onClick={() => setWelchFmt('wide')}>寬格式（兩數值欄）</button>
          </div>
          {welchFmt === 'long' ? renderWelchLong() : renderWelchWide()}
        </>
      )
    }
    if (test === 'anova') return renderAnova()
    return renderChi()
  }

  function renderWelchLong() {
    if (!ds) return null
    const groups = isNumericColumn(ds, valueCol) ? groupBy(ds, valueCol, groupCol) : {}
    const keys = Object.keys(groups)
    return (
      <>
        <div className="param-row">
          <ColSelect value={valueCol} onChange={setValueCol} label="數值欄" />
          <ColSelect value={groupCol} onChange={setGroupCol} label="分組欄（需恰好 2 組）" />
        </div>
        {!isNumericColumn(ds, valueCol) ? (
          <p className="error-note">數值欄所選不是數值。請改選數值欄。</p>
        ) : keys.length !== 2 ? (
          <p className="error-note">分組欄目前有 {keys.length} 組（{keys.join('、') || '無'}）。Welch t 需要恰好 2 組，請改選只含兩種類別的欄位。</p>
        ) : (
          renderWelchResult(groups[keys[0]], groups[keys[1]], keys[0], keys[1])
        )}
      </>
    )
  }

  function renderWelchWide() {
    if (!ds) return null
    const ok1 = isNumericColumn(ds, valueCol)
    const ok2 = isNumericColumn(ds, wideCol2)
    return (
      <>
        <div className="param-row">
          <ColSelect value={valueCol} onChange={setValueCol} label="第一組數值欄" />
          <ColSelect value={wideCol2} onChange={setWideCol2} label="第二組數值欄" />
        </div>
        {!ok1 || !ok2 ? (
          <p className="error-note">兩欄都必須是數值欄。</p>
        ) : (
          renderWelchResult(numericColumn(ds, valueCol), numericColumn(ds, wideCol2), ds.columns[valueCol], ds.columns[wideCol2])
        )}
      </>
    )
  }

  function renderWelchResult(g1: number[], g2: number[], l1: string, l2: string) {
    if (g1.length < 2 || g2.length < 2) return <p className="error-note">每組至少需要 2 筆資料。</p>
    const r = welchT(g1, g2)
    return (
      <Result
        stats={[
          [`${l1} 平均`, fmt(r.mean1)],
          [`${l2} 平均`, fmt(r.mean2)],
          ['t 值', fmt(r.t)],
          ['Welch df', fmt(r.df)],
          ['雙尾 p 值', pfmt(r.p)],
        ]}
        p={r.p}
        explain={`比較「${l1}」與「${l2}」兩組的平均（${fmt(r.mean1)} vs ${fmt(r.mean2)}）。Welch t 不假設兩組變異數相等，t＝${fmt(r.t)}、自由度 ${fmt(r.df)}、雙尾 p＝${pfmt(r.p)}。`}
      />
    )
  }

  function renderAnova() {
    if (!ds) return null
    const groups = isNumericColumn(ds, valueCol) ? groupBy(ds, valueCol, groupCol) : {}
    const keys = Object.keys(groups)
    return (
      <>
        <div className="param-row">
          <ColSelect value={valueCol} onChange={setValueCol} label="數值欄" />
          <ColSelect value={groupCol} onChange={setGroupCol} label="分組欄（需 3 組以上）" />
        </div>
        {!isNumericColumn(ds, valueCol) ? (
          <p className="error-note">數值欄所選不是數值。請改選數值欄。</p>
        ) : keys.length < 3 ? (
          <p className="error-note">分組欄目前有 {keys.length} 組。ANOVA 需要 3 組以上，請改選含 3 種以上類別的欄位。</p>
        ) : (
          (() => {
            const r = anovaOneWay(keys.map((k) => groups[k]))
            return (
              <Result
                stats={[
                  ['組數 k', `${keys.length}`],
                  ['F 值', fmt(r.f)],
                  ['組間 df', `${r.dfBetween}`],
                  ['組內 df', `${r.dfWithin}`],
                  ['p 值', pfmt(r.p)],
                ]}
                p={r.p}
                explain={`ANOVA 問的是「${keys.join('、')}」這 ${keys.length} 組的平均（${keys.map((k, i) => `${k}:${fmt(r.groupMeans[i])}`).join('、')}）是否至少有一組與眾不同。F＝組間變異/組內變異＝${fmt(r.f)}，p＝${pfmt(r.p)}。`}
              />
            )
          })()
        )}
      </>
    )
  }

  function renderChi() {
    if (!ds) return null
    const same = valueCol === colB
    const { rowLabels, colLabels, table } = contingencyTable(ds, valueCol, colB)
    return (
      <>
        <div className="param-row">
          <ColSelect value={valueCol} onChange={setValueCol} label="類別欄 A" />
          <ColSelect value={colB} onChange={setColB} label="類別欄 B" />
        </div>
        {same ? (
          <p className="error-note">兩個類別欄不能相同，請選不同的欄位。</p>
        ) : rowLabels.length < 2 || colLabels.length < 2 ? (
          <p className="error-note">列聯表至少需要 2×2（每欄至少 2 種類別）。</p>
        ) : (
          (() => {
            const r = chiSquareIndependence(table)
            return (
              <>
                <table className="data-table" style={{ maxWidth: 480 }}>
                  <thead>
                    <tr>
                      <th></th>
                      {colLabels.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowLabels.map((rl, i) => (
                      <tr key={rl}>
                        <th>{rl}</th>
                        {colLabels.map((_, j) => (
                          <td key={j}>{table[i][j]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Result
                  stats={[
                    ['χ² 值', fmt(r.chi2)],
                    ['自由度 df', `${r.df}`],
                    ['p 值', pfmt(r.p)],
                  ]}
                  p={r.p}
                  explain={`卡方獨立性檢定問：「${ds.columns[valueCol]}」與「${ds.columns[colB]}」這兩個類別變數是否相關（不獨立）。把觀察次數與「假設獨立時的期望次數」相比，χ²＝${fmt(r.chi2)}、df＝${r.df}、p＝${pfmt(r.p)}。`}
                />
              </>
            )
          })()
        )}
      </>
    )
  }
}

function Result({ stats, p, explain }: { stats: [string, string][]; p: number; explain: string }) {
  return (
    <div className="vs-fade-in">
      <div className="result-head">
        <Verdict p={p} />
      </div>
      <div className="stats-grid stats-grid--auto">
        {stats.map(([label, value]) => (
          <Stat key={label} label={label} value={value} highlight={label.includes('p ')} />
        ))}
      </div>
      <div className="explain">
        <strong>白話解釋</strong>
        <p>{explain}</p>
      </div>
    </div>
  )
}

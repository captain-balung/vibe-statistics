import * as XLSX from 'xlsx'

// Excel/試算表解析與欄位輔助。純前端解析（檔案不上傳）。
export type Dataset = { columns: string[]; rows: (string | number)[][] }

export function parseWorkbook(buf: ArrayBuffer): Dataset {
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const aoa = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, blankrows: false })
  const columns = (aoa[0] || []).map((c) => String(c))
  const rows = aoa.slice(1).filter((r) => r.length > 0)
  return { columns, rows }
}

export function columnValues(ds: Dataset, colIndex: number): (string | number)[] {
  return ds.rows.map((r) => r[colIndex]).filter((v) => v !== undefined && v !== null && v !== '')
}

export function isNumericColumn(ds: Dataset, colIndex: number): boolean {
  const vals = columnValues(ds, colIndex)
  return vals.length > 0 && vals.every((v) => Number.isFinite(Number(v)))
}

export function numericColumn(ds: Dataset, colIndex: number): number[] {
  return columnValues(ds, colIndex)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n))
}

/** 依分組欄把數值欄分組：回傳 { 組名: 數值陣列 } */
export function groupBy(ds: Dataset, valueCol: number, groupCol: number): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  for (const r of ds.rows) {
    const g = r[groupCol]
    const v = Number(r[valueCol])
    if (g === undefined || g === '' || !Number.isFinite(v)) continue
    const key = String(g)
    ;(out[key] ||= []).push(v)
  }
  return out
}

/** 兩類別欄產生列聯表 { rowLabels, colLabels, table } */
export function contingencyTable(ds: Dataset, colA: number, colB: number) {
  const rowLabels: string[] = []
  const colLabels: string[] = []
  for (const r of ds.rows) {
    const a = r[colA]
    const b = r[colB]
    if (a === undefined || a === '' || b === undefined || b === '') continue
    if (!rowLabels.includes(String(a))) rowLabels.push(String(a))
    if (!colLabels.includes(String(b))) colLabels.push(String(b))
  }
  const table = rowLabels.map(() => colLabels.map(() => 0))
  for (const r of ds.rows) {
    const a = r[colA]
    const b = r[colB]
    if (a === undefined || a === '' || b === undefined || b === '') continue
    table[rowLabels.indexOf(String(a))][colLabels.indexOf(String(b))]++
  }
  return { rowLabels, colLabels, table }
}

// 範例資料集（讓使用者免上傳即可試玩）
export function sampleDataset(): Dataset {
  const columns = ['班級', '分數', '身高', '性別']
  const rows: (string | number)[][] = []
  const classes = ['A', 'B', 'C']
  const base: Record<string, number> = { A: 70, B: 75, C: 82 }
  let seed = 7
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  for (let i = 0; i < 30; i++) {
    const cls = classes[i % 3]
    const score = Math.round(base[cls] + (rand() - 0.5) * 20)
    const height = Math.round(160 + (rand() - 0.5) * 24)
    const sex = rand() < 0.5 ? '男' : '女'
    rows.push([cls, score, height, sex])
  }
  return { columns, rows }
}

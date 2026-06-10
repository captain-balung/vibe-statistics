// 四種統計檢定純函式（封裝 jStat 的分布函式取 p 值）。
// 正確性紅線：須通過 tests.test.ts 標準答案測試（容差 < 1e-4 或相對 < 0.1%）才可上線。
// 錯誤不得吞掉；資料問題由呼叫端（UI）以明確訊息提示。
import { jStat } from 'jstat'
import { mean } from './stats'

/** 樣本變異數（除以 n-1） */
export function sampleVariance(xs: number[]): number {
  const n = xs.length
  if (n < 2) return NaN
  const m = mean(xs)
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1)
}

export type Tail = 'two' | 'greater' | 'less'

/** 由 t 值與自由度、依對立假設方向求 p 值。two=雙尾、greater=右尾、less=左尾 */
export function pFromT(t: number, df: number, tail: Tail = 'two'): number {
  const cdf = jStat.studentt.cdf(t, df)
  if (tail === 'greater') return 1 - cdf
  if (tail === 'less') return cdf
  return 2 * Math.min(cdf, 1 - cdf)
}

export type TResult = { mean: number; t: number; df: number; p: number; n: number }

/** 單樣本 t 檢定（p 預設雙尾，可指定單尾方向） */
export function oneSampleT(data: number[], mu0: number, tail: Tail = 'two'): TResult {
  const n = data.length
  const m = mean(data)
  const sd = Math.sqrt(sampleVariance(data))
  const se = sd / Math.sqrt(n)
  const t = (m - mu0) / se
  const df = n - 1
  const p = pFromT(t, df, tail)
  return { mean: m, t, df, p, n }
}

export type WelchResult = {
  mean1: number
  mean2: number
  t: number
  df: number
  p: number
  n1: number
  n2: number
}

/** 獨立樣本 Welch t 檢定（不假設變異數相等；p 預設雙尾，可指定單尾方向） */
export function welchT(g1: number[], g2: number[], tail: Tail = 'two'): WelchResult {
  const n1 = g1.length
  const n2 = g2.length
  const m1 = mean(g1)
  const m2 = mean(g2)
  const v1 = sampleVariance(g1)
  const v2 = sampleVariance(g2)
  const a = v1 / n1
  const b = v2 / n2
  const t = (m1 - m2) / Math.sqrt(a + b)
  const df = (a + b) ** 2 / (a ** 2 / (n1 - 1) + b ** 2 / (n2 - 1))
  const p = pFromT(t, df, tail)
  return { mean1: m1, mean2: m2, t, df, p, n1, n2 }
}

export type AnovaResult = {
  f: number
  dfBetween: number
  dfWithin: number
  p: number
  groupMeans: number[]
}

/** 單因子變異數分析 ANOVA */
export function anovaOneWay(groups: number[][]): AnovaResult {
  const k = groups.length
  const all = groups.flat()
  const grand = mean(all)
  const N = all.length
  let ssb = 0
  let ssw = 0
  const groupMeans = groups.map((g) => mean(g))
  groups.forEach((g, i) => {
    ssb += g.length * (groupMeans[i] - grand) ** 2
    ssw += g.reduce((a, x) => a + (x - groupMeans[i]) ** 2, 0)
  })
  const dfBetween = k - 1
  const dfWithin = N - k
  const msb = ssb / dfBetween
  const msw = ssw / dfWithin
  const f = msb / msw
  const p = 1 - jStat.centralF.cdf(f, dfBetween, dfWithin)
  return { f, dfBetween, dfWithin, p, groupMeans }
}

export type ChiResult = {
  chi2: number
  df: number
  p: number
  observed: number[][]
  expected: number[][]
}

/** 卡方獨立性檢定（給定列聯表） */
export function chiSquareIndependence(table: number[][]): ChiResult {
  const rows = table.length
  const cols = table[0].length
  const rowSums = table.map((r) => r.reduce((a, b) => a + b, 0))
  const colSums = Array.from({ length: cols }, (_, j) => table.reduce((a, r) => a + r[j], 0))
  const total = rowSums.reduce((a, b) => a + b, 0)
  const expected = table.map((_, i) => colSums.map((cs) => (rowSums[i] * cs) / total))
  let chi2 = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      chi2 += (table[i][j] - expected[i][j]) ** 2 / expected[i][j]
    }
  }
  const df = (rows - 1) * (cols - 1)
  const p = 1 - jStat.chisquare.cdf(chi2, df)
  return { chi2, df, p, observed: table, expected }
}

export type GofCell = {
  category: string
  observed: number
  expected: number
  proportion: number
  contribution: number
}
export type GofResult = { chi2: number; df: number; p: number; total: number; cells: GofCell[] }

/**
 * 卡方適配性檢定（goodness-of-fit）。
 * weights 為各類別的「期望權重」（比例或期望次數皆可，內部自動正規化為比例）。
 */
export function chiSquareGoodnessOfFit(
  categories: string[],
  observed: number[],
  weights: number[],
): GofResult {
  const total = observed.reduce((a, b) => a + b, 0)
  const wsum = weights.reduce((a, b) => a + b, 0)
  let chi2 = 0
  const cells: GofCell[] = categories.map((category, i) => {
    const proportion = weights[i] / wsum
    const expected = total * proportion
    const contribution = (observed[i] - expected) ** 2 / expected
    chi2 += contribution
    return { category, observed: observed[i], expected, proportion, contribution }
  })
  const df = categories.length - 1
  const p = 1 - jStat.chisquare.cdf(chi2, df)
  return { chi2, df, p, total, cells }
}

export type Pairwise = {
  a: string
  b: string
  meanA: number
  meanB: number
  meanDiff: number
  t: number
  df: number
  rawP: number
  adjP: number
  significant: boolean
}

/**
 * ANOVA 事後兩兩比較：對每一對組別做雙尾 Welch t，再以 Bonferroni 或 Holm 校正多重比較。
 * significant 以校正後 p < alpha 判定。
 */
export function postHocPairwise(
  groups: { label: string; values: number[] }[],
  alpha: number,
  method: 'bonferroni' | 'holm',
): Pairwise[] {
  const valid = groups.filter((g) => g.values.length >= 2)
  const comps: Pairwise[] = []
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const r = welchT(valid[i].values, valid[j].values, 'two')
      comps.push({
        a: valid[i].label,
        b: valid[j].label,
        meanA: r.mean1,
        meanB: r.mean2,
        meanDiff: r.mean1 - r.mean2,
        t: r.t,
        df: r.df,
        rawP: r.p,
        adjP: r.p,
        significant: false,
      })
    }
  }
  const m = comps.length || 1
  if (method === 'bonferroni') {
    comps.forEach((c) => {
      c.adjP = Math.min(c.rawP * m, 1)
    })
  } else {
    // Holm：依 rawP 升冪，第 k 名乘 (m-k)，並取累進最大值確保單調
    const order = comps.map((_, i) => i).sort((x, y) => comps[x].rawP - comps[y].rawP)
    let running = 0
    order.forEach((idx, k) => {
      running = Math.max(running, Math.min(comps[idx].rawP * (m - k), 1))
      comps[idx].adjP = running
    })
  }
  comps.forEach((c) => {
    c.significant = c.adjP < alpha
  })
  return comps
}

/**
 * 解析使用者輸入的「自訂期望分布」成各類別的權重陣列。
 * 支援：純數字列表（依類別順序，可為比例或期望次數）；具名 `類別=比例`；百分比 `40%`。
 * 不可名稱與純數字混用。回傳長度與 categories 相同的非負權重。
 */
export function parseExpectedWeights(input: string, categories: string[]): number[] {
  const text = String(input || '').trim()
  if (!text) throw new Error('請輸入自訂比例或期望次數。')
  const normalized = text.replace(/；/g, ';').replace(/，/g, ',').replace(/\n/g, ',')
  const parts = normalized.split(/[;,]+/).map((s) => s.trim()).filter(Boolean)
  const values = new Array<number | null>(categories.length).fill(null)
  const index = new Map(categories.map((c, i) => [String(c), i]))
  let named = false
  const unnamed: number[] = []

  for (const part of parts) {
    const mNamed = part.match(/^(.+?)\s*[:=：]\s*(-?\d+(?:\.\d+)?)\s*%?$/)
    if (mNamed) {
      named = true
      const key = mNamed[1].trim()
      let v = Number(mNamed[2])
      if (part.includes('%')) v = v / 100
      if (!Number.isFinite(v) || v < 0) throw new Error('自訂比例／期望次數必須是非負數。')
      if (!index.has(key)) throw new Error(`自訂比例中的類別「${key}」不在資料類別中。`)
      values[index.get(key)!] = v
    } else {
      const isPercent = part.includes('%')
      let v = Number(part.replace('%', '').trim())
      if (isPercent) v = v / 100
      if (!Number.isFinite(v) || v < 0) throw new Error('自訂比例／期望次數必須是非負數。')
      unnamed.push(v)
    }
  }

  if (named) {
    if (unnamed.length) throw new Error('請不要混用「類別=比例」與純數字列表，二擇一即可。')
    if (values.some((v) => v === null)) throw new Error('使用「類別=比例」時，每個資料類別都要指定。')
    return values as number[]
  }
  if (unnamed.length !== categories.length)
    throw new Error(`自訂數值數量需等於類別數，目前有 ${categories.length} 類。`)
  return unnamed
}

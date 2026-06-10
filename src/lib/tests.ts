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

export type TResult = { mean: number; t: number; df: number; p: number; n: number }

/** 單樣本 t 檢定 */
export function oneSampleT(data: number[], mu0: number): TResult {
  const n = data.length
  const m = mean(data)
  const sd = Math.sqrt(sampleVariance(data))
  const se = sd / Math.sqrt(n)
  const t = (m - mu0) / se
  const df = n - 1
  const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df))
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

/** 獨立樣本 Welch t 檢定（不假設變異數相等） */
export function welchT(g1: number[], g2: number[]): WelchResult {
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
  const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df))
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

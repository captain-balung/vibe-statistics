// 描述統計純函式。母體口徑（除以 N），與畫面顯示的 σ 公式一致。
// 無副作用：輸入數列、輸出數值。所有顯示的統計量都由此即時運算（不得造假）。

export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/** 每筆資料對平均的離差 xᵢ − x̄ */
export function deviations(xs: number[]): number[] {
  const m = mean(xs)
  return xs.map((x) => x - m)
}

/** 平均離差（絕對值）：|xᵢ − x̄| 的平均 */
export function meanAbsoluteDeviation(xs: number[]): number {
  if (xs.length === 0) return NaN
  const m = mean(xs)
  return xs.reduce((a, x) => a + Math.abs(x - m), 0) / xs.length
}

/** 母體變異數：(xᵢ − x̄)² 的平均（除以 N） */
export function variance(xs: number[]): number {
  if (xs.length === 0) return NaN
  const m = mean(xs)
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length
}

/** 母體標準差：變異數的平方根 */
export function standardDeviation(xs: number[]): number {
  return Math.sqrt(variance(xs))
}

/** 組合數 C(n, k)（乘法式，避免階乘溢位） */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let result = 1
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return Math.round(result)
}

/** Pearson 相關係數 r */
export function pearsonR(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return NaN
  const mx = mean(xs.slice(0, n))
  const my = mean(ys.slice(0, n))
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }
  const denom = Math.sqrt(sxx * syy)
  return denom === 0 ? NaN : sxy / denom
}

/** 最小平方線性回歸：回傳 { slope, intercept }（y = slope·x + intercept） */
export function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return { slope: NaN, intercept: NaN }
  const mx = mean(xs.slice(0, n))
  const my = mean(ys.slice(0, n))
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
  }
  const slope = sxx === 0 ? NaN : sxy / sxx
  const intercept = my - slope * mx
  return { slope, intercept }
}

/**
 * 產生 n 筆常態分佈整數資料（Box-Muller）。注意：此為產生器（用到亂數，非純函式）。
 */
export function genNormalIntegers(n: number, mu: number, sigma: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    let u1 = Math.random()
    const u2 = Math.random()
    if (u1 < 1e-12) u1 = 1e-12
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    out.push(Math.round(mu + sigma * z))
  }
  return out
}

/** 直方圖分箱（純函式）：回傳每箱標籤與計數 */
export function histogram(xs: number[], bins = 12): { labels: string[]; counts: number[] } {
  if (xs.length === 0) return { labels: [], counts: [] }
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  if (lo === hi) return { labels: [`${lo}`], counts: [xs.length] }
  const width = (hi - lo) / bins
  const counts = new Array(bins).fill(0)
  for (const x of xs) {
    let b = Math.floor((x - lo) / width)
    if (b >= bins) b = bins - 1
    if (b < 0) b = 0
    counts[b]++
  }
  const labels = counts.map((_, i) => {
    const a = lo + i * width
    return Number(a.toFixed(1)).toString()
  })
  return { labels, counts }
}

/**
 * 解析使用者輸入的數列：以逗號、空白或換行分隔。
 * 回傳成功解析的數值與「無法辨識的字串」清單（供 UI 提示，不靜默吞掉）。
 */
export function parseNumbers(text: string): { values: number[]; invalid: string[] } {
  const tokens = text.split(/[\s,]+/).filter((t) => t.length > 0)
  const values: number[] = []
  const invalid: string[] = []
  for (const t of tokens) {
    const n = Number(t)
    if (Number.isFinite(n)) values.push(n)
    else invalid.push(t)
  }
  return { values, invalid }
}

// 標準常態分佈純函式（F-DESC-02 / 之後 Z 檢定共用）。
// 正確性紅線：normCdf 與標準常態表對照誤差須 < 0.001。

/** 誤差函數 erf：Abramowitz & Stegun 7.1.26 近似（最大誤差約 1.5e-7） */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax)
  return sign * y
}

/** 標準常態累積分佈：P(Z ≤ z)（左尾累積機率） */
export function normCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/**
 * 標準常態反函數：給定左尾累積機率 p（0<p<1），回傳對應 z。
 * Acklam 的有理近似（相對誤差約 1.15e-9）。
 */
export function normInv(p: number): number {
  if (p <= 0 || p >= 1 || Number.isNaN(p)) return NaN
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ]
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
  ]
  const plow = 0.02425
  const phigh = 1 - plow
  let q: number
  let r: number
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
  if (p <= phigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  }
  q = Math.sqrt(-2 * Math.log(1 - p))
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  )
}

/** Z 分數 → 左尾累積百分比（0–100） */
export function zToPercentile(z: number): number {
  return normCdf(z) * 100
}

/** 左尾累積百分比（0–100）→ Z 分數 */
export function percentileToZ(percentile: number): number {
  return normInv(percentile / 100)
}

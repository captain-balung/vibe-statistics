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

import { describe, it, expect } from 'vitest'
import { oneSampleT, welchT, anovaOneWay, chiSquareIndependence } from './tests'

// 標準答案驗證（對應 design.md 工序）。統計量與 df 為手算精確值；
// p 值對照 R/權威值。容差：統計量 4 位小數、p 值絕對誤差 < 2e-3。

describe('單樣本 t（oneSampleT）', () => {
  it('[1,2,3,4,5] μ₀=2 → t=1.41421, df=4, p≈0.2302', () => {
    const r = oneSampleT([1, 2, 3, 4, 5], 2)
    expect(r.mean).toBeCloseTo(3, 6)
    expect(r.t).toBeCloseTo(1.41421, 4)
    expect(r.df).toBe(4)
    expect(r.p).toBeCloseTo(0.2302, 3)
  })
  it('平均等於 μ₀ → t=0, p=1', () => {
    const r = oneSampleT([2, 4, 4, 4, 5, 5, 7, 9], 5)
    expect(r.t).toBeCloseTo(0, 9)
    expect(r.p).toBeCloseTo(1, 6)
  })
})

describe('Welch t（welchT）', () => {
  it('[1..5] vs [6..10] → t=-5, df=8, p≈0.00105', () => {
    const r = welchT([1, 2, 3, 4, 5], [6, 7, 8, 9, 10])
    expect(r.t).toBeCloseTo(-5, 6)
    expect(r.df).toBeCloseTo(8, 6)
    expect(r.p).toBeCloseTo(0.00105, 3)
  })
})

describe('單因子 ANOVA（anovaOneWay）', () => {
  it('[1,2,3][4,5,6][7,8,9] → F=27, df=2/6, p≈0.00099', () => {
    const r = anovaOneWay([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])
    expect(r.f).toBeCloseTo(27, 6)
    expect(r.dfBetween).toBe(2)
    expect(r.dfWithin).toBe(6)
    expect(r.p).toBeCloseTo(0.001, 3)
  })
})

describe('卡方獨立性（chiSquareIndependence）', () => {
  it('[[10,20],[30,40]] → χ²=0.79365, df=1, p≈0.3729', () => {
    const r = chiSquareIndependence([
      [10, 20],
      [30, 40],
    ])
    expect(r.chi2).toBeCloseTo(0.79365, 4)
    expect(r.df).toBe(1)
    expect(r.p).toBeCloseTo(0.3729, 3)
    expect(r.expected[0][0]).toBeCloseTo(12, 6)
  })
})

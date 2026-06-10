import { describe, it, expect } from 'vitest'
import {
  oneSampleT,
  welchT,
  anovaOneWay,
  chiSquareIndependence,
  chiSquareGoodnessOfFit,
  postHocPairwise,
  parseExpectedWeights,
} from './tests'

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

describe('卡方適配性（chiSquareGoodnessOfFit）', () => {
  it('觀察[10,20,30,40] 期望平均 → χ²=20, df=3, p≈0.00017', () => {
    const r = chiSquareGoodnessOfFit(['A', 'B', 'C', 'D'], [10, 20, 30, 40], [1, 1, 1, 1])
    expect(r.chi2).toBeCloseTo(20, 6)
    expect(r.df).toBe(3)
    expect(r.p).toBeCloseTo(0.00017, 4) // R: pchisq(20,3,lower.tail=F)=1.697e-4
    expect(r.cells[0].expected).toBeCloseTo(25, 6)
    expect(r.total).toBe(100)
  })
  it('觀察[30,20,25,25] 期望比例[.4,.3,.2,.1] → χ²≈29.5833, df=3', () => {
    const r = chiSquareGoodnessOfFit(['A', 'B', 'C', 'D'], [30, 20, 25, 25], [0.4, 0.3, 0.2, 0.1])
    expect(r.chi2).toBeCloseTo(29.58333, 4)
    expect(r.df).toBe(3)
    expect(r.cells[0].expected).toBeCloseTo(40, 6)
    expect(r.cells[3].expected).toBeCloseTo(10, 6)
  })
})

describe('ANOVA 事後比較（postHocPairwise）', () => {
  const groups = [
    { label: 'A', values: [1, 2, 3] },
    { label: 'B', values: [4, 5, 6] },
    { label: 'C', values: [7, 8, 9] },
  ]
  it('Bonferroni：A vs C 達顯著、A vs B 不顯著', () => {
    const r = postHocPairwise(groups, 0.05, 'bonferroni')
    expect(r).toHaveLength(3)
    const ab = r.find((c) => c.a === 'A' && c.b === 'B')!
    const ac = r.find((c) => c.a === 'A' && c.b === 'C')!
    // 純代數可外部驗證的部分
    expect(ab.t).toBeCloseTo(-3.674235, 4)
    expect(ab.df).toBeCloseTo(4, 6)
    expect(ab.meanDiff).toBeCloseTo(-3, 6)
    expect(ac.t).toBeCloseTo(-7.348469, 4)
    // R: 2*pt(-3.674235,4)=0.02128；2*pt(-7.348469,4)=0.001836
    expect(ab.rawP).toBeCloseTo(0.02128, 3)
    expect(ac.rawP).toBeCloseTo(0.001836, 3)
    expect(ac.adjP).toBeCloseTo(0.005508, 3) // 0.001836*3
    expect(ac.significant).toBe(true)
    expect(ab.significant).toBe(false)
  })
  it('Holm：較有力，三對皆達顯著', () => {
    const r = postHocPairwise(groups, 0.05, 'holm')
    expect(r.every((c) => c.significant)).toBe(true)
  })
})

describe('自訂期望分布解析（parseExpectedWeights）', () => {
  it('純數字列表依序套用', () => {
    expect(parseExpectedWeights('0.4, 0.3, 0.2, 0.1', ['A', 'B', 'C', 'D'])).toEqual([0.4, 0.3, 0.2, 0.1])
  })
  it('具名與百分比', () => {
    expect(parseExpectedWeights('A=40%, B=30%, C=20%, D=10%', ['A', 'B', 'C', 'D'])).toEqual([0.4, 0.3, 0.2, 0.1])
  })
  it('數量不符會丟錯', () => {
    expect(() => parseExpectedWeights('0.5, 0.5', ['A', 'B', 'C'])).toThrow()
  })
})

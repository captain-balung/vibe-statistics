// jStat 最小型別宣告（npm 無 @types/jstat）。只宣告本專案用到的分布 CDF。
declare module 'jstat' {
  export const jStat: {
    studentt: { cdf(t: number, dof: number): number }
    centralF: { cdf(x: number, df1: number, df2: number): number }
    chisquare: { cdf(x: number, dof: number): number }
    normal: { cdf(x: number, mean: number, std: number): number }
  }
}

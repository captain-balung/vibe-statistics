import { Link } from 'react-router-dom'
import Formula from '../../components/Formula'
import BarChart from '../../components/BarChart'

// 佔位單元頁，掛在 MVP 未來的路徑 #/descriptive/stdev。
// 目前作為 0.3.1（KaTeX）與 0.3.2（Chart.js）的共用基礎設施測試；
// 0.4.1 會把這裡長成完整的標準差互動圖解（F-DESC-01）。
const SAMPLE = [4, 8, 6, 10, 12]

export default function DescriptiveStdev() {
  return (
    <section className="page">
      <h1>描述統計 · 標準差圖解</h1>
      <p className="placeholder-note">
        （佔位頁，同時用來驗證共用基礎設施。0.4.1 將長成完整的標準差互動圖解：平均、離差、變異數、標準差 + 長條圖。）
      </p>

      <h2>公式排版測試（KaTeX）</h2>
      <p>母體標準差的定義：</p>
      <Formula
        block
        tex={'\\sigma = \\sqrt{\\dfrac{1}{N}\\sum_{i=1}^{N}\\left(x_i - \\bar{x}\\right)^2}'}
      />

      <h2>圖表測試（Chart.js）</h2>
      <p>範例資料 {`[${SAMPLE.join(', ')}]`} 的長條圖：</p>
      <div style={{ maxWidth: 520 }}>
        <BarChart labels={SAMPLE.map((_, i) => `x${i + 1}`)} values={SAMPLE} label="數值" />
      </div>

      <p style={{ marginTop: 24 }}>
        <Link to="/">← 回入口頁</Link>
      </p>
    </section>
  )
}

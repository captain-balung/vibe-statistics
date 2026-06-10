import { Link } from 'react-router-dom'

// 佔位單元頁，掛在 MVP 未來的路徑 #/descriptive/stdev。
// 0.4.1 會把這裡長成標準差互動圖解（F-DESC-01）。
export default function DescriptiveStdev() {
  return (
    <section className="page">
      <h1>描述統計 · 標準差圖解</h1>
      <p className="placeholder-note">
        （佔位頁。此路徑將於 MVP 階段長成標準差互動圖解：平均、離差、變異數、標準差 + 長條圖。）
      </p>
      <p>
        <Link to="/">← 回入口頁</Link>
      </p>
    </section>
  )
}

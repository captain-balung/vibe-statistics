import { Link } from 'react-router-dom'

// F-CORE-01 入口頁：導覽至四大單元。
const UNITS = [
  {
    to: '/descriptive',
    title: '描述統計',
    desc: '把一堆數字的中心與離散程度「看見」出來。',
    tools: '標準差圖解 · Z 分數換算 · 常態模擬 · 相關與回歸',
  },
  {
    to: '/probability',
    title: '機率模擬',
    desc: '用硬幣、骰子與賭場，動手體驗機率與期望值。',
    tools: '鐘形曲線 · 二項分配 · 賭場優勢 · 下注模擬 · 骰寶',
  },
  {
    to: '/ztest',
    title: 'Z 檢定練習',
    desc: '自動出題、自己作答、立即對答案，還能 AI 評分。',
    tools: '情境出題 · 自我對答案 · AI 評分',
  },
  {
    to: '/toolbox',
    title: 'Excel 工具箱',
    desc: '上傳 .xlsx，跑 t 檢定、ANOVA、卡方，附教學解釋。',
    tools: '單樣本 t · Welch t · 單因子 ANOVA · 卡方獨立性',
  },
]

export default function EntryPage() {
  return (
    <section className="entry">
      <p className="pill">給初學者的統計練習場</p>
      <h1 className="entry-title">統計，沒那麼可怕。</h1>
      <p className="entry-lead">
        零安裝、即時運算的繁體中文統計教學互動網站。用視覺化與白話解釋，把抽象的統計變成可以動手玩的東西。
      </p>
      <div className="trust-points">
        <span>✓ 零安裝</span>
        <span>✓ 免註冊</span>
        <span>✓ 資料留在你的瀏覽器</span>
      </div>

      <div className="entry-grid">
        {UNITS.map((u) => (
          <Link key={u.to} to={u.to} className="entry-card">
            <div className="entry-card-head">
              <h2>{u.title}</h2>
              <span className="arrow">→</span>
            </div>
            <p className="entry-card-desc">{u.desc}</p>
            <p className="entry-card-tools">{u.tools}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

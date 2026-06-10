import { Link } from 'react-router-dom'

// 入口頁佔位（F-CORE-01 的雛形）。正式四單元卡片網格在後續 phase 依設計系統長出。
export default function EntryPage() {
  return (
    <section className="page">
      <p className="pill">給初學者的統計練習場</p>
      <h1>統計，沒那麼可怕。</h1>
      <p className="lead">
        零安裝、免註冊、打開瀏覽器就能動手玩的繁體中文統計自學網站。
      </p>
      <p className="placeholder-note">
        （Phase 0 骨架：路由與部署管線打通中。四大單元入口卡片即將下水。）
      </p>
      <ul className="unit-list">
        <li>
          <Link to="/descriptive/stdev">→ 描述統計（佔位單元頁）</Link>
        </li>
      </ul>
    </section>
  )
}

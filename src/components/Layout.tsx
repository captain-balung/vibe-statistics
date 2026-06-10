import { Link, NavLink, Outlet } from 'react-router-dom'

// 全站共用外殼 + 導覽列（F-CORE-02）。正式設計系統樣式於後續 phase 套用。
// 連到各單元根路徑（不設 end），子分頁切換時頂層單元仍正確高亮
const UNITS = [
  { to: '/descriptive', label: '描述統計' },
  { to: '/probability', label: '機率模擬' },
  { to: '/ztest', label: 'Z 檢定練習' },
  { to: '/toolbox', label: 'Excel 工具箱' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <Link to="/" className="brand">
          vibe statistics
        </Link>
        <div className="nav-links">
          {UNITS.map((u) => (
            <NavLink
              key={u.to}
              to={u.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {u.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

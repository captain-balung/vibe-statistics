import { Routes, Route, Link } from 'react-router-dom'
import EntryPage from './pages/EntryPage'
import DescriptiveStdev from './pages/units/DescriptiveStdev'
import './App.css'

// Phase 0 骨架：先把路由通水。共用 Layout/導覽列在 0.3.3 才正式長出來，
// 這裡用最簡導覽列驗證 HashRouter 切換與重整不 404。
function App() {
  return (
    <div className="app-shell">
      <nav className="skeleton-nav">
        <Link to="/" className="brand">
          vibe statistics
        </Link>
        <Link to="/descriptive/stdev">描述統計（佔位）</Link>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<EntryPage />} />
          <Route path="/descriptive/stdev" element={<DescriptiveStdev />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

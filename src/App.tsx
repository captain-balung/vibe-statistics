import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import EntryPage from './pages/EntryPage'
import DescriptiveStdev from './pages/units/DescriptiveStdev'
import UnitPlaceholder from './pages/units/UnitPlaceholder'
import './App.css'

// Phase 0 路由骨架。四單元各有路徑；描述統計已掛在 MVP 路徑，其餘為佔位。
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EntryPage />} />
        <Route path="/descriptive/stdev" element={<DescriptiveStdev />} />
        <Route path="/probability" element={<UnitPlaceholder title="機率模擬" />} />
        <Route path="/ztest" element={<UnitPlaceholder title="Z 檢定練習" />} />
        <Route path="/toolbox" element={<UnitPlaceholder title="Excel 工具箱" />} />
      </Route>
    </Routes>
  )
}

export default App

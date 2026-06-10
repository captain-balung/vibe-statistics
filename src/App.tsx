import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import EntryPage from './pages/EntryPage'
import DescriptiveStdev from './pages/units/DescriptiveStdev'
import ZScore from './pages/units/ZScore'
import NormalSim from './pages/units/NormalSim'
import Regression from './pages/units/Regression'
import BellCurve from './pages/units/probability/BellCurve'
import Binomial from './pages/units/probability/Binomial'
import Casino from './pages/units/probability/Casino'
import FixedBet from './pages/units/probability/FixedBet'
import Martingale from './pages/units/probability/Martingale'
import SicBo from './pages/units/probability/SicBo'
import ZTest from './pages/units/ZTest'
import Toolbox from './pages/units/Toolbox'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EntryPage />} />

        {/* 描述統計 */}
        <Route path="/descriptive" element={<Navigate to="/descriptive/stdev" replace />} />
        <Route path="/descriptive/stdev" element={<DescriptiveStdev />} />
        <Route path="/descriptive/zscore" element={<ZScore />} />
        <Route path="/descriptive/normal" element={<NormalSim />} />
        <Route path="/descriptive/regression" element={<Regression />} />

        {/* 機率模擬 */}
        <Route path="/probability" element={<Navigate to="/probability/bellcurve" replace />} />
        <Route path="/probability/bellcurve" element={<BellCurve />} />
        <Route path="/probability/binomial" element={<Binomial />} />
        <Route path="/probability/casino" element={<Casino />} />
        <Route path="/probability/fixedbet" element={<FixedBet />} />
        <Route path="/probability/martingale" element={<Martingale />} />
        <Route path="/probability/sicbo" element={<SicBo />} />

        {/* Z 檢定練習 */}
        <Route path="/ztest" element={<ZTest />} />

        {/* Excel 工具箱 */}
        <Route path="/toolbox" element={<Toolbox />} />
      </Route>
    </Routes>
  )
}

export default App

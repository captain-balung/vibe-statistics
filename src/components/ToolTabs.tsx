import { NavLink } from 'react-router-dom'

// 單元內的子工具分頁。傳入該單元的分頁清單。
export type Tab = { to: string; label: string }

export default function ToolTabs({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="tool-tabs">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) => (isActive ? 'tool-tab active' : 'tool-tab')}
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  )
}

// 描述統計單元已實作的子分頁（隨開發逐一加入，避免死連結）
export const DESCRIPTIVE_TABS: Tab[] = [
  { to: '/descriptive/stdev', label: '標準差圖解' },
  { to: '/descriptive/zscore', label: 'Z 分數換算' },
  { to: '/descriptive/normal', label: '常態模擬' },
  { to: '/descriptive/regression', label: '相關與回歸' },
]

// 機率模擬單元的子分頁
export const PROBABILITY_TABS: Tab[] = [
  { to: '/probability/bellcurve', label: '鐘形曲線' },
  { to: '/probability/binomial', label: '二項分配' },
  { to: '/probability/casino', label: '賭場優勢' },
  { to: '/probability/fixedbet', label: '固定注模擬' },
  { to: '/probability/martingale', label: '馬丁格爾' },
  { to: '/probability/sicbo', label: '骰寶' },
]

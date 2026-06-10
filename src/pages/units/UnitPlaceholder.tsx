import { Link } from 'react-router-dom'

// 尚未開發的單元佔位頁。後續 phase 各自長成完整單元。
export default function UnitPlaceholder({ title }: { title: string }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <p className="placeholder-note">
        （此單元尚在塢中建造。骨架與導覽已就位，功能將於後續航程逐一下水。）
      </p>
      <p>
        <Link to="/">← 回入口頁</Link>
      </p>
    </section>
  )
}

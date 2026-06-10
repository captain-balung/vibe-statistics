import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// 共用 Chart.js 長條圖封裝。正式設計系統配色於後續導入；此處先用主色草綠。
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type Props = {
  labels: (string | number)[]
  values: number[]
  label?: string
  /** 每根棒子的顏色（離差圖用：上綠下珊瑚）。省略則全用主色草綠。 */
  colors?: string | string[]
  /** y 軸是否從 0 起（離差圖含負值時設 false 以中線為基準） */
  beginAtZero?: boolean
}

export default function BarChart({ labels, values, label = '數值', colors, beginAtZero = true }: Props) {
  return (
    <Bar
      data={{
        labels,
        datasets: [{ label, data: values, backgroundColor: colors ?? '#639922' }],
      }}
      options={{
        responsive: true,
        animation: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero } },
      }}
    />
  )
}

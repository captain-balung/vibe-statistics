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
}

export default function BarChart({ labels, values, label = '數值' }: Props) {
  return (
    <Bar
      data={{
        labels,
        datasets: [{ label, data: values, backgroundColor: '#639922' }],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      }}
    />
  )
}

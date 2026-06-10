import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export type Series = { label: string; values: number[]; color: string; dashed?: boolean }

// 共用折線圖（餘額曲線等）。多條 series；可標虛線（如起始資金基準）。
export default function LineChart({
  labels,
  series,
}: {
  labels: (string | number)[]
  series: Series[]
}) {
  return (
    <Line
      data={{
        labels,
        datasets: series.map((s) => ({
          label: s.label,
          data: s.values,
          borderColor: s.color,
          backgroundColor: s.color,
          borderDash: s.dashed ? [6, 6] : undefined,
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.1,
        })),
      }}
      options={{
        responsive: true,
        animation: false,
        plugins: { legend: { display: series.length > 1 } },
        scales: { x: { ticks: { maxTicksLimit: 10 } } },
      }}
    />
  )
}

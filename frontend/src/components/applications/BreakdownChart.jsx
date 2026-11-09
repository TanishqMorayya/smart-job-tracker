import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { labelOf } from '../../utils/constants'

// options: JOB_TYPES or SOURCES. Zero-count rows are hidden so the chart stays readable.
export default function BreakdownChart({ items, options }) {
  const data = items
    .filter((i) => i.count > 0)
    .map((i) => ({
      name: i.label === 'NOT_SET' ? 'Not set' : labelOf(options, i.label),
      count: i.count,
    }))

  if (data.length === 0) return <p className="muted">No data yet.</p>

  return (
    <div className="chart-box chart-small">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }} />
          <Bar dataKey="count" name="Applications" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

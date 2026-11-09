import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { STATUSES, labelOf } from '../../utils/constants'

// distribution comes from the backend as [{ label: 'SAVED', count: 3 }, ...]
export default function StatusChart({ distribution }) {
  const data = distribution.map((d) => ({ name: labelOf(STATUSES, d.label), count: d.count }))

  return (
    <div className="chart-box">
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

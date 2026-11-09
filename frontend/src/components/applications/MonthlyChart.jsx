import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' })

// label arrives as '2026-11'
function monthName(label) {
  const [year, month] = label.split('-').map(Number)
  return monthFormat.format(new Date(year, month - 1, 1))
}

export default function MonthlyChart({ items }) {
  const data = items.map((m) => ({ name: monthName(m.label), count: m.count }))

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" name="Applications" stroke="#2563eb"
            strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

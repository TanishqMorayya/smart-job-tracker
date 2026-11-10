import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// data: [{ label, count }]. `horizontal` draws horizontal bars (better for long labels).
export default function CountBarChart({ data, color = '#2563eb', colorFor, horizontal = false, height = 260 }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={130} />
            </>
          ) : (
            <>
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
            </>
          )}
          <Tooltip />
          <Bar dataKey="count" name="Applications" radius={[4, 4, 4, 4]}>
            {data.map((d) => (
              <Cell key={d.label} fill={colorFor ? colorFor(d) : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

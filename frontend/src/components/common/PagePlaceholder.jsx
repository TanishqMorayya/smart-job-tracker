// TEMPORARY: replaced page by page as we build the real screens.
export default function PagePlaceholder({ title, note }) {
  return (
    <div>
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <div className="card">
        <p className="muted">{note}</p>
      </div>
    </div>
  )
}

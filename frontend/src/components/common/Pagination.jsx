// `page` is 0-based, like the backend.
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <button className="btn btn-secondary btn-sm" disabled={page === 0}
        onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="muted">Page {page + 1} of {totalPages}</span>
      <button className="btn btn-secondary btn-sm" disabled={page + 1 >= totalPages}
        onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  )
}

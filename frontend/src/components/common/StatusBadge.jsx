import { STATUSES, labelOf } from '../../utils/constants'

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${String(status).toLowerCase()}`}>
      {labelOf(STATUSES, status)}
    </span>
  )
}

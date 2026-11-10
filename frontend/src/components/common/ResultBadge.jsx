import { INTERVIEW_RESULTS, labelOf } from '../../utils/constants'

export default function ResultBadge({ result }) {
  return (
    <span className={`badge badge-result-${String(result).toLowerCase()}`}>
      {labelOf(INTERVIEW_RESULTS, result)}
    </span>
  )
}

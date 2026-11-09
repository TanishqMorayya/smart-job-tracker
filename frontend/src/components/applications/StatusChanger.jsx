import { useState } from 'react'
import { changeApplicationStatus } from '../../api/applicationApi'
import { parseError } from '../../api/axiosClient'
import SelectField from '../common/SelectField'
import FormField from '../common/FormField'
import ErrorMessage from '../common/ErrorMessage'
import { STATUSES } from '../../utils/constants'

export default function StatusChanger({ applicationId, currentStatus, onChanged }) {
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // The backend rejects "change to the same status", so it is not offered.
  const options = STATUSES.filter((s) => s.value !== currentStatus)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!status) {
      setError('Select a new status')
      return
    }
    if (note.trim().length > 255) {
      setError('Note must be at most 255 characters')
      return
    }

    setSaving(true)
    setError('')
    try {
      await changeApplicationStatus(applicationId, { status, note: note.trim() || null })
      setStatus('')
      setNote('')
      onChanged()
    } catch (err) {
      setError(parseError(err).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={error} />
      <SelectField label="Change status to" name="newStatus" value={status}
        onChange={(e) => setStatus(e.target.value)} options={options}
        placeholder="Select status" />
      <FormField label="Note (optional)" name="statusNote" value={note}
        placeholder="e.g. Got an interview call" onChange={(e) => setNote(e.target.value)} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
        {saving ? 'Updating...' : 'Update status'}
      </button>
    </form>
  )
}

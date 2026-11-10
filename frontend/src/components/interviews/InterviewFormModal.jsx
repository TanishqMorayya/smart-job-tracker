import { useState } from 'react'
import Modal from '../common/Modal'
import FormField from '../common/FormField'
import SelectField from '../common/SelectField'
import TextAreaField from '../common/TextAreaField'
import ErrorMessage from '../common/ErrorMessage'
import { createInterview, updateInterview } from '../../api/interviewApi'
import { parseError } from '../../api/axiosClient'
import { INTERVIEW_MODES, INTERVIEW_RESULTS, INTERVIEW_ROUNDS } from '../../utils/constants'

const EMPTY = { round: '', interviewDate: '', mode: '', interviewer: '', result: 'PENDING', notes: '' }

function validate(f) {
  const found = {}
  if (!f.round) found.round = 'Select a round'
  if (!f.interviewDate) found.interviewDate = 'Interview date and time is required'
  if (f.interviewer.trim().length > 100) found.interviewer = 'Interviewer must be at most 100 characters'
  return found
}

// `interview` is null when adding. `applicationId` is needed only for adding.
export default function InterviewFormModal({ applicationId, interview, onClose, onSaved }) {
  const isEdit = Boolean(interview)
  const [form, setForm] = useState(() =>
    interview
      ? {
          round: interview.round,
          // the date-time input needs 'YYYY-MM-DDTHH:mm' (no seconds)
          interviewDate: interview.interviewDate.slice(0, 16),
          mode: interview.mode ?? '',
          interviewer: interview.interviewer ?? '',
          result: interview.result,
          notes: interview.notes ?? '',
        }
      : EMPTY,
  )
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const payload = {
      round: form.round,
      interviewDate: form.interviewDate,
      mode: form.mode || null,
      interviewer: form.interviewer.trim() || null,
      result: form.result,
      notes: form.notes.trim() || null,
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateInterview(interview.id, payload)
      } else {
        await createInterview(applicationId, payload)
      }
      onSaved()
    } catch (err) {
      const parsed = parseError(err)
      setServerError(parsed.message)
      setErrors(parsed.fieldErrors)
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit interview' : 'Add interview'} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={serverError} />
        <SelectField label="Round *" name="round" value={form.round} onChange={handleChange}
          error={errors.round} options={INTERVIEW_ROUNDS} placeholder="Select a round" />
        <FormField label="Date and time *" name="interviewDate" type="datetime-local"
          value={form.interviewDate} onChange={handleChange} error={errors.interviewDate} />
        <SelectField label="Mode" name="mode" value={form.mode} onChange={handleChange}
          error={errors.mode} options={INTERVIEW_MODES} placeholder="Not specified" />
        <FormField label="Interviewer" name="interviewer" value={form.interviewer}
          onChange={handleChange} error={errors.interviewer} />
        <SelectField label="Result" name="result" value={form.result} onChange={handleChange}
          error={errors.result} options={INTERVIEW_RESULTS} />
        <TextAreaField label="Notes" name="notes" rows={3} value={form.notes}
          onChange={handleChange} error={errors.notes} />
        <div className="btn-row">
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add interview'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

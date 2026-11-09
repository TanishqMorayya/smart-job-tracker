import { useState } from 'react'
import { createInterview, updateInterview } from '../../api/interviewApi'
import { parseError } from '../../api/axiosClient'
import FormField from '../common/FormField'
import SelectField from '../common/SelectField'
import TextAreaField from '../common/TextAreaField'
import ErrorMessage from '../common/ErrorMessage'
import { INTERVIEW_MODES, INTERVIEW_RESULTS, INTERVIEW_ROUNDS } from '../../utils/constants'

// Limits mirror the backend InterviewRequest validation.
function validate(v) {
  const errors = {}
  if (!v.round) errors.round = 'Round is required'
  if (!v.interviewDate) errors.interviewDate = 'Interview date is required'
  if (v.interviewer.trim().length > 100) {
    errors.interviewer = 'Interviewer must be at most 100 characters'
  }
  return errors
}

// applicationId is needed to create; an existing interview is edited by its own id.
export default function InterviewForm({ applicationId, interview, onSaved, onCancel }) {
  const isEdit = Boolean(interview)
  const [values, setValues] = useState({
    round: interview?.round || '',
    // The backend sends '2026-11-25T15:00:00'; datetime-local wants '2026-11-25T15:00'.
    interviewDate: interview?.interviewDate ? interview.interviewDate.slice(0, 16) : '',
    mode: interview?.mode || '',
    interviewer: interview?.interviewer || '',
    result: interview?.result || 'PENDING',
    notes: interview?.notes || '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    const payload = {
      round: values.round,
      interviewDate: values.interviewDate,
      mode: values.mode || null,
      interviewer: values.interviewer.trim() || null,
      result: values.result,
      notes: values.notes.trim() || null,
    }

    setSaving(true)
    try {
      if (isEdit) await updateInterview(interview.id, payload)
      else await createInterview(applicationId, payload)
      onSaved(isEdit ? 'Interview updated' : 'Interview added')
    } catch (err) {
      const parsed = parseError(err)
      setErrors(parsed.fieldErrors)
      if (Object.keys(parsed.fieldErrors).length === 0) setFormError(parsed.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={saving ? undefined : onCancel}>
      <div className="modal modal-scroll" role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit interview' : 'Add interview'}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={formError} />
          <SelectField label="Round *" name="round" value={values.round} error={errors.round}
            onChange={handleChange} options={INTERVIEW_ROUNDS} placeholder="Select round" />
          <FormField label="Date and time *" name="interviewDate" type="datetime-local"
            value={values.interviewDate} error={errors.interviewDate} onChange={handleChange} />
          <SelectField label="Mode" name="mode" value={values.mode} error={errors.mode}
            onChange={handleChange} options={INTERVIEW_MODES} placeholder="Not specified" />
          <FormField label="Interviewer" name="interviewer" value={values.interviewer}
            placeholder="e.g. Rahul Sharma" error={errors.interviewer} onChange={handleChange} />
          <SelectField label="Result" name="result" value={values.result} error={errors.result}
            onChange={handleChange} options={INTERVIEW_RESULTS} />
          <TextAreaField label="Notes" name="notes" rows={3} value={values.notes}
            error={errors.notes} onChange={handleChange} />
          <div className="btn-row">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add interview'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}
              disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

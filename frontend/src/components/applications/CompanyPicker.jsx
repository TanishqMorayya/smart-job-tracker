import { useState } from 'react'
import SelectField from '../common/SelectField'
import { createCompany } from '../../api/companyApi'
import { parseError } from '../../api/axiosClient'

export default function CompanyPicker({ companies, value, onChange, error, onCompanyAdded }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [addError, setAddError] = useState('')
  const [saving, setSaving] = useState(false)

  const options = companies.map((c) => ({ value: String(c.id), label: c.name }))

  const handleAdd = async () => {
    if (!name.trim()) {
      setAddError('Enter a company name')
      return
    }
    setSaving(true)
    setAddError('')
    try {
      const company = await createCompany({ name: name.trim() })
      onCompanyAdded(company)
      setName('')
      setAdding(false)
    } catch (err) {
      const parsed = parseError(err)
      setAddError(parsed.fieldErrors.name || parsed.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <SelectField label="Company *" name="companyId" value={value} onChange={onChange}
        error={error} options={options} placeholder="Select a company" />
      {companies.length === 0 && !adding && (
        <p className="muted small">You have no companies yet. Add one to continue.</p>
      )}
      {!adding ? (
        <button type="button" className="link-btn" onClick={() => setAdding(true)}>
          + Add new company
        </button>
      ) : (
        <div className="inline-box">
          <input placeholder="Company name" value={name} autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }} />
          {addError && <span className="field-error">{addError}</span>}
          <div className="btn-row">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd} disabled={saving}>
              {saving ? 'Adding...' : 'Add'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={() => { setAdding(false); setAddError('') }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

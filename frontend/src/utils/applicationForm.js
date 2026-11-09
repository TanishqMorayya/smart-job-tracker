export const EMPTY_FORM = {
  companyId: '',
  jobTitle: '',
  jobType: '',
  location: '',
  workMode: '',
  salary: '',
  jobUrl: '',
  appliedDate: '',
  deadline: '',
  status: 'SAVED',
  source: '',
  resumeUsed: '',
  notes: '',
}

// API object -> form state (null becomes '' because inputs need strings).
export function toFormState(app) {
  return {
    companyId: String(app.companyId),
    jobTitle: app.jobTitle ?? '',
    jobType: app.jobType ?? '',
    location: app.location ?? '',
    workMode: app.workMode ?? '',
    salary: app.salary ?? '',
    jobUrl: app.jobUrl ?? '',
    appliedDate: app.appliedDate ?? '',
    deadline: app.deadline ?? '',
    status: app.status,
    source: app.source ?? '',
    resumeUsed: app.resumeUsed ?? '',
    notes: app.notes ?? '',
  }
}

// Same rules as the backend ApplicationRequest, so most mistakes are caught before the request.
export function validateForm(f) {
  const found = {}
  if (!f.companyId) found.companyId = 'Select a company'
  if (!f.jobTitle.trim()) found.jobTitle = 'Job title is required'
  else if (f.jobTitle.trim().length > 150) found.jobTitle = 'Job title must be at most 150 characters'
  if (!f.jobType) found.jobType = 'Select a job type'
  if (f.jobUrl.trim() && !/^https?:\/\/.+/.test(f.jobUrl.trim())) {
    found.jobUrl = 'Job URL must start with http:// or https://'
  }
  if (f.appliedDate && f.deadline && f.appliedDate > f.deadline) {
    found.deadline = 'Deadline cannot be before the applied date'
  }
  return found
}

const emptyToNull = (value) => (value === '' ? null : value)

// Empty optional fields are sent as null: an empty string is not a valid enum or date for the backend.
export function buildPayload(f, isEdit) {
  const payload = {
    companyId: Number(f.companyId),
    jobTitle: f.jobTitle.trim(),
    jobType: f.jobType,
    location: emptyToNull(f.location.trim()),
    workMode: emptyToNull(f.workMode),
    salary: emptyToNull(f.salary.trim()),
    jobUrl: emptyToNull(f.jobUrl.trim()),
    appliedDate: emptyToNull(f.appliedDate),
    deadline: emptyToNull(f.deadline),
    source: emptyToNull(f.source),
    resumeUsed: emptyToNull(f.resumeUsed.trim()),
    notes: emptyToNull(f.notes.trim()),
  }
  // Status is only chosen when creating. Later it changes through the status endpoint.
  if (!isEdit) payload.status = f.status
  return payload
}

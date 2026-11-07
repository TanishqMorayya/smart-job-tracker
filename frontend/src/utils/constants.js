// Values must match the backend enums exactly.
export const STATUSES = [
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'ONLINE_ASSESSMENT', label: 'Online Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

export const JOB_TYPES = [
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
]

export const WORK_MODES = [
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
]

export const SOURCES = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'COMPANY_WEBSITE', label: 'Company Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'COLLEGE_PLACEMENT', label: 'College Placement' },
  { value: 'JOB_PORTAL', label: 'Job Portal' },
  { value: 'OTHER', label: 'Other' },
]

export const INTERVIEW_ROUNDS = [
  { value: 'HR', label: 'HR' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'MANAGERIAL', label: 'Managerial' },
  { value: 'CODING', label: 'Coding' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'OTHER', label: 'Other' },
]

export const INTERVIEW_MODES = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'PHONE', label: 'Phone' },
]

export const INTERVIEW_RESULTS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
]

// Turns an enum value into its display label, e.g. 'FULL_TIME' -> 'Full Time'.
export const labelOf = (options, value) =>
  options.find((o) => o.value === value)?.label ?? value ?? '-'

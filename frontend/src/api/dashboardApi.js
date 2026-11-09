import api from './axiosClient'

export const getSummary = () => api.get('/dashboard/summary').then((r) => r.data)
export const getStatusDistribution = () =>
  api.get('/dashboard/status-distribution').then((r) => r.data)
export const getMonthly = () => api.get('/dashboard/monthly-applications').then((r) => r.data)
export const getByJobType = () => api.get('/dashboard/by-job-type').then((r) => r.data)
export const getBySource = () => api.get('/dashboard/by-source').then((r) => r.data)
export const getFunnel = () => api.get('/dashboard/funnel').then((r) => r.data)

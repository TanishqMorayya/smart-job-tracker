import api from './axiosClient'

export const getSummary = () => api.get('/dashboard/summary').then((r) => r.data)
export const getStatusDistribution = () =>
  api.get('/dashboard/status-distribution').then((r) => r.data)

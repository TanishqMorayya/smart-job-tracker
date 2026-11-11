import api from './axiosClient'

export const listApplications = (params) =>
  api.get('/applications', { params }).then((r) => r.data)
export const getApplication = (id) => api.get(`/applications/${id}`).then((r) => r.data)
export const createApplication = (payload) =>
  api.post('/applications', payload).then((r) => r.data)
export const updateApplication = (id, payload) =>
  api.put(`/applications/${id}`, payload).then((r) => r.data)
export const changeApplicationStatus = (id, payload) =>
  api.patch(`/applications/${id}/status`, payload).then((r) => r.data)
export const deleteApplication = (id) => api.delete(`/applications/${id}`)
export const getTimeline = (id) => api.get(`/applications/${id}/timeline`).then((r) => r.data)
export const checkDuplicates = (companyId, jobTitle) =>
  api.get('/applications/duplicates', { params: { companyId, jobTitle } }).then((r) => r.data)

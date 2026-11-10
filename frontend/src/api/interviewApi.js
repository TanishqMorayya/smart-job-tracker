import api from './axiosClient'

export const listAllInterviews = () => api.get('/interviews').then((r) => r.data)
export const listApplicationInterviews = (applicationId) =>
  api.get(`/applications/${applicationId}/interviews`).then((r) => r.data)
export const createInterview = (applicationId, payload) =>
  api.post(`/applications/${applicationId}/interviews`, payload).then((r) => r.data)
export const updateInterview = (id, payload) =>
  api.put(`/interviews/${id}`, payload).then((r) => r.data)
export const deleteInterview = (id) => api.delete(`/interviews/${id}`)

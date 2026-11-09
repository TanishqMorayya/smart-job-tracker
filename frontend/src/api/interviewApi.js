import api from './axiosClient'

export const listInterviewsForApplication = (applicationId) =>
  api.get(`/applications/${applicationId}/interviews`).then((r) => r.data)
export const createInterview = (applicationId, payload) =>
  api.post(`/applications/${applicationId}/interviews`, payload).then((r) => r.data)
export const updateInterview = (id, payload) =>
  api.put(`/interviews/${id}`, payload).then((r) => r.data)
export const deleteInterview = (id) => api.delete(`/interviews/${id}`)
export const listUpcomingInterviews = (limit = 10) =>
  api.get('/interviews/upcoming', { params: { limit } }).then((r) => r.data)
export const listPastInterviews = (limit = 10) =>
  api.get('/interviews/past', { params: { limit } }).then((r) => r.data)

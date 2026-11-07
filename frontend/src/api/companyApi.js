import api from './axiosClient'

export const listCompanies = (search) =>
  api.get('/companies', { params: search ? { search } : {} }).then((r) => r.data)
export const createCompany = (payload) => api.post('/companies', payload).then((r) => r.data)
export const updateCompany = (id, payload) =>
  api.put(`/companies/${id}`, payload).then((r) => r.data)
export const deleteCompany = (id) => api.delete(`/companies/${id}`)

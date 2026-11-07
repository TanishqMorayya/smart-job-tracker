import api from './axiosClient'

export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data)
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data)
export const fetchMe = () => api.get('/users/me').then((r) => r.data)

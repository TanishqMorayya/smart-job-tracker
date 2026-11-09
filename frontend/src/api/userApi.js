import api from './axiosClient'

export const updateProfile = (payload) => api.put('/users/me', payload).then((r) => r.data)

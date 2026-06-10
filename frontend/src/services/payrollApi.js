import api from './axios.js'

export const employeeApi = {
    getAll: () => api.get('/employees'),
    getById: (id) => api.get(`/employees/${id}`),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
}

export const payrollApi = {
    getAll: (month, year) => api.get('/payroll', { params: { month, year } }),
    getById: (id) => api.get(`/payroll/${id}`),
    create: (data) => api.post('/payroll', data),
    update: (id, data) => api.put(`/payroll/${id}`, data),
    delete: (id) => api.delete(`/payroll/${id}`),
    generate: (month, year) => api.post('/payroll/generate', { month, year }),
}

export const branchApi = {
    getAll: () => api.get('/branches'),
    getById: (id) => api.get(`/branches/${id}`),
    create: (data) => api.post('/branches', data),
    update: (id, data) => api.put(`/branches/${id}`, data),
    delete: (id) => api.delete(`/branches/${id}`),
}

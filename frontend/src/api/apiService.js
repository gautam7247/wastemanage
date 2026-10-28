import apiClient from './client';

const pageParams = (params = {}) => ({
  page: params.page ?? 0,
  size: params.size ?? 50,
  sort: params.sort || 'createdAt,desc',
  ...params,
});

export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data) => apiClient.patch('/users/me', data),
};

export const materialsApi = {
  getAll: () => apiClient.get('/materials'),
};

export const listingsApi = {
  getAll: (params) => apiClient.get('/listings', { params: pageParams(params) }),
  getById: (id) => apiClient.get(`/listings/${id}`),
  create: (data) => apiClient.post('/listings', data),
  update: (id, data) => apiClient.put(`/listings/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/listings/${id}/status`, { status }),
  getMyListings: (params) => apiClient.get('/farmers/me/listings', { params: pageParams(params) }),
};

export const farmerApi = {
  getMe: () => apiClient.get('/farmers/me'),
  updateMe: (data) => apiClient.put('/farmers/me', data),
  getPublic: (id) => apiClient.get(`/farmers/${id}`),
};

export const buyerApi = {
  getMe: () => apiClient.get('/buyers/me'),
  updateMe: (data) => apiClient.put('/buyers/me', data),
  getPublic: (id) => apiClient.get(`/buyers/${id}`),
};

export const requirementsApi = {
  create: (data) => apiClient.post('/buyer-requirements', data),
  getMyRequirements: (params) =>
    apiClient.get('/buyer-requirements/me', { params: pageParams(params) }),
  update: (id, data) => apiClient.put(`/buyer-requirements/${id}`, data),
  updateStatus: (id, active) => apiClient.patch(`/buyer-requirements/${id}/status`, { active }),
};

export const matchingApi = {
  getMatches: (requirementId) =>
    apiClient.get('/matches', { params: requirementId ? { requirementId } : {} }),
};

export const ordersApi = {
  create: (data) => apiClient.post('/orders', data),
  getMyOrders: (params) => apiClient.get('/orders/me', { params: pageParams(params) }),
  getById: (id) => apiClient.get(`/orders/${id}`),
  accept: (id) => apiClient.patch(`/orders/${id}/accept`),
  reject: (id) => apiClient.patch(`/orders/${id}/reject`),
  cancel: (id) => apiClient.patch(`/orders/${id}/cancel`),
  complete: (id) => apiClient.patch(`/orders/${id}/complete`),
};

export const paymentsApi = {
  checkout: (orderId, data) => apiClient.post(`/payments/orders/${orderId}/checkout`, data),
  getStatus: (orderId) => apiClient.get(`/payments/orders/${orderId}`),
  confirmSandbox: (payload) =>
    apiClient.post('/payments/webhook', payload, {
      headers: { 'X-Payment-Signature': 'sandbox_test_signature' },
    }),
};

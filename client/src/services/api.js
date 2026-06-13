import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Customers ---
export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const getCustomerMessages = (id) => api.get(`/customers/${id}/messages`);
export const getCustomerStats = () => api.get('/customers/stats');
export const uploadCustomers = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/customers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// --- Orders ---
export const uploadOrders = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/orders/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// --- Segments ---
export const getSegments = () => api.get('/segments');
export const createSegment = (data) => api.post('/segments', data);
export const previewSegment = (id) => api.get(`/segments/${id}/preview`);
export const deleteSegment = (id) => api.delete(`/segments/${id}`);

// --- Campaigns ---
export const getCampaigns = () => api.get('/campaigns');
export const getCampaignById = (id) => api.get(`/campaigns/${id}`);
export const createCampaign = (data) => api.post('/campaigns', data);
export const launchCampaign = (id) => api.post(`/campaigns/${id}/launch`);
export const getCampaignMessages = (id, params) => api.get(`/campaigns/${id}/messages`, { params });
export const getChannelStats = () => api.get('/campaigns/stats/channels');

// --- AI ---
export const aiChat = (message) => api.post('/ai/chat', { message });
export const aiSuggestSegment = (query) => api.post('/ai/suggest-segment', { query });
export const aiGenerateMessage = (data) => api.post('/ai/generate-message', data);
export const aiSimulateCampaign = (data) => api.post('/ai/simulate-campaign', data);
export const aiAutonomousPlan = (goal) => api.post('/ai/autonomous-plan', { goal });
export const aiDiscoverOpportunities = () => api.post('/ai/discover-opportunities');
export const aiGeneratePersonas = () => api.post('/ai/generate-personas');
export const aiLearn = (campaignId) => api.post('/ai/learn', { campaignId });
export const getOpportunities = () => api.get('/ai/opportunities');
export const getPersonas = () => api.get('/ai/personas');
export const getLearnings = () => api.get('/ai/learnings');
export const getExecutiveBrief = () => api.get('/ai/executive-brief');
export const exportCustomersCSV = () => api.get('/ai/export/customers', { responseType: 'blob' });
export const exportCampaignCSV = (id) => api.get(`/ai/export/campaign/${id}`, { responseType: 'blob' });
export const getAnomalies = () => api.get('/ai/anomalies');

export default api;

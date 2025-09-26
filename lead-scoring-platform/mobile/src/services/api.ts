import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Lead, 
  Campaign, 
  ApiResponse, 
  LeadFilters, 
  CampaignFilters,
  DashboardAnalytics,
  ScoringExplanation,
  IntegrationSettings
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (userData: any): Promise<ApiResponse<{ user: User; token: string }>> =>
    api.post('/auth/register', userData).then(res => res.data),
  
  getCurrentUser: (): Promise<ApiResponse<{ user: User }>> =>
    api.get('/auth/me').then(res => res.data),
  
  updateProfile: (data: Partial<User>): Promise<ApiResponse<{ user: User }>> =>
    api.put('/auth/profile', data).then(res => res.data),
  
  updatePreferences: (preferences: User['preferences']): Promise<ApiResponse<{ preferences: User['preferences'] }>> =>
    api.put('/auth/preferences', { preferences }).then(res => res.data),
  
  changePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> =>
    api.put('/auth/password', { currentPassword, newPassword }).then(res => res.data),
};

// Leads API
export const leadsApi = {
  getLeads: (filters?: LeadFilters): Promise<ApiResponse<Lead[]>> =>
    api.get('/leads', { params: filters }).then(res => res.data),
  
  getLead: (id: string): Promise<ApiResponse<Lead>> =>
    api.get(`/leads/${id}`).then(res => res.data),
  
  createLead: (leadData: Partial<Lead>): Promise<ApiResponse<Lead>> =>
    api.post('/leads', leadData).then(res => res.data),
  
  updateLead: (id: string, leadData: Partial<Lead>): Promise<ApiResponse<Lead>> =>
    api.put(`/leads/${id}`, leadData).then(res => res.data),
  
  deleteLead: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/leads/${id}`).then(res => res.data),
  
  addNote: (id: string, content: string, isPrivate?: boolean): Promise<ApiResponse<void>> =>
    api.post(`/leads/${id}/notes`, { content, isPrivate }).then(res => res.data),
  
  addInteraction: (id: string, type: string, metadata?: any): Promise<ApiResponse<void>> =>
    api.post(`/leads/${id}/interactions`, { type, metadata }).then(res => res.data),
  
  getScoringExplanation: (id: string): Promise<ApiResponse<ScoringExplanation>> =>
    api.get(`/leads/${id}/scoring`).then(res => res.data),
};

// Campaigns API
export const campaignsApi = {
  getCampaigns: (filters?: CampaignFilters): Promise<ApiResponse<Campaign[]>> =>
    api.get('/campaigns', { params: filters }).then(res => res.data),
  
  getCampaign: (id: string): Promise<ApiResponse<Campaign & { statistics: any }>> =>
    api.get(`/campaigns/${id}`).then(res => res.data),
  
  createCampaign: (campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> =>
    api.post('/campaigns', campaignData).then(res => res.data),
  
  updateCampaign: (id: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> =>
    api.put(`/campaigns/${id}`, campaignData).then(res => res.data),
  
  deleteCampaign: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/campaigns/${id}`).then(res => res.data),
  
  addNote: (id: string, content: string): Promise<ApiResponse<void>> =>
    api.post(`/campaigns/${id}/notes`, { content }).then(res => res.data),
  
  updateMetrics: (id: string, metrics: any): Promise<ApiResponse<any>> =>
    api.put(`/campaigns/${id}/metrics`, metrics).then(res => res.data),
  
  getCampaignLeads: (id: string, filters?: LeadFilters): Promise<ApiResponse<Lead[]>> =>
    api.get(`/campaigns/${id}/leads`, { params: filters }).then(res => res.data),
};

// Analytics API
export const analyticsApi = {
  getDashboard: (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<DashboardAnalytics>> =>
    api.get('/analytics/dashboard', { params }).then(res => res.data),
  
  getCampaigns: (params?: {
    dateFrom?: string;
    dateTo?: string;
    platform?: string;
  }): Promise<ApiResponse<any>> =>
    api.get('/analytics/campaigns', { params }).then(res => res.data),
  
  getQuality: (params?: {
    dateFrom?: string;
    dateTo?: string;
    campaignId?: string;
  }): Promise<ApiResponse<any>> =>
    api.get('/analytics/quality', { params }).then(res => res.data),
};

export default api;
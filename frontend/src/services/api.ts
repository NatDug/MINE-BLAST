import axios from 'axios';
import { 
  Token, 
  User, 
  Blast, 
  BlastForm, 
  BlastSummary, 
  PowderFactorResult,
  MapLayer,
  DrillPlan,
  DrillPlanForm,
  LoginForm,
  SignupForm
} from '../types';

import { config } from '../config';

const API_BASE_URL = config.API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (data: LoginForm): Promise<Token> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  signup: async (data: SignupForm): Promise<User> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
};

// Blast API
export const blastAPI = {
  getBlasts: async (): Promise<Blast[]> => {
    const response = await api.get('/blasts/');
    return response.data;
  },

  getBlast: async (id: number): Promise<Blast> => {
    const response = await api.get(`/blasts/${id}`);
    return response.data;
  },

  createBlast: async (data: BlastForm): Promise<Blast> => {
    const response = await api.post('/blasts/', data);
    return response.data;
  },

  uploadCSV: async (file: File, name: string, description?: string, bench?: string): Promise<{ id: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (bench) formData.append('bench', bench);

    const response = await api.post('/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

// Analysis API
export const analysisAPI = {
  getSummary: async (blastId: number): Promise<BlastSummary> => {
    const response = await api.get(`/analysis/${blastId}/summary`);
    return response.data;
  },

  getPowderFactor: async (
    blastId: number, 
    rockDensity: number = 2.7, 
    benchHeight: number = 10.0
  ): Promise<PowderFactorResult> => {
    const response = await api.get(`/analysis/${blastId}/powder-factor`, {
      params: { 
        rock_density_t_m3: rockDensity, 
        bench_height_m: benchHeight 
      }
    });
    return response.data;
  },
};

// Maps API
export const mapsAPI = {
  getLayers: async (): Promise<MapLayer[]> => {
    const response = await api.get('/maps/');
    return response.data;
  },

  getLayer: async (id: number): Promise<MapLayer> => {
    const response = await api.get(`/maps/${id}`);
    return response.data;
  },

  createLayer: async (data: { name: string; layer_type: string; geojson: any }): Promise<MapLayer> => {
    const response = await api.post('/maps/', data);
    return response.data;
  },
};

// Drill API
export const drillAPI = {
  getPlans: async (): Promise<DrillPlan[]> => {
    const response = await api.get('/drill/');
    return response.data;
  },

  createPlan: async (data: DrillPlanForm): Promise<DrillPlan> => {
    const response = await api.post('/drill/', data);
    return response.data;
  },
};

export default api;

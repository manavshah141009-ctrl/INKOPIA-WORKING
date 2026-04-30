import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const schemaApi = {
  getAll: () => api.get('/schemas'),
  create: (data: any) => api.post('/schemas', data),
  update: (id: string, data: any) => api.put(`/schemas/${id}`, data),
  delete: (id: string) => api.delete(`/schemas/${id}`),
};

export const dataApi = {
  getBySchema: (schemaId: string) => api.get(`/data/${schemaId}`),
  upsert: (data: any) => api.post('/data', data),
  delete: (id: string) => api.delete(`/data/${id}`),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

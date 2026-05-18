import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://localhost:8000/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
          await SecureStore.setItemAsync("access_token", res.data.access_token);
          await SecureStore.setItemAsync("refresh_token", res.data.refresh_token);
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return axios(error.config);
        } catch {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
        }
      }
    }
    return Promise.reject(error);
  }
);

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync("access_token", accessToken);
  await SecureStore.setItemAsync("refresh_token", refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
}

export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  verifyEmail: (data: any) => api.post("/auth/verify-email", data),
  login: (data: any) => api.post("/auth/login", data),
  logout: (refreshToken: string) => api.post("/auth/logout", { refresh_token: refreshToken }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
};

export const userApi = {
  getMe: () => api.get("/users/me"),
  updateMe: (data: any) => api.put("/users/me", data),
};

export const propertyApi = {
  getList: (params?: any) => api.get("/properties", { params }),
  getOne: (id: string) => api.get(`/properties/${id}`),
  getDistricts: () => api.get("/properties/districts"),
  getFavorites: () => api.get("/properties/favorites"),
  addFavorite: (id: string) => api.post(`/properties/${id}/favorite`),
  removeFavorite: (id: string) => api.delete(`/properties/${id}/favorite`),
};

export const predictionApi = {
  estimate: (data: any) => api.post("/predictions/estimate", data),
  getHistory: () => api.get("/predictions/history"),
};

export const analyticsApi = {
  getMarketOverview: () => api.get("/analytics/market-overview"),
};

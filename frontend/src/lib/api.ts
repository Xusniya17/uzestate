import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          Cookies.set("access_token", res.data.access_token, { expires: 1 });
          Cookies.set("refresh_token", res.data.refresh_token, { expires: 30 });
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return axios(error.config);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => api.post("/auth/register", data),
  verifyEmail: (data: any) => api.post("/auth/verify-email", data),
  login: (data: any) => api.post("/auth/login", data),
  logout: (refreshToken: string) => api.post("/auth/logout", { refresh_token: refreshToken }),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: any) => api.post("/auth/reset-password", data),
  sendSmsOtp: (phone: string) => api.post(`/auth/send-sms-otp?phone=${phone}`),
  verifyPhone: (data: any) => api.post("/auth/verify-phone", data),
};

export const userApi = {
  getMe: () => api.get("/users/me"),
  updateMe: (data: any) => api.put("/users/me", data),
  changePassword: (data: any) => api.post("/users/me/change-password", data),
};

export const propertyApi = {
  getList: (params?: any) => api.get("/properties", { params }),
  getOne: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post("/properties", data),
  update: (id: string, data: any) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getFavorites: () => api.get("/properties/favorites"),
  addFavorite: (id: string) => api.post(`/properties/${id}/favorite`),
  removeFavorite: (id: string) => api.delete(`/properties/${id}/favorite`),
  getDistricts: () => api.get("/properties/districts"),
};

export const predictionApi = {
  estimate: (data: any) => api.post("/predictions/estimate", data),
  getHistory: () => api.get("/predictions/history"),
};

export const analyticsApi = {
  getMarketOverview: () => api.get("/analytics/market-overview"),
  getPriceTrends: () => api.get("/analytics/price-trends"),
  getDistrictStats: (id: number) => api.get(`/analytics/districts/${id}/stats`),
};

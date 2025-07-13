import axios from "axios";

const API_BASE_URL = "http://localhost:8091/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  },
});

// Attach JWT token to each request (if present)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add cache-busting timestamp to prevent 304 errors
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------
// Login API
// ----------------------
export const login = async (data: { emailOrUsername: string; password: string }) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// ----------------------
// Register API
// ----------------------
export const register = async (profileData: {
  name: string;
  username: string;
  email: string;
  password: string;
  location?: string;
  tagline?: string;
  isPublic: boolean;
  offeredSkills: { name: string; level: string }[];
  wantedSkills: string[];
  availability?: {
    days: string[];
    timeSlot: string;
    timezone: string;
  };
  profilePhoto?: string; // base64 string, filename, or URL
}) => {
  try {
    const payload = {
      ...profileData,
    };

    const response = await api.post("/auth/register", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

// API utility functions for backend communication
import axios from "axios";
import { logout } from "../src/shared/utilities/auth";

const apiClient = axios.create({
  baseURL: "http://localhost:5002/api",
  timeout: 10000,
});

// Attach JWT token to requests
apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers["Authorization"] = `Bearer ${user.token}`;
  }
  return config;
});

// Handle auth errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (exception) => {
    if (exception.response) {
      (exception.response.status === 401 ||
        exception.response.status === 403) &&
        logout();
    }
    return Promise.reject(exception);
  }
);

// Auth and friends API calls
export const login = async (data) => {
  try {
    return await apiClient.post("/auth/login", data);
  } catch (error) {
    return { error: true, exception: error };
  }
};

export const register = async (data) => {
  try {
    return await apiClient.post("/auth/register", data);
  } catch (error) {
    return { error: true, exception: error };
  }
};

export const sendFriendInvitation = async (data) => {
  try {
    return await apiClient.post("/friends/invite", data);
  } catch (error) {
    return { error: true, exception: error };
  }
};

export const acceptFriendInvitation = async (data) => {
  try {
    return await apiClient.post("/friends/accept", data);
  } catch (error) {
    return { error: true, exception: error };
  }
};
export const rejectFriendInvitation = async (data) => {
  try {
    return await apiClient.post("/friends/reject", data);
  } catch (error) {
    return { error: true, exception: error };
  }
};

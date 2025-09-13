import axios from "axios";
import { logout } from "../src/shared/utilities/auth";

const apiClient = axios.create({
  baseURL: "http://localhost:5002/api",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    config.headers["Authorization"] = `Bearer ${user.token}`;
  }

  return config;
});

apiClient.interceptors.response.use((response) => {

    return response;

}, (exception) => {

  if (exception.response) {
    (exception.response.status === 401 || exception.response.status === 403) && logout();
  }

  return Promise.reject(exception);
});

export const login = async (data) => {
  try {
    return await apiClient.post("/auth/login", data);
  } catch (error) {
    return {
      error: true,
      exception: error,
    };
  }
};

export const register = async (data) => {
  try {
    return await apiClient.post("/auth/register", data);
  } catch (error) {
    return {
      error: true,
      exception: error,
    };
  }
};
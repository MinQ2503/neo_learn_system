import apiClient from "./index";

export const loginAPI = (data) => {
  return apiClient.post("/auth/login", data);
};

export const registerAPI = (data) => {
  return apiClient.post("/auth/register", data);
};

export const logoutAPI = () => {
  return apiClient.post("/auth/logout");
};

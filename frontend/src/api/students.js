import apiClient from "./index";

export const getStudents = () => {
  return apiClient.get("/students");
};

export const getStudent = (id) => {
  return apiClient.get(`/students/${id}`);
};

export const createStudent = (data) => {
  return apiClient.post("/students", data);
};

export const updateStudent = (id, data) => {
  return apiClient.put(`/students/${id}`, data);
};

export const deleteStudent = (id) => {
  return apiClient.delete(`/students/${id}`);
};

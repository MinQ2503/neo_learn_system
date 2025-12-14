import apiClient from "./index";

export const getAttendance = () => {
  return apiClient.get("/attendance");
};

export const checkIn = (data) => {
  return apiClient.post("/attendance/check-in", data);
};

export const getAttendanceReport = () => {
  return apiClient.get("/attendance/report");
};

import apiClient from "./index";

export const faceDetect = (formData) => {
  return apiClient.post("/face/detect", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const faceRecognize = (formData) => {
  return apiClient.post("/face/recognize", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const faceEnroll = (formData) => {
  return apiClient.post("/face/enroll", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

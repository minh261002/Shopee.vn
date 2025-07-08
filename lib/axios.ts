import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
    } else if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

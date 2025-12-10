"use client";

import { apiUrl } from "@/config/config";
import axios from "axios";
import { useEffect } from "react";
import secureLocalStorage from "react-secure-storage";

const axiosClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Flag to avoid multiple refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Helper function to store token in secure-storage
const setToken = (token) => {
  secureLocalStorage.setItem("token", token);
};

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to Handle 403 Forbidden
// axiosClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 403 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve) => {
//           refreshSubscribers.push((token) => {
//             originalRequest.headers.accessToken = `Bearer ${token}`;
//             resolve(axiosClient(originalRequest));
//           });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const { data } = await axios.post(apiUrl+"/auth/refresh-token", {}, {
//           withCredentials: true,
//         });

//         console.log('data: ', data);

//         // Store new token and retry failed requests
//         setToken(data.accessToken);
//         refreshSubscribers.forEach((callback) => callback(data.accessToken));
//         refreshSubscribers = [];

//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return axiosClient(originalRequest);
//       } catch (refreshError) {
//         console.error("Refresh token failed, logging out...");

//         secureLocalStorage.removeItem("token");
//         // window.location.href = "/login";
//         console.log('error in /refresh: ', refreshError?.response?.data || refreshError?.message || refreshError);
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// Component to Inject Axios Interceptor
const AxiosInterceptor = () => {
  useEffect(() => {
    return () => {
      axiosClient.interceptors.request.eject(axiosClient.interceptors.request);
    //   axiosClient.interceptors.response.eject(axiosClient.interceptors.response);
    };
  }, []);

  return null;
};

export { axiosClient, AxiosInterceptor };

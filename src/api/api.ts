import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

let isRefreshing = false;
let refreshSubscribers = [];

async function renewToken() {
  try {
    console.log("renew call");
    const response = await api.post("/renewToken");
    const newToken = response.data.token;

    localStorage.setItem("token", newToken);

    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    isRefreshing = false;

    // Execute all the requests in the queue that were waiting for the token renewal
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
  } catch (error) {
    console.log(error);
    isRefreshing = false;
  }
}

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (decodedToken.exp - currentTimestamp < 300 && !isRefreshing) {
        isRefreshing = true;
        renewToken();
      }

      if (isRefreshing) {
        // If a token renewal is in progress, queue this request and wait for the new token
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

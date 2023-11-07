import axios from "axios";

// Function to renew the token
async function renewToken() {
  try {
    const response = await axios.post("/renewToken");
    const newToken = response.data.token;
    // Update the token in local storage
    localStorage.setItem("token", newToken);
    return newToken;
  } catch (error) {
    // Handle the error (e.g., log or redirect to login page)
    throw error;
  }
}

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:3001",
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get the current token from local storage
    const token = localStorage.getItem("token");

    // Set the token in the request headers
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token renewal
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired, attempt to renew it
      try {
        const newToken = await renewToken();
        // Update the request's headers with the new token
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        // Retry the original request with the new token
        return api(error.config);
      } catch (renewError) {
        // Handle the error from renewToken() (e.g., log or redirect to login page)
        return Promise.reject(renewError);
      }
    }

    // For other errors, simply reject the promise
    return Promise.reject(error);
  }
);

export default api;

// src/lib/api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API client for NodePilot backend
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // PLACEHOLDER: Replace with actual API URL
    // INTEGRATION: This should be configured based on environment
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null;
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      // Handle API errors
      if (error.response) {
        // The request was made and the server responded with an error status
        throw new Error(error.response.data.error || 'API error');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server');
      } else {
        // Something happened in setting up the request
        throw new Error(error.message || 'Request error');
      }
    }
  }

  // GET request
  async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  // POST request
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    });
  }

  // PUT request
  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  // DELETE request
  async delete<T>(url: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

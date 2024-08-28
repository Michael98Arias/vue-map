import Axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'; 
import { HttpError } from '../models/HttpError';
import { envBaseUrl } from '../constants/Environment';

// Configuración base para Axios
const config: AxiosRequestConfig = {
  baseURL: envBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Configuración para solicitudes singulares
const singConfig: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

class HttpService {
  private http: AxiosInstance;
  private singHttp: AxiosInstance;
  public accessToken = '';

  private requests = new Map<string, Promise<any>>();

  constructor() {
    this.http = Axios.create(config);
    this.singHttp = Axios.create(singConfig);

    // Interceptor de solicitud para el token de autorización
    this.http.interceptors.request.use((request) => {
      if (this.accessToken) {
        request.headers = {
          ...request.headers,
          'Authorization': `Bearer ${this.accessToken}`,
        };
      }
      return request;
    });

    // Interceptor de respuesta
    this.http.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.headers['content-type']?.includes('application/octet-stream') || response.headers['content-type']?.includes('text/csv')) {
          return response;
        }
        return response.data;
      },
      (error) => {
        const httpError: HttpError | null = HttpError.error(error);
        return Promise.reject(httpError);
      }
    );

    // Interceptor de solicitud para el token de acceso
    this.singHttp.interceptors.request.use((request) => {
      if (this.accessToken) {
        request.headers = {
          ...request.headers,
          'accessToken': `${this.accessToken}`,
        };
      }
      return request;
    });

    // Interceptor de respuesta
    this.singHttp.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.headers['content-type']?.includes('application/octet-stream') || response.headers['content-type']?.includes('text/csv')) {
          return response;
        }
        return response.data;
      },
      (error) => {
        const httpError: HttpError | null = HttpError.error(error);
        return Promise.reject(httpError);
      }
    );
  }

  public get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = `${url}${params ? `_${JSON.stringify(params)}` : ''}`;
    const request = this.requests.get(requestKey);
    if (request) {
      return request;
    }
    const axiosConfig: AxiosRequestConfig = { params, ...config };
    this.requests.set(
      requestKey,
      this.http
        .get<T>(url, axiosConfig)
        .finally(() => this.requests.delete(requestKey))
    );
    return this.requests.get(requestKey) as Promise<T>;
  }

  public async post<T, K = any>(url: string, data?: K, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.post<T>(url, data, config);
    return response.data;
  }

  public async sing<T, K = any>(url: string, data: K): Promise<T> {
    const response = await this.singHttp.post<T>(url, data);
    return response.data;
  }

  public async put<T, K = any>(url: string, data?: K, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<T>(url, config);
    return response.data;
  }

  public async patch<T, K = any>(url: string, data?: K, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.patch<T>(url, data, config);
    return response.data;
  }

  public async upload<T>(method: 'POST' | 'PUT', url: string, file: any): Promise<T> {
    const response = await this.http.request<T>({
      method,
      url,
      data: file,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  public async downloadFileCSV<T, K = any>(method: 'POST' | 'GET', url: string, body?: K): Promise<T> {
    const response = await this.http.request<T>({
      method,
      url,
      data: body,
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new HttpService();

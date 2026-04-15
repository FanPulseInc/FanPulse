import axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  timeout: 30000
});

AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token }).then(
    ({ data }) => data,
  );

  // @ts-ignore
//   promise.cancel = () => {
//     source.cancel('Query was cancelled by React Query');
//   };

  return promise;
};



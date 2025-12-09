import { apiRequest } from './axiosClient';

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export const authApi = {
  login: (data: LoginData): Promise<LoginResponse> =>
    apiRequest.post('/authentication/token', data),
};



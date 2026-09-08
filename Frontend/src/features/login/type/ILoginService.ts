import { LoginResponse } from "../service/ApiLoginService";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ILoginService {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
}
import { BaseApiService } from "@/components/service/BaseApiService";
import { ILoginService } from "../type/ILoginService";

export interface LoginResponse {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService extends BaseApiService implements ILoginService {
  constructor() {
    super('auth')
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>(
      `/${this.resourcePath}/login`,
      credentials
    );
    return response.data;
  }
  async logout(): Promise<void> {
    try {
      await this.api.post(`/${this.resourcePath}/logout`)
    } catch (error) {

    } finally {
      localStorage.removeItem('jwt_token')
    }

  }
}

export const authService = new AuthService()

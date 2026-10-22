import { BaseApiService } from "@/components/service/BaseApiService";
import { ILoginService, ISignInPayload, LoginCredentials, LoginResponse } from "../type/ILoginService";



export class AuthService extends BaseApiService implements ILoginService {
  constructor() {
    super('user')
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>(
      `${this.resourcePath}/login`,
      credentials
    );
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(`${this.resourcePath}/logout`)
    } catch (error) {

    } finally {
      localStorage.removeItem('jwt_token')
    }

  }
  async signIn(credentials: ISignInPayload): Promise<void> {
    await this.api.post(`${this.resourcePath}/create`, credentials);
  }
}

export const authService = new AuthService()

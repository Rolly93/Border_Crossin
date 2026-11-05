import { BaseApiService } from "@/components/service/BaseApiService";
import { ILoginService, TSignInPayload } from "../type/ILoginService";
import { TLoginRequest, TLoginResponse } from "../hook/useLoginForm";



export class AuthService extends BaseApiService implements ILoginService {
  constructor() {
    super('user')
  }

  async login(credentials: TLoginRequest): Promise<TLoginResponse> {
    try {

      const response = await this.api.post<TLoginResponse>(
        `${this.resourcePath}/login`,
        credentials
      );
      return response.data;


    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(`${this.resourcePath}/logout`)
    } catch (error: any) {
      console.log(error);
      throw error.message
    } finally {
      localStorage.removeItem('jwt_token')
    }

  }
  async signIn(credentials: TSignInPayload): Promise<void> {
    try {
      await this.api.post(`${this.resourcePath}/create`, credentials);


    } catch (error: any) {
      console.log(error);
      throw error.message
    }
  }
}

export const authService = new AuthService()

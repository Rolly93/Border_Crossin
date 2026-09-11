import { ILoginService, ISignIn, LoginCredentials } from "../type/ILoginService";

export interface LoginResponse {
  token: string;
}

export class MockAuthService implements ILoginService {

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === 'admin@test.com' && credentials.password === 'password') {
          resolve({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload.mock_signature"
          });
        } else {
          reject({
            response: { data: { message: "Invalid email or password" } }
          });
        }
      }, 1000);
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('jwt_token');
        resolve();
      }, 500);
    });
  }
  async signIn(credentials: ISignIn): Promise<void> {

  }
}

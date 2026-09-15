
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  status: string;
  detail: string;
  isAdmin: boolean;
}



export interface ISignIn extends LoginCredentials {
  email: string
  isAdmin: boolean
  role: string

}
export interface ILoginService {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
  signIn(credentials: ISignIn): Promise<void>
}
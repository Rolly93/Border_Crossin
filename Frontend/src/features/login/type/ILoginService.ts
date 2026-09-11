
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
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
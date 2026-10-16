
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
export interface SignInWithRfc extends ISignIn {
  hasRfc: true;
  rfc: string;
}

export interface SignInWithoutRfc extends ISignIn {
  hasRfc: false;
  rfc?: never;
}

export type ISignInPayload = SignInWithRfc | SignInWithoutRfc;

export interface ILoginService {
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
  signIn(credentials: ISignInPayload): Promise<void>
}
import { components } from "@/types/api";
import { TLoginRequest, TLoginResponse } from "../hook/useLoginForm";


export type TSignInWithoutRfc = Omit<components['schemas']['NewUser'], 'rfc'> & {
  hasRfc: false;
  rfc?: never
}

export type TSignInWithRfc = Omit<components['schemas']['NewUser'], 'rfc'> & {
  hasRfc: true;
  rfc: string
}

export type TSingIn = Omit<components['schemas']['NewUser'], 'rfc'>

export type TSignInPayload = TSignInWithRfc | TSignInWithoutRfc;

export interface ILoginService {
  login(credentials: TLoginRequest): Promise<TLoginResponse>;
  logout(): Promise<void>;
  signIn(credentials: TSignInPayload): Promise<void>
}
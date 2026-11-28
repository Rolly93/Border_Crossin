/** @format */

import { TLoginRequest, TLoginResponse } from "../hook/useLoginForm";

export interface ILoginService {
  login(credentials: TLoginRequest): Promise<TLoginResponse>;
  logout(): Promise<void>;
}

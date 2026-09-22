import { ILoginService } from "../type/ILoginService";
import { AuthService } from "./ApiLoginService";
const ip = import.meta.env.VITE_API_URL || false

export const AuthtenticationService: ILoginService = ip &&
  new AuthService()
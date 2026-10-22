import { ILoginService } from "../type/ILoginService";
import { AuthService } from "./ApiLoginService";

// Always instantiate the service - MSW will intercept calls when VITE_USE_MOCK=true
export const AuthenticationService: ILoginService = new AuthService()
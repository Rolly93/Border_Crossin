import { ILoginService } from "../type/ILoginService";
import { AuthService } from "./ApiLoginService";

export const AuthenticationService: ILoginService = new AuthService()
import { ApiClientService } from "./ApiClientService";
import { IClientService } from "../types/IClientService";

export const clientService: IClientService = new ApiClientService();

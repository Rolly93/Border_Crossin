import { MockClientSerivce } from "./MockClientService";
import { ApiClientService } from "./ApiClientService";
import { IClientService } from "../types/IClientService";

const ip = import.meta.env.VITE_API_URL || false

export const clientService: IClientService = ip
  ? new ApiClientService() : new MockClientSerivce();

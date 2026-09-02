import { MockClientSerivce } from "./MockClientService";
import { ICliente } from "../types/Cliente";
import { ApiClientService } from "./ApiClientService";
import { IBaseService } from "@/components/service/IBaseService";
import { IClientService } from "../types/IClientService";

const ip = import.meta.env.VITE_API_URL || false

export const clientService: IClientService = ip
  ? new ApiClientService() : new MockClientSerivce();

import { MockClientSerivce } from "./MockClientService";
import { ICliente } from "../types/Cliente";
import { ApiClientService } from "./ApiClientService";
import { IBaseService } from "@/components/service/IBaseService";

const ip = import.meta.env.VITE_API_URL || false

export const clientService: IBaseService<ICliente> = ip
  ? new ApiClientService() : new MockClientSerivce();

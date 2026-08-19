import { ApiClientService } from "./ApiClientService";
import { IClientService } from "./IClientService";
import { MockClientSerivce } from "./MockClientService";

const ip = import.meta.env.VITE_API_URL || false

export const shipmentService: IClientService = ip
  ? new ApiClientService() : new MockClientSerivce();

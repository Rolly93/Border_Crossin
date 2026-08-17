import { IShipmentService } from './IShipmentService';
import { ApiShipmentService } from './ApiShipmentService';
import { MockShipmentService } from './MockShipmentService';

const ip = import.meta.env.VITE_API_URL || false

export const shipmentService: IShipmentService = ip
  ? new ApiShipmentService() : new MockShipmentService();

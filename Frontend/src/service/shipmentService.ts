import { IShipmentService } from './shipment/IShipmentService';
import { ApiShipmentService } from './shipment/ApiShipmentService';
import { MockShipmentService } from './shipment/MockShipmentService';

const ip = import.meta.env.VITE_API_URL|| false

export const shipmentService :IShipmentService = ip
? new ApiShipmentService() : new  MockShipmentService();

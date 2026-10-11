import { ApiShipmentService } from './ApiShipmentService';
import { IShipmentService } from '../types/Shipment';

export const shipmentService: IShipmentService = new ApiShipmentService();

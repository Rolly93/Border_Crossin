import { IBaseService } from '@/components/service/IBaseService';
import { ApiShipmentService } from './ApiShipmentService';
import { MockShipmentService } from './MockShipmentService';
import { Shipment } from '../types/Shipment';

const ip = import.meta.env.VITE_API_URL || false

export const shipmentService: IBaseService<Shipment> = ip
  ? new ApiShipmentService() : new MockShipmentService();

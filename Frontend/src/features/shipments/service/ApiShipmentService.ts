import { Shipment } from "@/features/shipments/types/Shipment";
import { createApiClient } from "../../../service/api";
import { BaseShipemntService } from "./BaseShipmentService";
import { IShipmentService } from "./IShipmentService";

export class ApiShipmentService extends BaseShipemntService implements IShipmentService {
    private api = createApiClient(import.meta.env.VITE_API_URL)

    async getAll(): Promise<Shipment[]> {
        const response = await this.api.get<Shipment[]>('/shipment/');
        return response.data
    }
    async update(id: number, data: Shipment): Promise<Shipment> {
        console.log(data)
        const response = await this.api.put<Shipment>(`/shipment/${id}/update`, data);
        return response.data
    }

    async insert(data: Shipment): Promise<Shipment> {
        const response = await this.api.post<Shipment>('/shipment/create', data);
        return response.data
    }
}
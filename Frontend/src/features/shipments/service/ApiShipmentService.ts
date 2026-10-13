import { Shipment } from "@/features/shipments/types/Shipment";
import { BaseCrudApiService } from "@/components/service/BaseCrudApiService";
import { PaginatedResponse } from "@/components/service/IBaseService";
<<<<<<< Updated upstream
import { getErrorMessage } from "@/components/utils/errorMessage";

/** Lo que espera POST /shipment/create (ver ShipmentCreateRequest en el backend). */
interface ShipmentCreatePayload {
    tracking_number: string;
    customer_tracking: string;
    type_operation: string;
    cliente: number;
    origen: string;
    destination: string;
    truck: string;
    trailer: string;
}

/** Respuesta del alta: el backend usa `destination` y `cliente` numérico. */
interface ShipmentCreateResponse {
    id: number;
    tracking_number: string;
    customer_tracking: string;
    type_operation: string;
    origen: string;
    destination: string;
    cliente: number;
    truck: string | null;
    trailer: string | null;
    status?: string;
    events: Shipment["events"];
}
=======
import { ShipmentUpdate } from "../types/Shipment";
>>>>>>> Stashed changes

export class ApiShipmentService extends BaseCrudApiService<Shipment, ShipmentUpdate> {
    constructor() {
        super('shipment')
    }

    /**
     * Traduce el formulario (cliente en texto, destino en español) al contrato del backend.
     * Es el único lugar donde se hace esta traducción.
     */
    override async insert(data: Shipment): Promise<Shipment> {
        const payload: ShipmentCreatePayload = {
            tracking_number: data.tracking_number,
            customer_tracking: data.customer_tracking,
            type_operation: data.type_operation,
            cliente: Number(data.cliente),
            origen: data.origen,
            destination: data.destino,
            truck: data.truck,
            trailer: data.trailer,
        };

        try {
            const response = await this.api.post<ShipmentCreateResponse>(
                `/${this.resourcePath}/create`,
                payload
            );
            const created = response.data;
            return {
                ...created,
                cliente: String(created.cliente),
                destino: created.destination,
                events: created.events ?? [],
            } as unknown as Shipment;
        } catch (err) {
            throw new Error(getErrorMessage(err, "No se pudo registrar el embarque"));
        }
    }

    async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Shipment>> {
        const response = await this.api.get<PaginatedResponse<Shipment>>(`/${this.resourcePath}/`, {
            params: { page, limit },
        });
        if (response.status === 200) {
            return response.data;
        }
        return {
            page: response.data.page,
            hasNextPage: response.data.hasNextPage,
            totalRecords: response.data.totalRecords,
            limit: response.data.limit,
            data: response.data.data
        }
    }

    // Backend: PUT /shipment/{id}/update
    async update(id: number, data: ShipmentUpdate): Promise<Shipment> {
        const response = await this.api.put<Shipment>(`/${this.resourcePath}/${id}/update`, data);
        return response.data;
    }

    // Backend: PATCH /shipment/{id}/delete
    async delete(id: number): Promise<Shipment> {
        const response = await this.api.patch<Shipment>(`/${this.resourcePath}/${id}/delete`);
        return response.data;
    }
}

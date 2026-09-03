import { Shipment } from "@/features/shipments/types/Shipment";
import { BaseApiService } from "@/components/service/BaseApiService";
import { PaginatedResponse } from "@/components/service/IBaseService";

export class ApiShipmentService extends BaseApiService<Shipment> {
    constructor() {
        super('shipment')
    }

    async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Shipment>> {
        const response = await this.api.get<PaginatedResponse<Shipment>>(`${this.resourcePath}`, {
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
}
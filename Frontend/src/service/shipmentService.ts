import { Shipment } from '@/types/Shipment';
import { createApiClient } from './api';
import { LOADSHIPMENT } from '@/mocks/shipmentsMock';



const ip = import.meta.env.VITE_API_URL|| false
const delay = (ms:number) => new Promise (resolve => setTimeout(resolve , ms))

export const shipmentService ={
    getall:async (): Promise<Shipment[]> =>{
        if (ip){
            const response = await createApiClient(ip).get<Shipment[]>('/shipment');
            return response.data;
        }

        await delay(600);
        console.log(LOADSHIPMENT)
        return [...LOADSHIPMENT]

    },
    post:async (id:number , updatedData:Shipment): Promise<Shipment> =>{
        await delay(100);
        if (ip){
            const response = await createApiClient(ip).put<Shipment>(`/shipment/${id}/update`,updatedData)
            return response.data
        }
const index = LOADSHIPMENT.findIndex(item => item.id == id);
        if (index !== -1) {
            LOADSHIPMENT[index] = { ...updatedData };
        }
        
        console.log(LOADSHIPMENT);
        return updatedData;
    },
    insert:async (newShipment:Shipment): Promise<Shipment> =>{
        await delay(100)
        if (ip){
            const response = await createApiClient(ip).post<Shipment>('/shipment/create',newShipment)
            return response.data
        }
        const nextId = LOADSHIPMENT.length>0 ? Math.max(...LOADSHIPMENT.map(item=> item.id))+1:1

        const shimentWithId : Shipment={
            ...newShipment,
            id : nextId,
            events:newShipment.events||[]
        }
        LOADSHIPMENT.push(shimentWithId)

        return shimentWithId
    }
    }

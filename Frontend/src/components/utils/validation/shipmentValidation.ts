import { ShipmentCreate } from "@/types/Shipment";

export const validateCostumerTracking = (value :string | undefined , values :ShipmentCreate):string | null =>{
    const clientName = values.cliente.trim().toUpperCase();
    const trackingValue = value?.trim().toUpperCase()||'';
    const typeOperaction = values.type_operation.trim().toLocaleUpperCase() || '';
    if (clientName === 'EXPEDITORS'){

if (!trackingValue) return 'Customer Tracking is required';

        if (typeOperaction === 'IMPORTACION' && !trackingValue.startsWith('12B')) {
            return 'Format Expeditors should start with 12B for Southbound';
        }
        
        if (typeOperaction === 'EXPORTACION' && !(trackingValue.startsWith('92B') || trackingValue.startsWith('82B'))) {
            return `Format Expeditors should start with 82B or 92B for Northbound  ${trackingValue.length}`;
        }

        if (trackingValue.length !== 10) {
            return 'Reference client should have 10 Characters';
        }
        
    }

    return null
    };

    export const validClient = (value:string | undefined , values :ShipmentCreate):string | null =>{
const clientName = values.cliente.trim().toUpperCase()||''
        if(!clientName) {return 'This field it cant be Empty' }

        if (clientName.length < 3) return 'Client Name Invalid'

        return null
    }
import { ShipmentCreate } from "@/types/Shipment";

export class ShipmentValidator {

    private data : Partial<ShipmentCreate>;
    
    constructor(formData:Partial<ShipmentCreate>){
        this.data = formData;
    }

    private get client(){ return this.data.cliente?.trim().toLocaleUpperCase()||'';}
    private get tracking() { return this.data.costumer_tracking?.trim().toLocaleUpperCase()||'';}
    private get opretationType(){ return this.data.type_operation?.trim().toLocaleUpperCase()||'';}

    /**
     * validateCliente
     */
    public validateCliente(): string | null {
        if(!this.client) return'This field cannot be empty'
        if(this.client.length < 3) return'client Name Invalid'

        return null
    }
    /**
     * validateCustomertracking    */
    public validateCustomertracking():string|null {
        
        if (this.client==='EXPEDITORS'){
            if (!this.tracking) return 'Costumer Tracking requiere'
            if (this.opretationType ==='IMPORTACION' && !this.tracking.startsWith('12B')){
                return 'Format Expeditors should start with 12B for Southbound'
            }
            if (this.opretationType ==='EXPORTACION' && !this.tracking.startsWith('82B')  && !this.tracking.startsWith('92B')){
                return  'Format Expeditors should start with 82B or 92B for Northbound'
            }
            if (this.tracking.length !==10) {return 'Reference client should have 10 Characters'}
        }
        return null
    }


    public validateTrackingNumber(): string | null {
    return (this.data.trcking_Number?.trim().length || 0) < 5 ? 'No. Embarque Invalid' : null;
  }

  public validateTruck(): string | null {
    return (this.data.truck?.trim().length || 0) < 2 ? 'Truck unit Invalid' : null;
  }

  public validateOrigin(): string | null {
    return (this.data.orgien?.trim().length || 0) < 5 ? 'Origen unit Invalid' : null;
  }

  public validateDestination(): string | null {
    return (this.data.destino?.trim().length || 0) < 3 ? 'Destination unit Invalid' : null;
  }

  public validateTrailer(): string | null {
    return (this.data.trailer?.trim().length || 0) < 3 ? 'Trailer unit Invalid' : null;
  }

public validateTypeOperation(): string | null {
    return (this.data.type_operation?.trim().length || 0) < 3 ? 'Pick Southbound or Northbound' : null;
  }
  

}
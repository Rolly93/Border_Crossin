import { EventCategory, Shipment} from "@/types/Shipment";

const EVENT_SEQUENCE_ORDER:EventCategory[]=[
  "pick_up",
  "departure",
  "delay",
  "mex_inspeccion",
  "clear_mex",
  "usa_inspeccion",
  "clear_usa",
  "safety_yard",
  "deliver"
]

const REQUIERE_EVENTS =new Set<EventCategory>([
  "pick_up",
  "departure",
  "clear_mex",
  "clear_usa",
  "deliver"
])
export class ShipmentValidator {

    private data : Partial<Shipment>;
    constructor(formData:Partial<Shipment>  ){
        this.data = formData;
    }

    private get client(){ return this.data.cliente?.trim().toLocaleUpperCase()||'';}
    private get tracking() { return this.data.costumer_tracking?.trim().toLocaleUpperCase()||'';}
    private get opretationType(){ return this.data.type_operation?.trim().toLocaleUpperCase()||'';}
    /**
     * validateCliente
     */
    public validateCliente(): string | null {
        if(!this.client) return'Este campo no puede estar Vacio'
        if(this.client.length < 3) return'Nombre de cliente invalido'

        return null
    }
    /**
     * validateCustomertracking    */
    public validateCustomertracking():string|null {
        
        if (this.client==='EXPEDITORS'){
            if (!this.tracking) return 'Referencia del cliente requerida'
            if (this.opretationType ==='IMPORTACION' && !this.tracking.startsWith('12B')){
                return 'Referecia de Expeditors empieza con "12B" para importaciones'
            }
            if (this.opretationType ==='EXPORTACION' && !this.tracking.startsWith('82B')  && !this.tracking.startsWith('92B')){
                return  'Referecia de Expeditors empieza con "82B" o "92B" para Exportacion'
            }
            if (this.tracking.length !==10) {return 'Referecia de Expeditors debe de contener 10 Characters'}
        }
        return null
    }


    public validateTrackingNumber(): string | null {
    return (this.data.trcking_Number?.trim().length || 0) < 5 ? 'No. Embarque Invalido' : null;
  }

  public validateTruck(): string | null {
    return (this.data.truck?.trim().length || 0) < 2 ? 'Undiad Invalida' : null;
  }

  public validateOrigin(): string | null {
    return (this.data.orgien?.trim().length || 0) < 5 ? 'Origen Invalido' : null;
  }

  public validateDestination(): string | null {
    return (this.data.destino?.trim().length || 0) < 3 ? 'Destino Invalido' : null;
  }

  public validateTrailer(): string | null {
    return (this.data.trailer?.trim().length || 0) < 3 ? 'Trailer Invalido' : null;
  }

public validateTypeOperation(): string | null {
    return (this.data.type_operation?.trim().length || 0) < 3 ? 'Pick Southbound or Northbound' : null;
  }
public validateEventChronology(): Record<string, string> {

  const currentEvents = this.data?.events||[];

  return {
    ...this.ValidateMissingRequiereEvents(currentEvents),
    ...this.validateChronologicalOrder(currentEvents)

  } 
}
private validateChronologicalOrder(currentEvents:any[]):Record<string,string>{
  const errors: Record<string, string> = {};

    if (!currentEvents || !Array.isArray(currentEvents)) {
      return errors;
    }

    const activeEvents = currentEvents
      .filter((event): event is typeof event & { dateTime: string | Date } => 
        !!event.dateTime && !!event.category
      )
      .sort((a, b) => {
        const indexA = EVENT_SEQUENCE_ORDER.indexOf(a.category as EventCategory);
        const indexB = EVENT_SEQUENCE_ORDER.indexOf(b.category as EventCategory);
        return indexA - indexB;
      });

    for (let i = 0; i < activeEvents.length - 1; i++) {
      const currentEvent = activeEvents[i];
      const nextEvent = activeEvents[i + 1];

      const currentDate = new Date(currentEvent.dateTime!).getTime();
      const nextDate = new Date(nextEvent.dateTime!).getTime();

      if (isNaN(currentDate) || isNaN(nextDate)) continue;

      if (nextDate < currentDate) {
        const realIndex = currentEvents.findIndex(e => e.category === nextEvent.category);
        if (realIndex !== -1) {
          errors[`events.${realIndex}.dateTime`] = `Evento "${this.FieldsName(nextEvent.category)}" no puede ser antes "${this.FieldsName(currentEvent.category)}"`;
        }
      }
    }

    return errors;
  }

private ValidateMissingRequiereEvents(currentEvents:any[]):Record<string,string>{
  const errors: Record<string, string> = {};

    if (!currentEvents || !Array.isArray(currentEvents)) {
      return errors;
    }

    const eventMap = new Map<string, Date | null>();
    for (const event of currentEvents) {
      const dateVal = event.dateTime ? new Date(event.dateTime) : null;
      eventMap.set(event.category, dateVal);
    }

    let latestFillIndex = -1;
    for (let i = EVENT_SEQUENCE_ORDER.length - 1; i >= 0; i--) {
      const category = EVENT_SEQUENCE_ORDER[i];
      if (eventMap.get(category)) {
        latestFillIndex = i;
        break;
      }
    }

    if (latestFillIndex !== -1) {
      for (let i = 0; i < latestFillIndex; i++) {
        const category = EVENT_SEQUENCE_ORDER[i];
        const isRequire = REQUIERE_EVENTS.has(category);
        const hasDate = !!eventMap.get(category);

        if (isRequire && !hasDate) {
          const latestCategoryFilled = EVENT_SEQUENCE_ORDER[latestFillIndex];
          const realIndex = currentEvents.findIndex(e => e.category === latestCategoryFilled);
          
          if (realIndex !== -1) {
            errors[`events.${realIndex}.dateTime`] = `No puedes registrar "${this.FieldsName(latestCategoryFilled)}" si hace falta llenar el campo obligatorio anterior "${this.FieldsName(category)}"`;
          }
        }
      }
    }

    return errors;
}

private  FieldsName(fieldNAme:string):string {
  switch (fieldNAme) {
case "pick_up":
  fieldNAme = " Recoleccion"
  
  break;
  
  case "departure":
  fieldNAme = " Salida de patio"
  
  break;
  
  case "delay":
  fieldNAme = " retraso"
  
  break;
  
  case "mex_inspeccion":
  fieldNAme = " inspeccion Mexican"
  
  break;
  
  case "clear_mex":
  fieldNAme = "Liberacion Aduana Mexicana"
  
  break;
  
  case "usa_inspeccion":
  fieldNAme = "Inspeccion Aduana Usa"
  
  break;
  
  case "clear_usa":
  fieldNAme = "Liberacion Aduana Americana"
  
  break;
  
  case "safety_yard":
  fieldNAme = "Resguardo de yarda"
  
  break;
  
  case "deliver":
  fieldNAme = "Entrega"
  
break;

default:
      break;
  }
  return fieldNAme
}
  }



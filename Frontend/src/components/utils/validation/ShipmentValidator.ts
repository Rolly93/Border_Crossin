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

  public validateEventChronology(): string | null {
const currentEvents = this.data?.events

if (!currentEvents) return null

const eventMap = new Map<string,Date| null>();
for (const event of currentEvents){
  eventMap.set(event.category , event.dateTime ||null)}

let latesFillIndex = -1;

for (let i = EVENT_SEQUENCE_ORDER.length -1 ; i >-0 ; i--){
  const category = EVENT_SEQUENCE_ORDER[i];
  if (eventMap.get(category)){
    latesFillIndex=i;
    break
  }
}
if (latesFillIndex ===-1 ) return null

for (let i = 0; i <latesFillIndex ; i ++){
  const category = EVENT_SEQUENCE_ORDER[i];
  const isRequiere = REQUIERE_EVENTS.has(category);
  const hasDate = !!eventMap.get(category)

  if (isRequiere && !hasDate){
    const latestCategoryFilled = EVENT_SEQUENCE_ORDER[latesFillIndex]
    return`No puedes registrar "${latestCategoryFilled}" si hace falta llenar el campo obligatorio anterior "${category}"`;
  }
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

for (let i=0 ; i < activeEvents.length - 1 ; i++){
  const currentEvent = activeEvents[i];
  const nextEvent = activeEvents[i+1];

  const currentDate = new Date(currentEvent.dateTime!).getTime();
  const nextDate = new Date(nextEvent.dateTime!).getTime();
  if (nextDate < currentDate){
    console.log(`Event "${nextEvent.category}" cannot be before "${currentEvent.category}"`)
    return `Event "${nextEvent.category}" cannot be before "${currentEvent.category}"`;
  }
}
return null

  }
  }



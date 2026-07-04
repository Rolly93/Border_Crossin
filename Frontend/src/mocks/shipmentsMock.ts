import { Shipment } from '@/types/Shipment';


export let LOADSHIPMENT: Shipment[] = [
  {
    id: 1,
    trcking_Number: "TA123456",
    costumer_tracking: "CUST-99211",
    cliente: "MOGA Logistics",
    truck: "TR-15",
    vehicleType: "Full Trailer",
    trailer: "TRAILER-92B",
    orgien: "Bodega Mexico",
    destino: "USA Distribution Center",
    type_operation: "Exportacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-01T08:00:00"),
        notes: "Carga a tiempo, operador reporta todo en orden."
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-01T09:30:00"),
        notes: "Saliendo de patio origen."
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-07-01T14:15:00"),
        notes: "Aduana mexicana liberada sin contratiempos."
      },
      {
        category: "mex_inspeccion",
        dateTime: new Date("2026-07-01T15:00:00"),
        notes: "Inspección de rutina completada."
      }
    ]
  },
  {
    id: 2,
    trcking_Number: "TA789012",
    costumer_tracking: "CUST-88341",
    cliente: "Alpha Manufacturing",
    truck: "TR-22",
    vehicleType: "Bobtail",
    trailer: "TRAILER-44X",
    orgien: "Monterrey Plant",
    destino: "Laredo Yard",
    type_operation: "Exportacion",
    status: "Delayed",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-06-30T10:00:00"),
        notes: "Recolección exitosa."
      },
      {
        category: "departure",
        dateTime: new Date("2026-06-30T11:00:00")
      },
      {
        category: "delay",
        dateTime: new Date("2026-06-30T16:30:00"),
        notes: "Tráfico pesado en la carretera nacional."
      }
    ]
  },
  {
    id: 3,
    trcking_Number: "TA456789",
    costumer_tracking: "CUST-11223",
    cliente: "Global Trade Corp",
    truck: "TR-09",
    vehicleType: "Flatbed",
    trailer: "TRAILER-77Z",
    orgien: "Querétaro Hub",
    destino: "Dallas Warehouse",
    type_operation: "Exportacion",
    status: "Delivered",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-06-28T07:00:00")
      },
      {
        category: "departure",
        dateTime: new Date("2026-06-28T08:15:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-06-29T11:00:00")
      },
      {
        category: "usa_inspeccion",
        dateTime: new Date("2026-06-29T14:00:00"),
        notes: "Inspección de rayos X aprobada."
      },
      {
        category: "clear_usa",
        dateTime: new Date("2026-06-29T15:30:00")
      },
      {
        category: "safety_yard",
        dateTime: new Date("2026-06-29T18:00:00"),
        notes: "Resguardo nocturno."
      },
      {
        category: "deliver",
        dateTime: new Date("2026-06-30T10:30:00"),
        notes: "Entregado y firmado por el receptor"
      }
    ]
  }  
];


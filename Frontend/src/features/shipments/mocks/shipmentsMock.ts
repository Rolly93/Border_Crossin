import { Shipment } from '@/features/shipments/types/Shipment';


export let LOADSHIPMENT: Shipment[] = [
  {
    id: 1,
    tracking_number: "92b1234567",
    customer_tracking: "CUST-99211",
    cliente: "MOGA Logistics",
    truck: "TR-15",
    vehicle_type: "Trailer",
    create: new Date("2026-07-01T08:00:00"),
    trailer: "TA123456",
    origen: "Bodega Mexico",
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
        dateTime: new Date("2026-07-01T14:15:00")
      },
      {
        category: "mex_inspeccion",
        dateTime: new Date("2026-07-01T15:00:00"),
        notes: "N1564"
      }
    ]
  },
  {
    id: 2,
    tracking_number: "TA789012",
    customer_tracking: "CUST-88341",
    cliente: "Alpha Manufacturing",

    create: new Date("2026-07-01T08:00:00"),
    truck: "TR-22",
    vehicle_type: "Bobtail",
    trailer: "TRAILER-44X",
    origen: "Monterrey Plant",
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
    tracking_number: "TA456789",
    customer_tracking: "CUST-11223",
    cliente: "Global Trade Corp",

    create: new Date("2026-07-01T08:00:00"),
    truck: "TR-09",
    vehicle_type: "Flatbed",
    trailer: "TRAILER-77Z",
    origen: "Querétaro Hub",
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
  },
  {
    id: 4,
    tracking_number: "TA102938",
    customer_tracking: "CUST-44012",
    cliente: "AeroParts Mexico",

    create: new Date("2026-07-01T08:00:00"),
    truck: "TR-04",
    vehicle_type: "Dry Van",
    trailer: "DV-9011",
    origen: "Laredo Yard",
    destino: "Guadalajara Plant",
    type_operation: "Importacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-02T06:00:00"),
        notes: "Carga consolidada lista en Laredo."
      },
      {
        category: "clear_usa",
        dateTime: new Date("2026-07-02T09:00:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-07-02T13:45:00"),
        notes: "Desaduanamiento verde en aduana mexicana."
      }
    ]
  },
  {
    id: 5,
    tracking_number: "TA556677",
    customer_tracking: "CUST-33109",
    cliente: "Baja Express Auto",

    create: new Date("2026-07-01T08:00:00"),
    truck: "TR-88",
    vehicle_type: "Trailer",
    trailer: "TA881023",
    origen: "Tijuana Terminal",
    destino: "San Diego Hub",
    type_operation: "Exportacion",
    status: "In Inspection",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-02T07:30:00")
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-02T08:15:00")
      },
      {
        category: "usa_inspeccion",
        dateTime: new Date("2026-07-02T11:00:00"),
        notes: "Revisión secundaria CBP asignada."
      }
    ]
  },
  {
    id: 6,
    tracking_number: "TA998877",
    customer_tracking: "CUST-77231",
    cliente: "NorteAgro Supplies",
    truck: "TR-12",
    create: new Date("2026-07-01T08:00:00"),
    vehicle_type: "Reefer",
    trailer: "RF-3321",
    origen: "Sinaloa Processing Center",
    destino: "McAllen Cold Storage",
    type_operation: "Exportacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-01T04:00:00"),
        notes: "Temperatura verificada a -18°C."
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-01T05:00:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-07-02T10:00:00")
      }
    ]
  },
  {
    id: 7,
    tracking_number: "TA334455",
    customer_tracking: "CUST-10928",
    cliente: "MOGA Logistics",

    create: new Date("2026-07-01T08:00:00"),
    truck: "TR-31",
    vehicle_type: "Trailer",
    trailer: "TA776655",
    origen: "San Luis Potosí Hub",
    destino: "Houston Terminal",
    type_operation: "Exportacion",
    status: "Delivered",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-06-25T09:00:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-06-26T14:00:00")
      },
      {
        category: "clear_usa",
        dateTime: new Date("2026-06-26T17:30:00")
      },
      {
        category: "deliver",
        dateTime: new Date("2026-06-27T12:00:00"),
        notes: "POD recibido sin observaciones."
      }
    ]
  },
];
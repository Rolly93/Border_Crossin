import { Shipment } from '@/types/Shipment';

export let LOADSHIPMENT: Shipment[] = [
  {
    id: 1,
    tracking_number: "92b1234567",
    customer_tracking: "CUST-99211",
    cliente: "MOGA Logistics",
    truck: "TR-15",
    vehicle_type: "Trailer",
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
  {
    id: 8,
    tracking_number: "TA667788",
    customer_tracking: "CUST-55123",
    cliente: "Electrónicos del Norte",
    truck: "TR-50",
    vehicle_type: "Dry Van",
    trailer: "DV-1122",
    origen: "Juárez Assembly Facility",
    destino: "El Paso Distribution",
    type_operation: "Exportacion",
    status: "Delayed",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-02T08:00:00")
      },
      {
        category: "delay",
        dateTime: new Date("2026-07-02T10:30:00"),
        notes: "Falla mecánica menor en tracto. Unidad de sustitución en camino."
      }
    ]
  },
  {
    id: 9,
    tracking_number: "TA443322",
    customer_tracking: "CUST-88901",
    cliente: "Alpha Manufacturing",
    truck: "TR-19",
    vehicle_type: "Flatbed",
    trailer: "FB-0099",
    origen: "Monterrey Plant",
    destino: "San Antonio Depot",
    type_operation: "Exportacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-02T05:30:00")
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-02T06:15:00")
      }
    ]
  },
  {
    id: 10,
    tracking_number: "TA112233",
    customer_tracking: "CUST-22334",
    cliente: "Steel & Machinery MX",
    truck: "TR-03",
    vehicle_type: "Flatbed",
    trailer: "FB-8811",
    origen: "Monclova Yard",
    destino: "Laredo Crossing Hub",
    type_operation: "Exportacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-01T12:00:00"),
        notes: "Carga sobredimensionada asegurada."
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-01T13:00:00")
      },
      {
        category: "safety_yard",
        dateTime: new Date("2026-07-01T20:00:00"),
        notes: "Pernocta en patio de seguridad en Colombia, NL."
      }
    ]
  },
  {
    id: 11,
    tracking_number: "TA887766",
    customer_tracking: "CUST-66554",
    cliente: "Global Trade Corp",
    truck: "TR-42",
    vehicle_type: "Trailer",
    trailer: "TA-9001",
    origen: "El Paso Port",
    destino: "Chihuahua Industrial Park",
    type_operation: "Importacion",
    status: "In Inspection",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-02T09:00:00")
      },
      {
        category: "mex_inspeccion",
        dateTime: new Date("2026-07-02T13:10:00"),
        notes: "Rojo aduanal asignado en puente internacional."
      }
    ]
  },
  {
    id: 12,
    tracking_number: "TA990011",
    customer_tracking: "CUST-99001",
    cliente: "PharmaCare Latam",
    truck: "TR-08",
    vehicle_type: "Reefer",
    trailer: "RF-5050",
    origen: "Mexico City Plant",
    destino: "Pharr Gateway",
    type_operation: "Exportacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-06-30T22:00:00"),
        notes: "Cadena de frío verificada 4°C."
      },
      {
        category: "departure",
        dateTime: new Date("2026-06-30T23:00:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-07-02T08:30:00")
      }
    ]
  },
  {
    id: 13,
    tracking_number: "TA771122",
    customer_tracking: "CUST-33445",
    cliente: "AeroParts Mexico",
    truck: "TR-60",
    vehicle_type: "Bobtail",
    trailer: "BT-1212",
    origen: "Saltillo Plant",
    destino: "Laredo Freight Hub",
    type_operation: "Exportacion",
    status: "Delivered",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-06-27T11:00:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-06-27T18:00:00")
      },
      {
        category: "clear_usa",
        dateTime: new Date("2026-06-27T20:15:00")
      },
      {
        category: "deliver",
        dateTime: new Date("2026-06-28T09:00:00"),
        notes: "Entregado en rampa 4."
      }
    ]
  },
  {
    id: 14,
    tracking_number: "TA223344",
    customer_tracking: "CUST-77889",
    cliente: "MOGA Logistics",
    truck: "TR-27",
    vehicle_type: "Trailer",
    trailer: "TA-3344",
    origen: "Toluca Logistics Center",
    destino: "Laredo Yard",
    type_operation: "Exportacion",
    status: "Delayed",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-01T15:00:00")
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-01T16:00:00")
      },
      {
        category: "delay",
        dateTime: new Date("2026-07-02T02:00:00"),
        notes: "Bloqueo carretero en caseta de cobro."
      }
    ]
  },
  {
    id: 15,
    tracking_number: "TA550011",
    customer_tracking: "CUST-11990",
    cliente: "Baja Express Auto",
    truck: "TR-11",
    vehicle_type: "Dry Van",
    trailer: "DV-6677",
    origen: "Mexicali Facility",
    destino: "Calexico Hub",
    type_operation: "Exportacion",
    status: "In Transit",
    events: [
      {
        category: "pick_up",
        dateTime: new Date("2026-07-02T10:00:00")
      },
      {
        category: "departure",
        dateTime: new Date("2026-07-02T10:45:00")
      },
      {
        category: "clear_mex",
        dateTime: new Date("2026-07-02T12:30:00")
      }
    ]
  }
];
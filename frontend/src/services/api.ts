
const USE_MOCK = import.meta.env.VITE_USE_MOCK ;
const BASE_URL = import.meta.env.VITE_API_URL;
import {type Shipment}  from "../types/logistica";
import { apiRequest } from "../utility/api";
export interface ShipmentStat {
    label: string;
    value: string | number; // Can be "12" or 12
    color: string;
}


export const authService = {
  login: async (userData: any) => {
    console.log(`${BASE_URL}/login`)
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    
    if (!response.ok) {

      const errorMsg = data.detail || data.message || "Error en el servidor";
      throw new Error(errorMsg);
    }
    if (data.status_code =="error"){

      const errorMsg = data.detail;
      throw new Error(errorMsg);
    }

    // Returns { token: string, user: { email: string, name: string } }
    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem('user_session')
    localStorage.removeItem("user"); 
    window.location.href = "/login";
  },
};

export const getShipemntData ={
  getShipment : async(): Promise<Shipment[]>=>{
    if (USE_MOCK){
      console.log("Fetchin Mock Stats");
      await new Promise((resolve)=> setTimeout(resolve,600))

return [
        {
          id: "1",
          my_reference:"TFSQ12345",
          cliente_reference: "92B1354079",
          truck: "truck -52886S",
          cliente: "PALOS GARZA",
          vehicleType: "TRAILER",
          trailer: "141238849",
          scac: "TFBB",
          orgien:"FEMA",
          destino:"Bodega LRD",
          status: "Deliver",
          events: [
            {
              category: "PICK UP",
              date: "02/27/26",
              time: "13:35",
              notes: "TSI"
            },
            {
              category: "DEPARTURE",
              date: "02/27/26",
              time: "14:39"
            },{
              category:"MEX INSPECCION",
              date:"02/27/26",
              time:"14:30",
              notes:"12658"
            },
            {
              category:"CLEAR MEX",
              date:"02/27/26",
              time:"14:00",
              notes:"Modulando USA"
            },
            {
              category:"USA INSPECCION",
              date:"02/27/26",
              time:"14:30",
              notes:"USA 1351"
            },
            {
              category:"CLEAR USA",
              date:"02/27/26",
              time:"14:30",
              notes:"Modulando USA"
            },
            {
              category:"DELIVERY",
              date:"02/27/26",
              time:"13:30",
              notes:"JUAN FERNANDO"
            }
          ]
        },
        {
          id: "2",
          my_reference:"TFSQ3215",
          cliente_reference: "92B1355348",
          truck: "truck -1259",
          cliente: "EXPEDITORS",
          vehicleType: "TRAILER",
          trailer: "TRail- ta651654",
          scac: "TFSQ",
          orgien:"MOGA",
          destino:"Vocar",
          status: "DELAYED",
          events: [
            {
              category: "PICK UP",
              date: "02/27/26",
              time: "13:20",
              notes: "REVISAR DAÑO"
            }
          ]
    }];

  }
  try{
    const data = await apiRequest<Shipment[]>("/stats");
    
    console.log(data); // ✅ TypeScript te ayuda aquí
    return data;
  }catch(error){
    console.log("Dashboard Service Error:" , error);
    throw new Error("No se pudo Cargar los Embarques")
  }

}
}

export const dashboardService = {
    getStats: async (): Promise<ShipmentStat[]> => {
        // 1. MOCK LOGIC
        if (USE_MOCK) {
            console.log("📊 Fetching Mock Dashboard Stats");
            await new Promise((resolve) => setTimeout(resolve, 600)); // Simulates network lag
            
            return [
                { 
                    label: 'Embarques Activos', 
                    value: Math.floor(Math.random() * 20) + 5, // Random number between 5-25
                    color: '#2563eb' 
                },
                { 
                    label: 'En Espera', 
                    value: Math.floor(Math.random() * 10), 
                    color: '#ca8a04' 
                },
                { 
                    label: 'Completados', 
                    value: 48, 
                    color: '#16a34a' 
                },
            ];
        }
        
        // 2. REAL BACKEND LOGIC
        try {
          const data = await apiRequest<ShipmentStat[]>("/stats");
    
          console.log(data.values); 
          return data;
      
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw new Error("No se pudieron cargar las estadísticas.");
    }
  }
};



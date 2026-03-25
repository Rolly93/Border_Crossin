import React, { useState, useEffect } from 'react';
import { dashboardService, getShipemntData, type ShipmentStat } from '../services/api';
import styles from '../modules/Dashboard.module.css'; 
import { Table } from '../components/Table';
import { type Shipment } from '../types/logistica';


const shipmentColumns =["Track Number","Referencia Cliente",
                        "tractor","Cliente","tipo Vehiculo","trailer",
                        "scac","Origen","estatus","Llegada Patio","Destino",
                        "Salida del Patio", "Verde Mex","inspeccion MEX",
                        "Sello Mex", "Verde USA","Inspeccion USA","Sello Usa","Entregado","recive"]
const Dashboard: React.FC = () => {

  const getTime = (s: Shipment, cat: string) => 
    s.events.find(e => e.category === cat)?.time || '--';
  const [stats, setStats] = useState<ShipmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipments , setSipments]=useState<Shipment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData,shipmentData] = await Promise.all([
          dashboardService.getStats(),
          getShipemntData.getShipment()
        ]);
        
        setStats(statsData);
        setSipments(shipmentData)
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className={styles.loader}>Cargando datos del servidor...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel de Control xBorder</h1>
      </header>

      <div className={styles.grid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.card}>
            {/* We keep inline style ONLY for the dynamic color from the API */}
            <div 
              className={styles.statusDot} 
              style={{ backgroundColor: stat.color }} 
            />
            <div>
              <p className={styles.label}>{stat.label}</p>
              <p className={styles.value}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table section placeholder */}
      <section style={{ marginTop: '2rem' }}>
         <Table data={shipments} columns={shipmentColumns} renderRow={(shipment) => ( // This function creates the <td> cells for ONE row
            <>
              <td>{shipment.my_reference}</td>
              <td>{shipment.cliente_reference}</td>
              <td>{shipment.truck}</td>
              <td>{shipment.client}</td>
              <td>{shipment.vehicleType}</td>
              <td>{shipment.trailer}</td>
              <td>{shipment.scac}</td>
              <td>{shipment.orgien}</td>
              <td>{shipment.status}</td>
              <td>{getTime(shipment, "PICK UP")}</td>
              <td>{shipment.destino}</td>
              <td>{getTime(shipment, "DEPARTURE")}</td>
              <td>{getTime(shipment, "CLEAR MEX")}</td>
              <td>{getTime(shipment, "MEX INSPECCION")}</td>
            </>
          )}/>
      </section>
    </div>
  );
};

export default Dashboard;
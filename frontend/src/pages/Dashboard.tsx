import React, { useState, useEffect } from 'react';
import { dashboardService, getShipemntData, type ShipmentStat } from '../services/api';
import styles from '../modules/Dashboard.module.css'; 
import { Table } from '../components/Table';
import { Header } from '../components/Header';
import { ShipmentRow } from '../components/ShipmentRow'; // Nuevo componente
import { type Shipment } from '../types/logistica';

const SHIPMENT_COLUMNS = [
  "Track Number", "Referencia Cliente", "Tractor", "Cliente", "Tipo Vehículo", 
  "Trailer", "SCAC", "Origen", "Destino", "Estatus", "Llegada Patio", 
  "Salida Patio", "Inspección MEX", "Sello Mex", "Verde Mex", "Inspección USA", 
  "Sello Usa", "Verde USA", "Entregado", "Recibe"
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ShipmentStat[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, shipmentData] = await Promise.all([
          dashboardService.getStats(),
          getShipemntData.getShipment()
        ]);
        setStats(statsData);
        setShipments(shipmentData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className={styles.loader}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <Header title="Panel de Control xBorder" styles={styles} />

      {/* Sección de Stats */}
      <div className={styles.grid}>
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      {/* Sección de Tabla */}
      <section style={{ marginTop: '2rem' }}>
        <Table 
          data={shipments} 
          columns={SHIPMENT_COLUMNS} 
          renderRow={(s) => <ShipmentRow shipment={s} />} 
        />
      </section>
    </div>
  );
};

// Sub-componente interno para no saturar el principal
const StatCard = ({ stat }: { stat: ShipmentStat }) => (
  <div className={styles.card}>
    <div className={styles.statusDot} style={{ backgroundColor: stat.color }} />
    <div>
      <p className={styles.label}>{stat.label}</p>
      <p className={styles.value}>{stat.value}</p>
    </div>
  </div>
);

export default Dashboard;
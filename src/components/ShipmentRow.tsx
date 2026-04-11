import { type Shipment } from '../types/logistica';

interface Props {
  shipment: Shipment;
}

export const ShipmentRow: React.FC<Props> = ({ shipment }) => {
  // Helper interno para buscar eventos
  const getEvent = (cat: string) => shipment.events.find(e => e.category === cat);
  
  const formatTime = (cat: string) => {
    const e = getEvent(cat);
    return e ? `${e.date} ${e.time}` : "--";
  };

  const getNotes = (cat: string) => getEvent(cat)?.notes || "--";

  return (
    <>
      <td>{shipment.my_reference}</td>
      <td>{shipment.cliente_reference}</td>
      <td>{shipment.truck}</td>
      <td>{shipment.cliente}</td>
      <td>{shipment.vehicleType}</td>
      <td>{shipment.trailer}</td>
      <td>{shipment.scac}</td>
      <td>{shipment.orgien}</td>
      <td>{shipment.destino}</td>
      <td>{shipment.status}</td>
      <td>{formatTime("PICK UP")}</td>
      <td>{formatTime("DEPARTURE")}</td>
      <td>{formatTime("MEX INSPECCION")}</td>
      <td>{getNotes("MEX INSPECCION")}</td>
      <td>{formatTime("CLEAR MEX")}</td>
      <td>{formatTime("USA INSPECCION")}</td>
      <td>{getNotes("USA INSPECCION")}</td>
      <td>{formatTime("CLEAR USA")}</td>
      <td>{formatTime("DELIVERY")}</td>
      <td>{getNotes("DELIVERY")}</td>
    </>
  );
};
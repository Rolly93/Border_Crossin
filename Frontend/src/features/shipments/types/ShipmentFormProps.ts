import { Shipment } from '@/features/shipments/types/Shipment';

export interface ShipmentFormProps {
  initialData?: Partial<Shipment>;
  onSubmit: (values: Omit<Shipment, 'id' | 'events'>) => void;
  onCancel: () => void;
}

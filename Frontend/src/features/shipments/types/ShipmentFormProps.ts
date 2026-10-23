import { Shipment } from '@/features/shipments/types/Shipment';

export interface ShipmentFormProps {
  initialData?: Partial<Shipment>;
  opened: boolean;
  onSubmit: (values: Omit<Shipment, 'id' | 'events'>) => void;
  onCancel: () => void;
}

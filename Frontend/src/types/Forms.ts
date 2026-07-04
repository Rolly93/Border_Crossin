import { Shipment , EventCategory } from '@/types/Shipment';
import { EmbarqueData } from '@/types/embarque';

export interface ShipmentFormProps {
  initialData?: Partial<Shipment>;
  onSubmit: (values: Omit<Shipment, 'id' | 'events'>) => void; 
  onCancel: () => void;
}

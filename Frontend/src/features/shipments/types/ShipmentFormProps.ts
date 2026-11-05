import { TShipmentBase } from '../hooks/useShipments';

export interface ShipmentFormProps {
  initialData?: Partial<TShipmentBase>;
  opened: boolean;
  onSubmit: (values: Omit<TShipmentBase, 'id' | 'events' | 'status'>) => void;
  onCancel: () => void;
}

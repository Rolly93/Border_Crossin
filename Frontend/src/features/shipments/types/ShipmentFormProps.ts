/** @format */

import { TShipmentResponse } from "../hooks/useShipments";
import { TShipmentCreateFormValues } from "./Shipment";

export interface ShipmentFormProps {
  initialData?: TShipmentResponse;
  opened: boolean;
  /** Debe rechazar (throw) si el backend falla, para que el formulario muestre el error. */
  onSubmit: (values: TShipmentCreateFormValues) => Promise<void>;
  onCancel: () => void;
}

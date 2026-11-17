/** @format */

import { TShipmentRequest, TShipmentResponse } from "../hooks/useShipments";

export interface ShipmentFormProps {
  initialData?: TShipmentResponse;
  opened: boolean;
  onSubmit: (
    values: Omit<TShipmentRequest, "id" | "events" | "status" | "cliente">,
  ) => void;
  onCancel: () => void;
}

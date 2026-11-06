/** @format */

export type UnitState = "ACTIVA" | "MANTENIMIENTO" | "BAJA";

export const UNIT_STATE_OPTIONS: { value: UnitState; label: string }[] = [
  { value: "ACTIVA", label: "Activa" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "BAJA", label: "Baja" },
];
export type TUnitType = "trailer" | "unit truck";
export const UNIT_TYPE: { value: TUnitType; label: string }[] = [
  { value: "trailer", label: "tractor" },
  { value: "unit truck", label: "Camion" },
];

export const UNIT_STATE_COLOR: Record<UnitState, string> = {
  ACTIVA: "green",
  MANTENIMIENTO: "yellow",
  BAJA: "gray",
};

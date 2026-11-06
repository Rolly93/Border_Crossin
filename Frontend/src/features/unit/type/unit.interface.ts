/** @format */

import { TUnitStateOptions, TUnitType } from "../hook/useUnits";


export const UNIT_STATE_OPTIONS: { value: TUnitStateOptions; label: string }[] = [
  { value: "ACTIVA", label: "Activa" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "BAJA", label: "Baja" },
];
export const UNIT_TYPE: { value: TUnitType; label: string }[] = [
  {
    value: "trailer", label: "tractor"
  }, {
    value: "unit truck", label: "Camion"
  }
]

export const UNIT_STATE_COLOR: Record<TUnitStateOptions, string> = {
  ACTIVA: "green",
  MANTENIMIENTO: "yellow",
  BAJA: "gray",
};

/** Renglón de GET /unit/ (incluye el operador vigente, si lo hay). */

export interface IUnitResponse {
  id: number;
  plates: string;
  unitNumber: string | null;
  typeUnit: TUnitType;
  status: TUnitStateOptions;
  tag: string | null;
  driverId: number | null;
  assignedAt: string | null;
  driverName: string;
}
export interface IUnit {
  id: number;
  plates: string;
  unitNumber: string | null;
  typeUnit: TUnitType;

  status: TUnitStateOptions;
  tag: string | null;
  driverId: number | null;
  assignedAt: string | null;
  driverName: string | null;
}

/** Payload para crear o actualizar una unidad. */
export interface IUnitInput {
  plates: string;
  unitNumber: string;
  state: TUnitStateOptions;
  typeUnit: TUnitType;
  tag?: string;
}

/** Registro del historial de asignaciones de una unidad. */
export interface IUnitAssignment {
  id: number;
  driverId: number;
  driverName: string;
  assignedBy: number;
  assignedAt: string;
  releasedAt: string | null;
}
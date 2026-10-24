
export type UnitState = "ACTIVA" | "MANTENIMIENTO" | "BAJA";

export const UNIT_STATE_OPTIONS: { value: UnitState; label: string }[] = [
  { value: "ACTIVA", label: "Activa" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "BAJA", label: "Baja" },
];
export type TUnitType = 'trailer' | 'unit truck'


export const UNIT_STATE_COLOR: Record<UnitState, string> = {
  ACTIVA: "green",
  MANTENIMIENTO: "yellow",
  BAJA: "gray",
};

/** Renglón de GET /unit/ (incluye el operador vigente, si lo hay). */
export interface IUnit {
  id: number;
  plates: string;
  unitNumber: string | null;
  typeUnit:TUnitType

  status: UnitState;
  tag: string | null;
  driverId: number | null;
  driverName: string | null;
  assignedAt: string | null;
}

/** Payload para crear o actualizar una unidad. */
export interface IUnitInput {
  plates: string;
  unitNumber: string;
  state: UnitState;
  typeUnit:TUnitType
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

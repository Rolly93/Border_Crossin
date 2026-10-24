/** @format */

import { ICliente, ISftpConfiguration } from "@/features/clients/types/Cliente";
import {
  IEmployeeDriverResponse,
  IEmployeeUserResponse,
} from "@/features/employee/type/employee.interface";
import { ISftpFileStatus } from "@/features/sftp/types/ISftpSend";
import { Shipment } from "@/features/shipments/types/Shipment";
import { TUnitType, UnitState } from "@/features/unit/type/unit.interface";
import { http, HttpResponse, delay, PathParams } from "msw";

// Base URL of your backend (matches your Axios client configuration)
const BASE_URL = "http://localhost:8000"; //http://127.0.0.1:8000

// Type helpers for MSW
type JsonBody = Record<string, unknown>;

// Mock data
interface MockClient extends ICliente {}

interface MockShipment extends Shipment {}

interface MockSftpConfig extends ISftpConfiguration {
  is_active: boolean;
}

interface MockSftpSend extends ISftpFileStatus {}

interface MockUnit {
  id: number;
  unitNumber: string;
  plates: string;
  status: UnitState;
  tag: string;
  is_active: boolean;
  driver_id: number | null;
  typeUnit: TUnitType;
}

type MockEmployee = IEmployeeUserResponse | IEmployeeDriverResponse;

const mockClients: MockClient[] = [
  {
    id: 1,
    name: "Expeditors",
    still_active: true,
    emailService: true,
    sftService: false,
    telefono: "867123456789",
    email: ["test@expeditros.com"],
  },
  {
    id: 2,
    name: "DHL",
    still_active: true,
    emailService: true,
    sftService: true,
    telefono: "867987654321",
    email: [],
  },
  {
    id: 3,
    name: "FedEx",
    still_active: false,
    emailService: false,
    sftService: false,
    telefono: "867741852963",
    email: ["test@fedex.com", "test2@fedex.com"],
  },
];

const mockShipments: MockShipment[] = [
  {
    id: 1,
    tracking_number: "TRK001",
    customer_tracking: "92B1234567",
    type_operation: "importacion",
    vehicle_type: "trailer",
    cliente: "1",
    origen: "Shanghai",
    destination: "Los Angeles",
    truck: "TRUCK-001",
    trailer: "TRL-001",
    create: new Date("2026-01-15T10:00:00Z"),
    events: [],
  },
  {
    id: 2,
    tracking_number: "TRK002",
    customer_tracking: "CUST002",
    type_operation: "exportacion",
    vehicle_type: "unit truck",
    cliente: "2",
    origen: "Los Angeles",
    destination: "Shanghai",
    truck: "TRUCK-002",
    trailer: "TRL-002",
    create: new Date("2026-01-16T10:00:00Z"),
    events: [],
  },
];

const mockSftpConfigs: MockSftpConfig[] = [
  {
    id: 1,
    idClient: 2,
    host: "sftp.dhl.com",
    port: 22,
    username: "dhl_user",
    root_folder: "/inbound",
    remote_folder: "/outbound",
    is_active: true,
    password: "",
  },
];

const mockSftpSends: MockSftpSend[] = [
  {
    id: 1,
    client_id: 1,
    filename: "RAYC_92B1234567_00215T_651.xml",
    reference: "92B1234567",
    status: "sent",
    created_at: "2026-01-15T10:00:00Z",
    retries: 0,
    sftp_log: "Success",
  },
  {
    id: 2,
    client_id: 2,
    filename: "DHL_651897.xml",
    reference: "REF002",
    status: "failed",
    created_at: "2026-01-16T10:00:00Z",
    retries: 3,
    sftp_log: "Connection timeout",
  },
];

const mockUnits: MockUnit[] = [
  {
    id: 1,
    driver_id: 3,
    unitNumber: "TRUCK-001",
    plates: "ABC-123",
    tag: "ANAM2022L0001T0000000001",
    is_active: true,
    status: "ACTIVA",
    typeUnit: "trailer",
  },

  {
    id: 2,
    driver_id: 4,
    unitNumber: "TRUCK-002",
    plates: "DEF-456",
    tag: "ANAM2022L0001T0000000001",
    is_active: true,
    status: "MANTENIMIENTO",
    typeUnit: "unit truck",
  },
];

const mockEmployees: MockEmployee[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@test.com",
    username: "nld-rolando",
    password: "hunterX0369*",
    isAdmin: true,
    role: "admin",
    rfc: "rfc32165181",
    dateOfBirth: "10/15/1993",
    hireDate: "10/15/2010",
    employeeType: "csr",
  },

  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@test.com",
    username: "janesmith",
    password: "password123",
    isAdmin: false,
    role: "csr",
    rfc: "rfc3165161",
    hireDate: "10/15/2005",
    dateOfBirth: "11/20/1998",
    employeeType: "csr",
  },

  {
    id: 3,
    firstName: "Bob",
    lastName: "Martinez",
    role: "operador",
    rfc: "rfc3165161",
    hireDate: "10/15/2005",
    dateOfBirth: "11/20/1998",
    employeeType: "operador",
    licenseNumber: "LIC-12345",
    licenseExpiration: "2030-01-01",
    gafetId: "ANAMGETR2025062500000001",
  },

  {
    id: 4,
    firstName: "Pepe",
    lastName: "Sanchez",
    role: "operador",
    rfc: "rfc9876541",
    hireDate: "10/15/2005",
    dateOfBirth: "11/20/1998",
    employeeType: "operador",
    licenseNumber: "LIC-12345",
    licenseExpiration: "2030-01-01",
    gafetId: "ANAMGETR2025062500000001",
  },
];

// Simulated JWT tokens
const adminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20ifQ.mock";
const rfcToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJYQVhYMDEwMTAxIiwiaXNfZmlyc3RfdGltZSI6dHJ1ZX0.mock";

// Helper to parse JSON body safely
async function getJsonBody(request: Request): Promise<JsonBody> {
  try {
    const body = await request.json();
    return (body ?? {}) as JsonBody;
  } catch {
    return {};
  }
}

// Helper to get path id safely
function getPathId(params: PathParams): string {
  const id = params.id;
  if (typeof id === "string") {
    return id;
  }
  if (Array.isArray(id)) {
    return id[0] ?? "";
  }
  return "";
}

export const handlers = [
  // Auth
  http.post(`${BASE_URL}/user/login`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const username = (body.username ?? "") as string;
    const password = (body.password ?? "") as string;

    const foundUser = mockEmployees.find((user) => {
      if ("username" in user && "password" in user) {
        return user.username === username && user.password === password;
      }
      return false;
    });

    if (foundUser) {
      if ("isAdmin" in foundUser && foundUser.isAdmin) {
        return HttpResponse.json({
          access_token: adminToken,
          isAdmin: true,
          token_type: "bearer",
          is_first_time: false,
        });
      }

      return HttpResponse.json({
        access_token: rfcToken,
        isAdmin: false,
        token_type: "bearer",
        is_first_time: false,
      });
    }

    console.log(username, password);

    return HttpResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.post(`${BASE_URL}/user/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    return HttpResponse.json({
      status: "success",
      detail: "User created",
      email: body.email ?? "",
    });
  }),

  http.post(`${BASE_URL}/user/logout`, async () => {
    await delay(200);
    return HttpResponse.json({
      status: "success",
      detail: "Logged out successfully",
    });
  }),
  // Matches GET http://127.0.0.1:8000/client?page=1&limit=10
  http.get(`${BASE_URL}/client`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    return HttpResponse.json({
      data: mockClients,
      page,
      limit,
      totalRecords: mockClients.length,
      hasNextPage: false,
    });
  }),

  http.get(`${BASE_URL}/client/by-operation`, async () => {
    await delay(300);
    return HttpResponse.json(
      mockClients
        .filter((c) => c.still_active)
        .map((c) => ({ id: c.id, name: c.name })),
    );
  }),

  http.get(
    `${BASE_URL}/client/:clientId/reference-rules`,
    async ({ params }) => {
      await delay(300);
      const clientId = parseInt(getPathId(params), 10);
      return HttpResponse.json([
        {
          id: 1,
          client_id: clientId,
          prefix: "REF",
          operation_type: "importacion",
          min_length: 5,
          max_length: 20,
        },
        {
          id: 2,
          client_id: clientId,
          prefix: "EXP",
          operation_type: "exportacion",
          min_length: 5,
          max_length: 20,
        },
      ]);
    },
  ),

  http.get(`${BASE_URL}/client/metrics`, async () => {
    await delay(300);
    return HttpResponse.json({
      totalClients: mockClients.length,
      activeClient: mockClients.filter((c) => c.still_active).length,
      emailService: mockClients.filter((c) => c.emailService).length,
      sftpService: mockClients.filter((c) => c.sftService).length,
    });
  }),

  http.post(`${BASE_URL}/client/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newClient: MockClient = {
      id: mockClients.length + 1,
      name: (body.name ?? "") as string,
      still_active: true,
      emailService: false,
      sftService: false,
      telefono: "867-123456789",
    };
    mockClients.push(newClient);
    return HttpResponse.json({ id: newClient.id, name: newClient.name });
  }),

  http.put(`${BASE_URL}/client/update`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const url = new URL(request.url);
    const clientId = parseInt(url.searchParams.get("client_id") || "0", 10);
    const idx = mockClients.findIndex((c) => c.id === clientId);
    if (idx >= 0) {
      mockClients[idx] = { ...mockClients[idx], ...body } as MockClient;
      return HttpResponse.json(mockClients[idx]);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  http.delete(`${BASE_URL}/client/delete/:id`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockClients.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const deleted = mockClients.splice(idx, 1)[0];
      return HttpResponse.json(deleted);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  http.put(`${BASE_URL}/client/reactive/:id`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockClients.findIndex((c) => c.id === id);
    if (idx >= 0) {
      mockClients[idx].still_active = true;
      return HttpResponse.json(mockClients[idx]);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  // Shipments
  http.get(`${BASE_URL}/shipment`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const shipment: MockShipment[] = mockShipments.map((s) => {
      const thisclient = mockClients.find((c) => c.id === s.id);
      return {
        id: s.id,
        tracking_number: s.tracking_number,
        customer_tracking: s.customer_tracking,
        cliente: thisclient ? thisclient.name : s.cliente,
        truck: s.truck,
        vehicle_type: s.vehicle_type,
        trailer: s.trailer,
        origen: s.origen,
        destination: s.destination,
        type_operation: s.type_operation,
        events: s.events,
        create: new Date(s.create!),
        status: s.status,
      };
    });

    return HttpResponse.json({
      data: shipment,
      page,
      limit,
      totalRecords: mockShipments.length,
      hasNextPage: false,
    });
  }),

  http.get(`${BASE_URL}/client/all`, async () => {
    await delay(300);
    return HttpResponse.json(mockClients);
  }),

  http.post(`${BASE_URL}/shipment/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newShipment: MockShipment = {
      id: mockShipments.length + 1,
      tracking_number: (body.tracking_number ?? "") as string,
      customer_tracking: (body.customer_tracking ?? "") as string,
      vehicle_type: "trailer",
      type_operation: (body.type_operation ?? "") as string,
      cliente: (body.cliente ?? "") as string,
      origen: (body.origen ?? "") as string,
      destination: (body.destination ?? "") as string,
      truck: (body.truck ?? "") as string,
      trailer: (body.trailer ?? "") as string,
      create: new Date(),
      events: [],
    };
    mockShipments.push(newShipment);
    return HttpResponse.json(newShipment);
  }),

  http.put(`${BASE_URL}/shipment/:id/update`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const id = parseInt(getPathId(params), 10);
    const idx = mockShipments.findIndex((s) => s.id === id);
    if (idx >= 0) {
      mockShipments[idx] = { ...mockShipments[idx], ...body } as MockShipment;
      return HttpResponse.json(mockShipments[idx]);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  http.patch(`${BASE_URL}/shipment/:id/delete`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockShipments.findIndex((s) => s.id === id);
    if (idx >= 0) {
      const deleted = mockShipments.splice(idx, 1)[0];
      return HttpResponse.json(deleted);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  // SFTP
  http.get(`${BASE_URL}/sftp/connection`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const clientId = parseInt(url.searchParams.get("client_id") || "0", 10);
    const config = mockSftpConfigs.find((c) => c.idClient === clientId);
    return HttpResponse.json(config ?? null);
  }),

  http.post(`${BASE_URL}/sftp/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newConfig: MockSftpConfig = {
      id: mockSftpConfigs.length + 1,
      ...body,
      is_active: true,
    } as MockSftpConfig;
    mockSftpConfigs.push(newConfig);
    return HttpResponse.json(newConfig);
  }),

  http.put(`${BASE_URL}/sftp/update/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const id = parseInt(getPathId(params), 10);
    const idx = mockSftpConfigs.findIndex((c) => c.id === id);
    if (idx >= 0) {
      mockSftpConfigs[idx] = {
        ...mockSftpConfigs[idx],
        ...body,
      } as MockSftpConfig;
      return HttpResponse.json(mockSftpConfigs[idx]);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  http.delete(`${BASE_URL}/sftp/delete/:id`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockSftpConfigs.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const deleted = mockSftpConfigs.splice(idx, 1)[0];
      return HttpResponse.json({ id: deleted.id, is_active: false });
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  http.get(`${BASE_URL}/sftp/sends`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const clientId = url.searchParams.get("client_id");
    let results = mockSftpSends;
    if (clientId) {
      results = results.filter((s) => s.client_id === parseInt(clientId, 10));
    }
    return HttpResponse.json(results);
  }),

  http.post(`${BASE_URL}/sftp/resend`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const sendIds = (body.send_ids ?? []) as number[];
    const results = mockSftpSends
      .filter((s) => sendIds.includes(s.id))
      .map((s) => ({ ...s, status: "sent" as const }));
    return HttpResponse.json(results);
  }),

  // Units
  http.get(`${BASE_URL}/unit`, async () => {
    await delay(300);
    const driverList = mockEmployees
      .filter((e) => e.employeeType === "operador")
      .map((e) => {
        const assginedUnit = mockUnits.find((u) => u.driver_id === e.id);

        return {
          id: assginedUnit?.id,
          plates: assginedUnit?.plates,
          unitNumber: assginedUnit?.unitNumber,
          typeUnit: assginedUnit?.typeUnit,
          status: assginedUnit?.status,
          tag: assginedUnit?.tag,
          driverId: e.id,
          driverName: `${e.firstName} ${e.lastName}`,
        };
      });
    return HttpResponse.json(driverList);
  }),

  http.post(`${BASE_URL}/unit/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newUnit: MockUnit = {
      id: mockUnits.length + 1,
      ...body,
      is_active: true,
    } as MockUnit;
    mockUnits.push(newUnit);
    return HttpResponse.json(newUnit);
  }),

  http.put(`${BASE_URL}/unit/update/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const id = parseInt(getPathId(params), 10);
    const idx = mockUnits.findIndex((u) => u.id === id);
    if (idx >= 0) {
      mockUnits[idx] = { ...mockUnits[idx], ...body } as MockUnit;
      return HttpResponse.json(mockUnits[idx]);
    }
    return HttpResponse.json({ detail: "Not found" }, { status: 404 });
  }),

  http.post(`${BASE_URL}/unit/:id/assign`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    return HttpResponse.json({
      unit_id: parseInt(getPathId(params), 10),
      driver_id: (body.driverId ?? 0) as number,
      assigned_at: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/unit/:id/release`, async () => {
    await delay(500);
    return HttpResponse.json({ detail: "Unit released" });
  }),

  http.get(`${BASE_URL}/unit/:id/history`, async ({ params }) => {
    await delay(300);
    const unitId = parseInt(getPathId(params), 10);
    return HttpResponse.json([
      {
        unit_id: unitId,
        driver_id: 1,
        assigned_at: "2026-01-01T10:00:00Z",
        released_at: "2026-01-15T10:00:00Z",
      },
      {
        unit_id: unitId,
        driver_id: 2,
        assigned_at: "2026-01-16T10:00:00Z",
        released_at: null,
      },
    ]);
  }),

  // Employees
  http.get(`${BASE_URL}/employees`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    return HttpResponse.json({
      data: mockEmployees,
      page,
      limit,
      totalRecords: mockEmployees.length,
      hasNextPage: false,
    });
  }),

  http.get(`${BASE_URL}/employees/operators`, async () => {
    await delay(300);
    const operdadorWithUnit = mockEmployees
      .filter((e) => e.employeeType === "operador")
      .map((e) => {
        const assginedUnit = mockUnits.find((u) => u.driver_id === e.id);

        return {
          id: e.id,
          firstName: `${e.firstName} ${e.lastName}`,
          unit: assginedUnit ? assginedUnit.unitNumber : undefined,
          typeUnit: assginedUnit?.typeUnit,
        };
      });
    return HttpResponse.json(operdadorWithUnit);
  }),

  http.get(
    `${BASE_URL}/employees/:id`,
    async ({ params, request: _request }) => {
      await delay(300);
      const id = parseInt(getPathId(params), 10);
      const emp = mockEmployees.find((e) => e.id === id);
      if (emp) {
        return HttpResponse.json({ data: emp });
      }
      return HttpResponse.json({ detail: "Not found" }, { status: 404 });
    },
  ),

  http.post(`${BASE_URL}/employees/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newEmp: MockEmployee = {
      id: mockEmployees.length + 1,
      ...body,
    } as MockEmployee;
    mockEmployees.push(newEmp);
    return HttpResponse.json(newEmp);
  }),

  // Event stream / SSE mock// Replace your current /events/stream handler with this:
  http.get(`${BASE_URL}/events/stream`, () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send an SSE comment heartbeat to keep connection open without triggering notifications
        controller.enqueue(encoder.encode(": keep-alive\n\n"));

        // Keep stream alive
        const timer = setInterval(() => {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }, 15000);

        return () => clearInterval(timer);
      },
    });

    return new HttpResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }),

  // System
  http.get(`${BASE_URL}/system/config`, async () => {
    await delay(300);
    return HttpResponse.json({ scac: "BCRS" });
  }),

  http.put(`${BASE_URL}/system/config`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    return HttpResponse.json({ scac: body.scac ?? "" });
  }),

  // Update
  http.get(`${BASE_URL}/api/v1/check`, async () => {
    await delay(300);
    return HttpResponse.json({
      update_available: false,
      version: "1.0.0",
      type: "optional",
      url: "",
      mandatory: false,
    });
  }),
];

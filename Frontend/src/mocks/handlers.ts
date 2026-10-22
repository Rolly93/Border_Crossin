import { http, HttpResponse, delay, PathParams } from 'msw';

// Base URL of your backend (matches your Axios client configuration)
const BASE_URL = 'http://127.0.0.1:8000';
export type UnitState = "ACTIVA" | "MANTENIMIENTO" | "BAJA";

// Type helpers for MSW
type JsonBody = Record<string, unknown>;

// Mock data
interface MockClient {
  id: number;
  name: string;
  still_active: boolean;
  email_service: boolean;
  sftp_service: boolean;
}

interface MockShipment {
  id: number;
  tracking_number: string;
  customer_tracking: string;
  type_operation: string;
  cliente: string;
  origen: string;
  destination: string;
  truck: string;
  trailer: string;
  created_at: string;
  events: unknown[];
}

interface MockSftpConfig {
  id: number;
  idClient: number;
  host: string;
  port: number;
  username: string;
  root_folder: string;
  remote_folder: string;
  is_active: boolean;
}

interface MockSftpSend {
  id: number;
  client_id: number;
  reference: string;
  status: 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
  error?: string;
}

interface MockUnit {
  id: number;
  unitNumber: string;
  plates: string;
  status: UnitState;
  tag: string;
  is_active: boolean;
}

interface MockEmployee {
  id: number;
  name: string;
  email: string;
  cargo: string;
  is_active: boolean;
}

const mockClients: MockClient[] = [
  { id: 1, name: 'Expeditors', still_active: true, email_service: true, sftp_service: false },
  { id: 2, name: 'DHL', still_active: true, email_service: true, sftp_service: true },
  { id: 3, name: 'FedEx', still_active: false, email_service: false, sftp_service: false },
];

const mockShipments: MockShipment[] = [
  {
    id: 1,
    tracking_number: 'TRK001',
    customer_tracking: 'CUST001',
    type_operation: 'importacion',
    cliente: '1',
    origen: 'Shanghai',
    destination: 'Los Angeles',
    truck: 'TRUCK-001',
    trailer: 'TRL-001',
    created_at: '2026-01-15T10:00:00Z',
    events: [],
  },
  {
    id: 2,
    tracking_number: 'TRK002',
    customer_tracking: 'CUST002',
    type_operation: 'exportacion',
    cliente: '2',
    origen: 'Los Angeles',
    destination: 'Shanghai',
    truck: 'TRUCK-002',
    trailer: 'TRL-002',
    created_at: '2026-01-16T10:00:00Z',
    events: [],
  },
];

const mockSftpConfigs: MockSftpConfig[] = [
  { id: 1, idClient: 2, host: 'sftp.dhl.com', port: 22, username: 'dhl_user', root_folder: '/inbound', remote_folder: '/outbound', is_active: true },
];

const mockSftpSends: MockSftpSend[] = [
  { id: 1, client_id: 2, reference: 'REF001', status: 'sent', created_at: '2026-01-15T10:00:00Z', sent_at: '2026-01-15T10:05:00Z' },
  { id: 2, client_id: 2, reference: 'REF002', status: 'failed', created_at: '2026-01-16T10:00:00Z', error: 'Connection timeout' },
];

const mockUnits: MockUnit[] = [
  { id: 1, unitNumber: 'TRUCK-001', plates: 'ABC-123', tag: 'TAG-001', is_active: true, status: 'ACTIVA' },
  { id: 2, unitNumber: 'TRUCK-002', plates: 'DEF-456', tag: 'TAG-002', is_active: true, status: 'MANTENIMIENTO' },
];

const mockEmployees: MockEmployee[] = [
  { id: 1, name: 'John Doe', email: 'john@test.com', cargo: 'operador', is_active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@test.com', cargo: 'csr', is_active: true },
];

// Simulated JWT tokens
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaXNfYWRtaW4iOnRydWUsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20ifQ.mock';
const rfcToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJYQVhYMDEwMTAxIiwiaXNfZmlyc3RfdGltZSI6dHJ1ZX0.mock';

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
  if (typeof id === 'string') {
    return id;
  }
  if (Array.isArray(id)) {
    return id[0] ?? '';
  }
  return '';
}

export const handlers = [
  // Auth
  http.post(`${BASE_URL}/user/login`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const username = (body.username ?? '') as string;
    const password = (body.password ?? '') as string;
    if (username === 'nld-admin' && password === '1234') {
      return HttpResponse.json({ access_token: adminToken, isAdmin: true, token_type: 'bearer' });
    }
    if (username === 'nld-rolando' && password === '1234') {
      return HttpResponse.json({ access_token: rfcToken, isAdmin: false, token_type: 'bearer', is_first_time: true });
    }
    return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${BASE_URL}/user/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    return HttpResponse.json({ status: 'success', detail: 'User created', email: body.email ?? '' });
  }),

  http.post(`${BASE_URL}/user/logout`, async () => {
    await delay(200);
    return HttpResponse.json({ status: 'success', detail: 'Logged out successfully' });
  }),
  // Matches GET http://127.0.0.1:8000/client?page=1&limit=10
  http.get(`${BASE_URL}/client`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

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
    return HttpResponse.json(mockClients.filter(c => c.still_active).map(c => ({ id: c.id, name: c.name })));
  }),

  http.get(`${BASE_URL}/client/:clientId/reference-rules`, async ({ params }) => {
    await delay(300);
    const clientId = parseInt(getPathId(params), 10);
    return HttpResponse.json([
      { id: 1, client_id: clientId, prefix: 'REF', operation_type: 'importacion', min_length: 5, max_length: 20 },
      { id: 2, client_id: clientId, prefix: 'EXP', operation_type: 'exportacion', min_length: 5, max_length: 20 },
    ]);
  }),

  http.get(`${BASE_URL}/client/metrics`, async () => {
    await delay(300);
    return HttpResponse.json({
      totalClients: mockClients.length,
      activeClient: mockClients.filter(c => c.still_active).length,
      emailService: mockClients.filter(c => c.email_service).length,
      sftpService: mockClients.filter(c => c.sftp_service).length,
    });
  }),

  http.post(`${BASE_URL}/client/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newClient: MockClient = { id: mockClients.length + 1, name: (body.name ?? '') as string, still_active: true, email_service: false, sftp_service: false };
    mockClients.push(newClient);
    return HttpResponse.json({ id: newClient.id, name: newClient.name });
  }),

  http.put(`${BASE_URL}/client/update`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const url = new URL(request.url);
    const clientId = parseInt(url.searchParams.get('client_id') || '0', 10);
    const idx = mockClients.findIndex(c => c.id === clientId);
    if (idx >= 0) {
      mockClients[idx] = { ...mockClients[idx], ...body } as MockClient;
      return HttpResponse.json(mockClients[idx]);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.delete(`${BASE_URL}/client/delete/:id`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockClients.findIndex(c => c.id === id);
    if (idx >= 0) {
      const deleted = mockClients.splice(idx, 1)[0];
      return HttpResponse.json(deleted);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.put(`${BASE_URL}/client/reactive/:id`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockClients.findIndex(c => c.id === id);
    if (idx >= 0) {
      mockClients[idx].still_active = true;
      return HttpResponse.json(mockClients[idx]);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),


  // Shipments
  http.get(`${BASE_URL}/shipment`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    return HttpResponse.json({
      data: mockShipments,
      page,
      limit,
      totalRecords: mockShipments.length,
      hasNextPage: false,
    });
  }),

  // Clients - All (Matches GET http://127.0.0.1:8000/client/all)
  http.get(`${BASE_URL}/client/all`, async () => {
    await delay(300);
    return HttpResponse.json(mockClients);
  }),

  http.post(`${BASE_URL}/shipment/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newShipment: MockShipment = {
      id: mockShipments.length + 1,
      tracking_number: (body.tracking_number ?? '') as string,
      customer_tracking: (body.customer_tracking ?? '') as string,
      type_operation: (body.type_operation ?? '') as string,
      cliente: (body.cliente ?? '') as string,
      origen: (body.origen ?? '') as string,
      destination: (body.destination ?? '') as string,
      truck: (body.truck ?? '') as string,
      trailer: (body.trailer ?? '') as string,
      created_at: new Date().toISOString(),
      events: []
    };
    mockShipments.push(newShipment);
    return HttpResponse.json(newShipment);
  }),

  http.put(`${BASE_URL}/shipment/:id/update`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const id = parseInt(getPathId(params), 10);
    const idx = mockShipments.findIndex(s => s.id === id);
    if (idx >= 0) {
      mockShipments[idx] = { ...mockShipments[idx], ...body } as MockShipment;
      return HttpResponse.json(mockShipments[idx]);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.patch(`${BASE_URL}/shipment/:id/delete`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockShipments.findIndex(s => s.id === id);
    if (idx >= 0) {
      const deleted = mockShipments.splice(idx, 1)[0];
      return HttpResponse.json(deleted);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  // SFTP
  http.get(`${BASE_URL}/sftp/connection`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const clientId = parseInt(url.searchParams.get('client_id') || '0', 10);
    const config = mockSftpConfigs.find(c => c.idClient === clientId);
    return HttpResponse.json(config ?? null);
  }),

  http.post(`${BASE_URL}/sftp/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newConfig: MockSftpConfig = {
      id: mockSftpConfigs.length + 1,
      ...body,
      is_active: true
    } as MockSftpConfig;
    mockSftpConfigs.push(newConfig);
    return HttpResponse.json(newConfig);
  }),

  http.put(`${BASE_URL}/sftp/update/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const id = parseInt(getPathId(params), 10);
    const idx = mockSftpConfigs.findIndex(c => c.id === id);
    if (idx >= 0) {
      mockSftpConfigs[idx] = { ...mockSftpConfigs[idx], ...body } as MockSftpConfig;
      return HttpResponse.json(mockSftpConfigs[idx]);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.delete(`${BASE_URL}/sftp/delete/:id`, async ({ params }) => {
    await delay(500);
    const id = parseInt(getPathId(params), 10);
    const idx = mockSftpConfigs.findIndex(c => c.id === id);
    if (idx >= 0) {
      const deleted = mockSftpConfigs.splice(idx, 1)[0];
      return HttpResponse.json({ id: deleted.id, is_active: false });
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.get(`${BASE_URL}/sftp/sends`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    let results = mockSftpSends;
    if (clientId) {
      results = results.filter(s => s.client_id === parseInt(clientId, 10));
    }
    return HttpResponse.json(results);
  }),

  http.post(`${BASE_URL}/sftp/resend`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const sendIds = (body.send_ids ?? []) as number[];
    const results = mockSftpSends
      .filter(s => sendIds.includes(s.id))
      .map(s => ({ ...s, status: 'sent' as const }));
    return HttpResponse.json(results);
  }),

  // Units
  http.get(`${BASE_URL}/unit`, async () => {
    await delay(300);
    return HttpResponse.json(mockUnits);
  }),

  http.post(`${BASE_URL}/unit/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newUnit: MockUnit = {
      id: mockUnits.length + 1,
      ...body,
      is_active: true
    } as MockUnit;
    mockUnits.push(newUnit);
    return HttpResponse.json(newUnit);
  }),

  http.put(`${BASE_URL}/unit/update/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const id = parseInt(getPathId(params), 10);
    const idx = mockUnits.findIndex(u => u.id === id);
    if (idx >= 0) {
      mockUnits[idx] = { ...mockUnits[idx], ...body } as MockUnit;
      return HttpResponse.json(mockUnits[idx]);
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.post(`${BASE_URL}/unit/:id/assign`, async ({ params, request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    return HttpResponse.json({
      unit_id: parseInt(getPathId(params), 10),
      driver_id: (body.driverId ?? 0) as number,
      assigned_at: new Date().toISOString()
    });
  }),

  http.post(`${BASE_URL}/unit/:id/release`, async () => {
    await delay(500);
    return HttpResponse.json({ detail: 'Unit released' });
  }),

  http.get(`${BASE_URL}/unit/:id/history`, async ({ params }) => {
    await delay(300);
    const unitId = parseInt(getPathId(params), 10);
    return HttpResponse.json([
      { unit_id: unitId, driver_id: 1, assigned_at: '2026-01-01T10:00:00Z', released_at: '2026-01-15T10:00:00Z' },
      { unit_id: unitId, driver_id: 2, assigned_at: '2026-01-16T10:00:00Z', released_at: null },
    ]);
  }),

  // Employees
  http.get(`${BASE_URL}/employees`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
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
    return HttpResponse.json(mockEmployees.filter(e => e.cargo === 'operador' && e.is_active).map(e => ({ id: e.id, name: e.name })));
  }),

  http.get(`${BASE_URL}/employees/:id`, async ({ params, request: _request }) => {
    await delay(300);
    const id = parseInt(getPathId(params), 10);
    const emp = mockEmployees.find(e => e.id === id);
    if (emp) {
      return HttpResponse.json({ data: emp });
    }
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  http.post(`${BASE_URL}/employees/create`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    const newEmp: MockEmployee = {
      id: mockEmployees.length + 1,
      ...body,
      is_active: true
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
        controller.enqueue(encoder.encode(': keep-alive\n\n'));

        // Keep stream alive
        const timer = setInterval(() => {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        }, 15000);

        return () => clearInterval(timer);
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }),

  // System
  http.get(`${BASE_URL}/system/config`, async () => {
    await delay(300);
    return HttpResponse.json({ scac: 'BCRS' });
  }),

  http.put(`${BASE_URL}/system/config`, async ({ request }) => {
    await delay(500);
    const body = await getJsonBody(request);
    return HttpResponse.json({ scac: body.scac ?? '' });
  }),

  // Update
  http.get(`${BASE_URL}/api/v1/check`, async () => {
    await delay(300);
    return HttpResponse.json({
      update_available: false,
      version: '1.0.0',
      type: 'optional',
      url: '',
      mandatory: false,
    });
  }),
];
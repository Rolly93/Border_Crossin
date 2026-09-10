
const ip = import.meta.env.VITE_API_URL || false

export const employeeService: IEmployeeService = ip
  ? new ApiShipmentService() : new MockShipmentService();

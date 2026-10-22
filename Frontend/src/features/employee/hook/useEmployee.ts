import { useCallback } from "react";
import { EmployeeType, IEmployeeRequest, IEmployeeResponse, INewEmployeeRequest } from "../type/employee.interface";
import { employeeService } from "../service/EmployeeService";
import { usePaginatedList } from "@/components/hook/usePaginaterList";

export function useEmployee() {
  const fetchFn = useCallback((page: number, size: number) => employeeService.getPaginated(page, size), []);

  const {
    data: employeeData,
    setData: setEmployeeData,
    loading,
    error,
    hasMore,
    setError,
    fetchNextPage,
    setLoading,
  } = usePaginatedList<IEmployeeResponse>(fetchFn);

  const updateEmployee = async (id: number, updatedData: IEmployeeRequest): Promise<IEmployeeResponse> => {
    try {
      const updated = await employeeService.update(id, updatedData);
      setEmployeeData((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const getEmployeeData = async (id: number, cargoType: EmployeeType): Promise<IEmployeeResponse> => {
    try {
      const employeeData = await employeeService.getEmployee(id, cargoType);
      return employeeData as IEmployeeResponse;
    } catch (error) {
      console.error("Error fetching employee data", error);
      throw error;
    }
  };

  const deleteEmployee = async (id: number): Promise<IEmployeeResponse> => {
    try {
      const data = await employeeService.delete(id);
      setEmployeeData((prev) => prev.filter((c) => c.id !== data.id));
      return data;
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  const createNewEmployee = async (employeeData: IEmployeeRequest): Promise<IEmployeeResponse> => {
    try {
      setLoading(true);
      setError(null);
      const newEmployee = await employeeService.insert(employeeData);
      setEmployeeData((prev) => [newEmployee, ...prev]);
      return newEmployee;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const createEmployeeAccount = async (payload: INewEmployeeRequest): Promise<IEmployeeResponse> => {
    setLoading(true);
    setError(null);
    try {
      const created = await employeeService.createEmployee(payload);
      setEmployeeData((prev) => [created, ...prev]);
      return created;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    employeeData,
    loading,
    error,
    hasMore,
    createNewEmployee,
    createEmployeeAccount,
    fetchNextPage,
    setError,
    updateEmployee,
    deleteEmployee,
    getEmployeeData,
  } as const;
}
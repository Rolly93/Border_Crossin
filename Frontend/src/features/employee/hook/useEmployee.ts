import { useCallback } from "react";
import { EmployeeType, IEmployeeFormRequest, IEmployeeRequest, IEmployeeResponse, INewEmployeeRequest, TEmployeeResponseMap } from "../type/employee.interface";
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

  const updateEmployee = async (id: number, updatedData: TEmployeeResponseMap): Promise<IEmployeeResponse> => {
    const updated = await employeeService.update(id, updatedData);
    setEmployeeData((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const getEmployeeData = async (id: number, cargoType: EmployeeType): Promise<IEmployeeResponse> => {
    const employeeData = await employeeService.getEmployee(id, cargoType);
    return employeeData as IEmployeeResponse;
  };

  const deleteEmployee = async (id: number): Promise<IEmployeeResponse> => {
    const data = await employeeService.delete(id);
    setEmployeeData((prev) => prev.filter((c) => c.id !== data.id));
    return data;
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
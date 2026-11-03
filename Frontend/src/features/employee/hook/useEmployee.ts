import { useCallback } from "react";
import { EmployeeType, IEmployeeFormRequest, IEmployeeRequest, IEmployeeResponse, INewEmployeeRequest, TEmployeeResponseMap } from "../type/employee.interface";
import { employeeService } from "../service/EmployeeService";
import { usePaginatedList } from "@/components/hook/usePaginaterList";

import { components } from "@/types/api";
export type TEmployeeCreateUnion = components['schemas']['EmployeeUserRequest'] | components['schemas']['EmployeeDriverRequest']
export type TEmployeeCreateUnionResponse = components['schemas']['EmployeeUserResponse'] | components['schemas']['EmployeeDriverResponse']
export type TEmployeeUserRequest = components['schemas']['EmployeeUserRequest']
export type TEmployeeBase = components['schemas']['EmployeeRequest']
export type TEmployeeBaseRequest = Omit<TEmployeeBase, "id">

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
    createEmployeeAccount,
    fetchNextPage,
    setError,
    updateEmployee,
    deleteEmployee,
    getEmployeeData,
  } as const;
}
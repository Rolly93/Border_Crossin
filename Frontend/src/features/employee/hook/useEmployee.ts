/** @format */

import { useCallback } from "react";

import { employeeService } from "../service/EmployeeService";
import { usePaginatedList } from "@/components/hook/usePaginaterList";

import { components } from "@/types/api";
export type TEmployeeCreateUnion =
  | components["schemas"]["EmployeeUserRequest"]
  | components["schemas"]["EmployeeDriverRequest"];

export type TEmployeeCreateUnionResponse =
  | components["schemas"]["EmployeeUserResponse"]
  | components["schemas"]["EmployeeDriverResponse"];

export type TEmployeeAllRequest = components['schemas']['EmployeeRequest']
export type TEmployeeUserRequest = components['schemas']['EmployeeUserRequest']
export type TEmployeeUserResponse = components['schemas']['EmployeeUserResponse']
export type TEmployeeDriverResponse = components["schemas"]["EmployeeDriverResponse"]
export type TEmployeeDriverRequest = components["schemas"]["EmployeeDriverRequest"]
export type TEmployeeType = components["schemas"]["CargoTypeEnum"];
export type TEmployeeBaseRequest = components["schemas"]["EmployeeBaseRequest"];
export type TEmployeeBaseResponse = components["schemas"]["EmployeeBaseResponse"];

export type TPaginatedEmployeeResponse = components['schemas']['PaginatedEmployeeResponse']
export type TOperatorOption = components['schemas']['OperatorOptionResponse']

export function useEmployee() {
  const fetchFn = useCallback(
    (page: number, size: number) => employeeService.getPaginated(page, size),
    [],
  );

  const {
    data: employeeData,
    setData: setEmployeeData,
    loading,
    error,
    hasMore,
    setError,
    fetchNextPage,
    setLoading,
  } = usePaginatedList<TEmployeeBaseResponse>(fetchFn);

  const updateEmployee = async (
    id: number,
    updatedData: TEmployeeCreateUnionResponse,
  ): Promise<TEmployeeCreateUnionResponse> => {

    const updated = await employeeService.update(id, updatedData);
    setEmployeeData((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const getEmployeeData = async (
    id: number,
    cargoType: TEmployeeType,
  ): Promise<TEmployeeCreateUnionResponse> => {
    const employeeData = await employeeService.getEmployee(id, cargoType);
    return employeeData as TEmployeeCreateUnionResponse;
  };

  const deleteEmployee = async (id: number): Promise<TEmployeeCreateUnionResponse> => {
    const data = await employeeService.delete(id);
    setEmployeeData((prev) => prev.filter((c) => c.id !== data.id));
    return data;
  };

  const createEmployeeAccount = async (
    payload: TEmployeeCreateUnion,
  ): Promise<TEmployeeCreateUnionResponse> => {
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

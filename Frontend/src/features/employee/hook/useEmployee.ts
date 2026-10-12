import { useCallback } from 'react';
import { IEmployeeRequest, IEmployeeResponse, INewEmployeeRequest } from '../type/employee.interface';
import { employeeService } from '../service/EmployeeService';
import { usePaginatedList } from '@/components/hook/usePaginaterList';
export function useEmployee() {
  const fetchFn = useCallback((page: number, size: number) => employeeService.getPaginated(page, size), []
  )

  const {
    data: employeeData,
    setData: setEmployeeData,
    loading,
    error,
    hasMore,
    setError,
    fetchNextPage, setLoading

  } = usePaginatedList<IEmployeeResponse>(fetchFn);

  const updateEmployee = async (id: number, updatedData: IEmployeeRequest) => {
    try {
      const updateEmployee = await employeeService.update(id, updatedData)
      setEmployeeData((prev) =>
        prev.map((c) => (c.id === id ? updateEmployee : c)));
      return updateEmployee
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }


  const deleteEmployee = async (id: number) => {
    try {
      const data = await employeeService.delete(id)

      setEmployeeData((prev) => prev.filter((c) => (c.id !== data.id)))
      return data
    } catch (error) {
      console.error("Error updating client:", error)
    }

  }
  const createNewEmployee = async (employeeData: IEmployeeRequest) => {

    try {
      setLoading(true)
      setError(null)
      const newEmployee = await employeeService.insert(employeeData)
      setEmployeeData((prev) => [newEmployee, ...prev])
      return newEmployee
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  /** Alta de empleado tipo cargo (con cuenta) u operador (con licencia). */
  const createEmployeeAccount = async (payload: INewEmployeeRequest) => {
    setLoading(true)
    setError(null)
    try {
      const created = await employeeService.createEmployee(payload)
      setEmployeeData((prev) => [created, ...prev])
      return created
    } finally {
      setLoading(false)
    }
  }

  return { employeeData, loading, error, hasMore, createNewEmployee, createEmployeeAccount, fetchNextPage, setError, updateEmployee, deleteEmployee } as const;
}
import { useCallback } from 'react';
import { IEmployee } from '../type/employee.interface';
import { employeeService } from '../service/EmployeeService';
import { usePaginatedList } from '@/components/hook/usePaginaterList';
export function useEmployee() {
  const fetchFn = useCallback((page: number, size: number) => employeeService.getPaginated(page, size), []
  )

  const {
    data: employeeData,
    setData: setEmployeeData,
    loading,
    error, hasMore,

    setError,
    fetchNextPage, setLoading

  } = usePaginatedList<IEmployee>(fetchFn);

  const updateEmployee = async (id: number, updatedData: IEmployee) => {
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
  const createNewEmployee = async (employeeData: IEmployee) => {
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

  return { employeeData, loading, error, hasMore, createNewEmployee, fetchNextPage, updateEmployee, deleteEmployee } as const;
}
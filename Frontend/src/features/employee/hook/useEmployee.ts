import { useState, FormEvent } from 'react';
import { IEmployeeCreate } from '../type/employee.interface';
import { employeeService } from '../service/EmployeeService';

export function useEmployee() {
  const [employeeData, setEmployeeData] = useState<IEmployeeCreate>({
    firstName: '',
    lastName: '',
    dateOfBirth: new Date(),
    rfc: '',
    role: ''
  })
  const [error, setError] = useState<string[] | string | null>('')
  const [loading, setLoading] = useState<boolean>(false)

  const createNewEmployee = async (employeeData: IEmployeeCreate) => {
    try {
      setLoading(true)
      setError(null)
      const newEmployee = await employeeService.insert(employeeData)
      return newEmployee
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    employeeData, loading, error, createNewEmployee, setEmployeeData, setError
  } as const
}
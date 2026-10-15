import { useState } from 'react';
import { useForm } from '@mantine/form';
import { getErrorMessage } from '@/components/utils/errorMessage';
import { EmployeeType, IEmployeeResponse, INewEmployeeRequest } from '../type/employee.interface';



export interface EmployeeFormValues {
  employeeType: EmployeeType;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  rfc: string;
  // cargo
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAdmin: boolean;
  // operador
  licenseNumber: string;
  licenseExpiration: Date | null;
  gafetId: string;
}

const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fecha local como YYYY-MM-DD (el backend espera `date`, no datetime). */
export function toIsoDate(value: Date): string {
  const dataObj = typeof value === "string" ? new Date(value) : value;
  const y = dataObj.getFullYear();
  const m = String(dataObj.getMonth() + 1).padStart(2, '0');
  const d = String(dataObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type ExtendedEmployee = Omit<IEmployeeResponse, 'dateOfBirth'> & Partial<INewEmployeeRequest> & {
  dateOfBirth?: Date | string | null;
};


interface UseEmployeeFormOptions {
  initialEmployee?: any | null;
  onSubmitAction: (payload: any, employeeId?: number) => Promise<IEmployeeResponse | undefined>;
  onSuccess?: (employee: IEmployeeResponse) => void;
}

const initialValues: EmployeeFormValues = {
  employeeType: 'cargo',
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  rfc: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  isAdmin: false,
  licenseNumber: '',
  licenseExpiration: null,
  gafetId: '',
};

/**
 * Maneja el formulario "Nuevo empleado": validación según el tipo
 * (cargo = cuenta de usuario, operador = licencia y gafete) y envío.
 */
export function useEmployeeForm({
  initialEmployee,
  onSubmitAction,
  onSuccess,
}: UseEmployeeFormOptions) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!initialEmployee;

  const getInitialValues = (): EmployeeFormValues => {
    if (!initialEmployee) {
      return {
        employeeType: 'cargo',
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        rfc: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        isAdmin: false,
        licenseNumber: '',
        licenseExpiration: null,
        gafetId: '',
      };
    }

    // TypeScript now recognizes optional properties safely!
    return {
      employeeType: initialEmployee.employeeType || 'cargo',
      firstName: initialEmployee.firstName || '',
      lastName: initialEmployee.lastName || '',
      dateOfBirth: initialEmployee.dateOfBirth ? new Date(initialEmployee.dateOfBirth) : null,
      rfc: initialEmployee.rfc || '',
      username: initialEmployee.username || '',
      email: initialEmployee.email || '',
      password: '',
      confirmPassword: '',
      isAdmin: initialEmployee.isAdmin || false,
      licenseNumber: initialEmployee.licenseNumber || '',
      licenseExpiration: initialEmployee.licenseExpiration ? new Date(initialEmployee.licenseExpiration) : null,
      gafetId: initialEmployee.gafetId || '',
    };
  };

  const form = useForm<EmployeeFormValues>({
    initialValues: getInitialValues(),
    validate: (values) => {
      const errors: Partial<Record<keyof EmployeeFormValues, string>> = {};

      if (!values.firstName.trim()) errors.firstName = 'Requerido';
      if (!values.lastName.trim()) errors.lastName = 'Requerido';
      if (!values.dateOfBirth) errors.dateOfBirth = 'Requerido';

      const rfc = values.rfc.trim().toUpperCase();
      if (!rfc) errors.rfc = 'Requerido';
      else if (!RFC_PATTERN.test(rfc)) errors.rfc = 'RFC con formato inválido';

      if (values.employeeType === 'cargo') {
        if (values.username.trim().length < 3) errors.username = 'Mínimo 3 caracteres';
        if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Correo inválido';

        // La contraseña solo es obligatoria al crear, o si el usuario decide escribir una nueva al editar
        if (!isEditing || values.password.length > 0) {
          if (values.password.length < 8) errors.password = 'Mínimo 8 caracteres';
          if (values.confirmPassword !== values.password) errors.confirmPassword = 'Las contraseñas no coinciden';
        }
      } else {
        if (!values.licenseNumber.trim()) errors.licenseNumber = 'Requerido';
        if (!values.licenseExpiration) {
          errors.licenseExpiration = 'Requerido';
        } else if (values.licenseExpiration <= new Date() && !isEditing) {
          errors.licenseExpiration = 'La licencia está vencida';
        }
      }

      return errors;
    },
  });

  /** Arma el payload que espera POST /employees/create según el tipo elegido. */
  const buildPayload = (values: EmployeeFormValues) => {
    const base = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      dateOfBirth: values.dateOfBirth ? toIsoDate(values.dateOfBirth) : undefined,
      rfc: values.rfc.trim().toUpperCase(),
      role: values.employeeType === 'operador' ? 'operator' : 'csr',
      employeeType: values.employeeType,
    }; if (values.employeeType === 'cargo') {
      const payload: any = {
        ...base,
        username: values.username.trim(),
        email: values.email.trim(),
        isAdmin: values.isAdmin,
      };
      // Solo manda contraseña si se está creando o si escribió una nueva al editar
      if (!isEditing || values.password) {
        payload.password = values.password;
      }
      return payload;
    }
    return {
      ...base,
      licenseNumber: values.licenseNumber.trim(),
      licenseExpiration: values.licenseExpiration ? toIsoDate(values.licenseExpiration) : undefined,
      gafetId: values.gafetId.trim() || undefined,
    };
  };
  const submit = async (): Promise<IEmployeeResponse | undefined> => {
    if (form.validate().hasErrors) return undefined;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = buildPayload(form.values);
      const result = await onSubmitAction(payload, initialEmployee?.id);
      if (result) onSuccess?.(result);
      return result;
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'No se pudo guardar la información del empleado'));
      return undefined;
    } finally {
      setSubmitting(false);
    }
  };
  return {
    form,
    submit,
    submitError,
    submitting, isEditing,
    clearSubmitError: () => setSubmitError(null),
    isOperator: form.values.employeeType === 'operador',
  } as const;
}

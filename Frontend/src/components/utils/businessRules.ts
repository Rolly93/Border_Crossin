export interface IValidateClientProps {
  onClientName?: string;
  onReferenceClient?: string;
  onTypeOperation?: string;
}
export interface ValidationResult {
  isValid: boolean;
  field?: 'cliente' | 'customer_tracking' | 'type_operation';
  error?: string;
}

export const ValidateClientReference = ({
  onClientName = '',
  onReferenceClient = '',
  onTypeOperation = '',
}: IValidateClientProps): ValidationResult => {
  const reference = String(onReferenceClient || '').trim().toLowerCase();
  const clientName = String(onClientName || '').trim().toLowerCase();
  const typeOperation = String(onTypeOperation || '').trim().toLowerCase();

  if (!clientName) return { isValid: false, field: 'cliente', error: 'Cliente es requerido' };
  if (!typeOperation) return { isValid: false, field: 'type_operation', error: 'Tipo de operación requerido' };
  if (!reference) return { isValid: false, field: 'customer_tracking', error: 'Referencia requerida' };

  if (clientName === 'expeditors') {
    if (typeOperation === 'importacion' && !reference.startsWith('12b')) {
      return { isValid: false, field: 'customer_tracking', error: 'Referencia de Expeditors debe empezar con "12B" para importaciones' };
    }

    if (typeOperation === 'exportacion' && !reference.startsWith('82b') && !reference.startsWith('92b')) {
      return { isValid: false, field: 'customer_tracking', error: 'Referencia de Expeditors debe empezar con "82B" o "92B" para exportación' };
    }

    if (reference.length !== 10) {
      return { isValid: false, field: 'customer_tracking', error: 'Referencia de Expeditors debe contener 10 caracteres' };
    }
  }

  return { isValid: true };
};
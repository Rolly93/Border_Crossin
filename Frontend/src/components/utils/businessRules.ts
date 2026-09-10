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

export interface RFCData {
  rfc: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}

export interface RFCValidationResult {
  isValid: boolean;
  expectedPrefix: string;
  errors: string[];
}

function getFirstInternalVowel(str: string) {
  const normalized = str.toUpperCase().trim();
  const vowels = ['A', 'E', 'I', 'O', 'U'];

  for (let i = 1; i < normalized.length; i++) {
    if (vowels.includes(normalized[i])) {
      return normalized[i]
    }
  }
  return "X"
}


function formatYYMMDD(date: Date): string {

  const year = date.getUTCFullYear().toString().slice(-2);
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
}

export function buildExpectedRFCPrefix(data: Omit<RFCData, 'rfc'>): { prefix: string; error?: string } {
  const trimmedLastName = data.lastName.trim();

  if (!trimmedLastName) {
    return { prefix: '', error: 'Last name is required.' };
  }
  const lastNameParts = trimmedLastName.split(/\s+/);
  if (lastNameParts.length > 2) {
    return {
      prefix: '',
      error: `Invalid last name: expected maximum 2 last names (paternal and maternal), but got ${lastNameParts.length}.`
    };
  }
  const paternal = lastNameParts[0].toUpperCase();
  const maternal = lastNameParts[1] ? lastNameParts[1].toUpperCase() : '';
  const firstName = data.firstName.toUpperCase().trim();
  const pos1 = paternal[0] || 'X';
  const pos2 = getFirstInternalVowel(paternal);
  const pos3 = maternal ? maternal[0] : 'X';
  const pos4 = firstName[0] || 'X';

  const nameCode = `${pos1}${pos2}${pos3}${pos4}`;
  const dateCode = formatYYMMDD(data.dateOfBirth);

  return { prefix: `${nameCode}${dateCode}` };
}

export function validateRFC(data: RFCData): RFCValidationResult {
  const errors: string[] = [];
  const cleanRFC = data.rfc.toUpperCase().trim();

  if (cleanRFC.length !== 13) {
    errors.push(`RFC must be exactly 13 characters long. Received: ${cleanRFC.length}`);
  }

  const rfcRegex = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/;
  if (!rfcRegex.test(cleanRFC)) {
    errors.push('RFC structural format is invalid (Pattern: 4 letters + 6 digits + 3 homoclave characters)');
  }

  const { prefix: expectedPrefix, error: nameError } = buildExpectedRFCPrefix(data);

  if (nameError) {
    errors.push(nameError);
  } else {
    const actualPrefix = cleanRFC.slice(0, 10);
    if (actualPrefix !== expectedPrefix) {
      errors.push(`RFC does not match provided identity data. Expected prefix: "${expectedPrefix}", got: "${actualPrefix}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    expectedPrefix: expectedPrefix || '',
    errors,
  };
}
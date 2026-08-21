declare module "validate-rfc" {
  export interface RfcValidationResult {
    isValid: boolean;
    rfc: string | null;
    type: "person" | "company" | "generic" | "foreign" | null;
    errors?: string[];
  }

  export interface RfcOptions {
    omitVerificationDigit?: boolean;
  }

  export function validateRfc(
    rfc: string,
    options?: RfcOptions
  ): RfcValidationResult;

  export default validateRfc;
}
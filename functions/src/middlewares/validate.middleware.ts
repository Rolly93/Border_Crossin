import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import validateRfc from "validate-rfc";

export interface RfcValidationResult {
  isValid: boolean;
  reason?: string;
  rfc?: string | null;
}

export const verifyCompanyRfc = (rfcInput: string): RfcValidationResult => {
  const cleanRfc = rfcInput?.trim().toUpperCase();

  if (!cleanRfc) {
    return {
      isValid: false,
      reason: "RFC field cannot be empty.",
    };
  }

  const validationResult = validateRfc(cleanRfc);

  if (!validationResult.isValid) {
    return {
      isValid: false,
      reason: validationResult.errors?.join(", ") ?? "INVALID_RFC",
    };
  }

  if (validationResult.type !== "company") {
    return {
      isValid: false,
      reason: "The provided RFC belongs to an individual (Persona Física), not a Company (Persona Moral).",
    };
  }

  return {
    isValid: true,
    rfc: validationResult.rfc,
  };
};

export const validate = (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  };
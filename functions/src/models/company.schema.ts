import { z } from "zod";

// Base inner schema for company fields
const baseCompanyBody = z.object({
  name: z.string().min(1, "Company name is required"),
  rfc: z.string().length(12, "RFC must be exactly 12 characters"),
  email: z.string().email("Invalid email address"),
});

// Input Schema (Request Body)
export const CreateCompanySchema = z.object({
  body: baseCompanyBody.strict(),
});

// Response Schema (Extends base body with backend fields)
export const CompanyResponseSchema = baseCompanyBody.extend({
  active: z.boolean(),
  maxUsers: z.number(),
});

// Inferred Types
export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>["body"];
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>;
import { z } from "zod";

const baseCompanyBody = z.object({
  name: z.string().min(1, "Company name is required"),
  rfc: z.string().length(12, "RFC must be exactly 12 characters"),
  scac: z.string().length(4, "SCAC must be exactly 4 characters"),
  maxUsers: z.number(),
  active: z.boolean(),
});

export const CreateCompanySchema = z.object({
  body: baseCompanyBody.omit({ maxUsers: true, active: true }).strict(),
});

export const CompanyResponseSchema = baseCompanyBody.extend({
  id: z.string(),
});

export const UpdateUserLimitSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Company ID is required"),
  }),
  body: z.object({
    updateUserLimit: z.number().min(1, "Limit must be at least 1"),
  }),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>["body"];
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>;
export type CompanyBase = z.infer<typeof baseCompanyBody>;
export type UpdateUserLimitInput = z.infer<typeof UpdateUserLimitSchema>;
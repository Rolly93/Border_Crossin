import { NextFunction, Request, Response } from "express";
import { CompanyService } from "../services/company.service";
import { CreateCompanyInput } from "../models/company.schema";
import { verifyCompanyRfc } from "../middlewares/validate.middleware";

const companyService = new CompanyService();

export class CompanyController {
  async register(req: Request<{}, {}, CreateCompanyInput>, res: Response, next: NextFunction) {
    try {
      const validRfc = await verifyCompanyRfc(req.body.rfc)

      if (!validRfc.isValid) return res.status(400).json({
        status: "fail",
        onmessage: validRfc.reason
      })

      const newCompany = await companyService.createCompany(req.body);
      return res.status(201).json({ status: "success", data: newCompany });
    } catch (error: any) {
      console.log("error")
      next(error)
    }
  }
}
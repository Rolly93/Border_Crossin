import { NextFunction, Request, Response } from "express";
import { CompanyService } from "../services/company.service";
import { CreateCompanyInput } from "../models/company.schema";

const companyService = new CompanyService();

export class CompanyController {
  async register(req: Request<{}, {}, CreateCompanyInput>, res: Response, next: NextFunction) {
    try {
      const newCompany = await companyService.createCompany(req.body);
      return res.status(201).json({ status: "success", data: newCompany });
    } catch (error: any) {
      console.log("error")
      next(error)
    }
  }
}
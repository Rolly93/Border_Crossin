import { NextFunction, Request, Response } from "express";
import { CompanyService } from "../services/company.service";
import { CreateCompanyInput, UpdateUserLimitInput } from "../models/company.schema";
import { verifyCompanyRfc } from "../middlewares/validate.middleware";



export class CompanyController {

  private companyService = new CompanyService();

  async deactivateCompany(
    req: Request,
    res: Response,
    next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.companyService.deleteCompany(id.toLocaleString())
      res.status(200).json({
        success: true,
        message: `Company deactivate successfully`
      })
    } catch (error) {
      next(error)
    }
  }
  async updateUserLimit(req: Request<UpdateUserLimitInput['params'], {}, UpdateUserLimitInput['body']>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { updateUserLimit } = req.body;
      const company = await this.companyService.updatedAmountUsers(id.toString(), updateUserLimit)
      res.status(200).json({
        success: true,
        data: company
      })
    } catch (error) {
      next(error)

    }
  }

  async register(req: Request<{}, {}, CreateCompanyInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const validRfc = verifyCompanyRfc(req.body.rfc)

      if (!validRfc.isValid) {
        res.status(400).json({
          success: false,
          message: validRfc.reason
        }
        )
        return
      }
      const newCompany = await this.companyService.createCompany(req.body);
      res.status(201).json({ success: true, data: newCompany });
    } catch (error: any) {
      console.log("error")
      next(error)


    }
  }
}

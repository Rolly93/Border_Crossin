import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import { validate } from "../middlewares/validate.middleware";
import { CreateCompanySchema } from "../models/company.schema";

const router = Router();
const controller = new CompanyController();

router.post("/register", validate(CreateCompanySchema), controller.register);

export default router;
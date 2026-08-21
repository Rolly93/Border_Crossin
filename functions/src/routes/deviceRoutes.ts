import { Router } from "express";
import { DeviceController } from "../controllers/device.controller";

const router = Router();
const controller = new DeviceController();

// POST /api/devices/verify
router.post("/verify", controller.verify);

export default router;
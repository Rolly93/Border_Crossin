import { Request, Response } from "express";
import * as admin from "firebase-admin";

export class DeviceController {
  private get db() {
    return admin.firestore();
  }

  /**
   * Verifies hardware device status against company seat limits
   */
  public verify = async (req: Request, res: Response): Promise<void> => {
    const { tenant_id, device_id } = req.body || {};

    if (!tenant_id || !device_id) {
      res.status(400).json({ error: "Missing tenant_id or device_id" });
      return;
    }

    try {
      const companyRef = this.db.collection("companies").doc(tenant_id);
      const doc = await companyRef.get();

      if (!doc.exists) {
        res.status(404).json({ error: "Company not found" });
        return;
      }

      const data = doc.data();

      if (!data?.active) {
        res.status(403).json({ authorized: false, error: "Account inactive" });
        return;
      }

      const maxUsers: number = data?.max_users || 5;
      const activeDevices: string[] = data?.active_devices || [];

      // 1. Device already verified
      if (activeDevices.includes(device_id)) {
        res.status(200).json({ authorized: true, message: "Device verified" });
        return;
      }

      // 2. Limit reached
      if (activeDevices.length >= maxUsers) {
        res.status(403).json({ authorized: false, error: "Seat limit reached" });
        return;
      }

      // 3. Register new hardware ID
      await companyRef.update({
        active_devices: admin.firestore.FieldValue.arrayUnion(device_id),
      });

      res.status(200).json({ authorized: true, message: "New device registered" });
    } catch (error) {
      console.error("DeviceController.verify error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
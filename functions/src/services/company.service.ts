import { AppError } from "../errors/AppError";
import { CompanyBase, CompanyResponse, CreateCompanyInput } from "../models/company.schema";
import * as admin from "firebase-admin";

export class CompanyService {
  private collection = admin.firestore().collection('companies');

  async createCompany(data: CreateCompanyInput): Promise<CompanyResponse> {
    const db = admin.firestore();

    const rfcLockRef = db.collection('unique_indexes').doc(`rfc_${data.rfc.toUpperCase()}`);
    const nameLockRef = db.collection('unique_indexes').doc(`name_${data.name.toLowerCase().trim()}`);
    const newCompanyRef = this.collection.doc();

    await db.runTransaction(async (transaction) => {
      const [rfcDoc, nameDoc] = await Promise.all([
        transaction.get(rfcLockRef),
        transaction.get(nameLockRef)
      ]);

      if (rfcDoc.exists || nameDoc.exists) {
        throw new AppError(409, "A company with provided data is already registered");
      }

      transaction.set(rfcLockRef, { companyId: newCompanyRef.id });
      transaction.set(nameLockRef, { companyId: newCompanyRef.id });

      transaction.set(newCompanyRef, {
        name: data.name,
        rfc: data.rfc,
        scac: data.scac,
        maxUsers: 5,
        active: true,
        currentUserCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    return {
      id: newCompanyRef.id,
      scac: data.scac,
      name: data.name,
      rfc: data.rfc,
      maxUsers: 5,
      active: true,
    };
  }

  async deleteCompany(id: string): Promise<void> {
    const docRef = this.collection.doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) throw new AppError(404, `Company with ID '${id}' not found`);

    await docRef.update({
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }

  async updatedAmountUsers(id: string, userAmount: number): Promise<CompanyResponse> {
    const docRef = this.collection.doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) throw new AppError(404, "Company does not exist");

    const company = snapshot.data();

    if (userAmount > company!.maxUsers) {
      throw new AppError(400, `User limit reached. Max allowed is ${company!.maxUsers}. Please contact system support.`);
    }

    await docRef.update({
      currentUserCount: userAmount,
      updatedAt: new Date().toISOString(),
    });

    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() } as CompanyResponse;
  }

  async getCompanyById(id: string): Promise<CompanyBase> {
    const docRef = this.collection.doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      throw new AppError(404, `Company with ID '${id}' not found`);
    }

    return snapshot.data() as CompanyBase;
  }

  async getAllCompanies() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
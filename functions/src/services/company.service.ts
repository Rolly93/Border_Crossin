import { db } from "../config/firebase";
import { AppError } from "../errors/AppError";
import { CompanyResponse, CreateCompanyInput } from "../models/company.schema";
import * as admin from "firebase-admin";
export class CompanyService {
  private collection = admin.firestore().collection('companies')

  /**
   * Creates a new company document in Firestore.
   */
  async createCompany(data: CreateCompanyInput): Promise<CompanyResponse> {
    await this.existRefCompany(data.rfc)
    const companyData = {
      ...data,
      maxUsers: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true
    }
    await this.collection.add(companyData)


    return {
      maxUsers: companyData.maxUsers,
      active: companyData.active,
      name: data.name,
      rfc: data.rfc,
      email: data.email
    };
  }

  async existRefCompany(rfc: string): Promise<void> {
    const snapshot = await this.collection.where('rfc', "==", rfc).limit(1).get()
    if (!snapshot.empty) {
      throw new AppError(409, "Company with RFC already exist")
    }

  }

  /**
   * Retrieves a company by its document ID.
   */
  async getCompanyById(id: string) {
    const docRef = this.collection.doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() };
  }

  /**
   * Retrieves all companies from the collection.
   */
  async getAllCompanies() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
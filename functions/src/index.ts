import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

import express from "express";

import companyRoutes from './routes/company.routes'

import deviceRoutes from "./routes/deviceRoutes";

admin.initializeApp();

const adminSecret = defineSecret("ADMIN_SECRET");

setGlobalOptions({ maxInstances: 5 });

const app = express();

app.use(express.json());

app.use("/companies", companyRoutes);
app.use("/devices", deviceRoutes);

export const api = onRequest({ secrets: [adminSecret] }, app);
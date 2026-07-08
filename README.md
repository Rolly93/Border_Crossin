# Xborder — Real-Time Cross-Border Shipment Tracker

🌐 **[Live Demo](https://border-crossin.onrender.com/)** | 📂 **[API Documentation](https://github.com/Rolly93/Border_Crossin/blob/main/Frontend/src/mocks/shipmentsMock.ts)**

![Status](https://img.shields.io/badge/Status-In%20Development-green?style=for-the-badge)
![Focus](https://img.shields.io/badge/Focus-Logistics%20%26%20Automation-orange?style=for-the-badge)

![Python Version](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![Docker](https://img.shields.io/badge/Docker-Planned-blueviolet?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-Planned-blueviolet?style=for-the-badge&logo=githubactions&logoColor=white)


Real-time logistics dashboard designed to monitor and automate cross-border shipment event states between Mexico (MEX) and the United States (USA). Built with a decoupled microservices architecture utilizing a high-performance Python backend and a modern type-safe frontend.

> 🛠️ **Status:** Active Development / Under Construction

## 🗺️ Project Roadmap & Current Progress

This project is being built in structured phases to ensure robust architecture and clean implementation.

- [x] **Phase 1: Core Logistics Processing Engine**
  - [x] Design FastAPI backend architecture.
  - [x] Establish SFTP incoming data channel processing logic.
  - [x] Implement XML parser for cross-border event matrices (AFS, CLR, etc.).
- [x] **Phase 2: Frontend Tracking Dashboard**
  - [x] Build type-safe React + TypeScript UI core.
  - [x] Integrate Mantine UI layout components for real-time data visibility.
- [ ] **Phase 3: DevOps & Containerization (Next Step)**
  - [ ] Containerize backend and frontend services using independent `Dockerfiles`.
  - [ ] Configure `docker-compose` for local multi-container orchestrations.
- [ ] **Phase 4: Automation Pipeline (CI/CD)**
  - [ ] Build GitHub Actions workflow for automated pipeline testing.
  - [ ] Set up automated builds to push production images to GitHub Container Registry (GHCR).

---

## 🚀 Tech Stack

* **Frontend:** React, TypeScript, Vite, Mantine UI
* **Backend:** Python, FastAPI, SQLAlchemy, Uvicorn, SFTP Processing
* **DevOps & Infrastructure:** Docker, GitHub Actions (CI/CD), GitHub Container Registry (GHCR)
---

## 📊 Logistics Event Tracking Matrix

The application processes real-time event updates transmitted via XML payloads through a secure SFTP pipeline.

| Event Code | Description | Format | Transmission Mode |
| :--- | :--- | :---: | :---: |
| **AFS** | Arrival at Origin Yard (Llegada) | XML | SFTP |
| **DPU** | Departure from Origin (Salida) | XML | SFTP |
| **EXR** | Mexican Customs Inspection (Inspección Aduana MX) | XML | SFTP |
| **ECC** | Mexican Customs Clearance (Modulación Aduana MX) | XML | SFTP |
| **ILR** | US Customs Inspection (Inspección Aduana USA) | XML | SFTP |
| **CLR** | US Customs Clearance (Modulación Aduana USA) | XML | SFTP |
| **ST1** | Yard Diversion / Safekeeping (Desviación de Yarda / Resguardo) | XML | SFTP |
| **TSC** | Final Delivery (Entrega) | XML | SFTP |

---

## 📂 File Naming Convention

All outgoing transaction files must strictly match the following uppercase format structure:

``` 
SCAC_REFERENCIA_EVENTO_YYYYMMDDHHMMSS.xml
```

* **Example:** `GALA_92B1341866_CLR_20260305121126.xml`

---

## 📑 XML Schema Specification

### Elements and Attributes Matrix

| Parent Tag | Attribute / Element | Description |
| :--- | :--- | :--- |
| `<AvisoEventos />` | `ReferenciaExpd` | Expeditors reference tracking ID |
| | `TipoOperacion` | Operation Type code indicator |
| | `CodigoTransportista` | Standard Carrier Alpha Code (SCAC) |
| | `ReferenciaTransportista` | Transfer carrier tracking reference number |
| | `CodigoEvento` | Logistics Event Code (e.g., AFS, CLR) |
| | `FechaHoraEvento` | Timestamp in ISO 8601 format (`YYYY-MM-DDTHH:MM:SS`) |
| | `Comentarios` | Operational remarks or status descriptions |

###  Payload Template Structured Format

```xml
<AvisoEventos 
    ReferenciaExpd="REFERECIA_EXPEDITORS" 
    TipoOperacion="2" 
    CodigoTransportista="SCAC" 
    ReferenciaTransportista="NUMERO_SEGUIMIENTO_TRANSFER" 
    CodigoEvento="EVENTO" 
    FechaHoraEvento="YYYY-MM-DDTHH:MM:SS" 
    Comentarios="ESTATUS/RECIBE"
/>
```

### Production Example Payload
```xml
<AvisoEventos ReferenciaExpd="92B1319284" TipoOperacion="2" CodigoTransportista="GALA" ReferenciaTransportista="92B1319284" CodigoEvento="AFS" FechaHoraEvento="2025-10-30T18:05:00" Comentarios="Llegando a Patio Origen"/>
```

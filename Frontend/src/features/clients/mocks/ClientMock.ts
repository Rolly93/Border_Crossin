import { ICliente, ISftpConfiguration } from "@/features/clients/types/Cliente";

export let CLIENT: ICliente[] = [
    { id: 1, name: "Expeditors", telefono: "N/A", sftService: true, emailService: true, estatus: true, email: ["test@tes.com", "any@email.com"] },
    { id: 2, name: "Egoba", telefono: "+52 867 987-9874", sftService: false, emailService: true, estatus: true, email: ["just@onemail.com"] },
    { id: 3, name: "Transportes Castores", telefono: "+52 867 123-5871", sftService: true, emailService: false, estatus: true, email: null },
    { id: 4, name: "Logística Express Naredo", telefono: "+52 867 445-1200", sftService: true, emailService: true, estatus: true, email: ["contacto@lenaredo.com"] },
    { id: 5, name: "Transportes Tum", telefono: "+52 555 890-3341", sftService: false, emailService: true, estatus: false, email: ["soporte@tum.com.mx"] },
    { id: 6, name: "BNSF Logistics", telefono: "N/A", sftService: true, emailService: true, estatus: true, email: ["ops@bnsflogistics.com", "billing@bnsflogistics.com"] },
    { id: 7, name: "Schneider National", telefono: "+1 800 558-8700", sftService: true, emailService: false, estatus: true, email: null },
    { id: 8, name: "Flemak Transports", telefono: "+52 867 312-9988", sftService: false, emailService: false, estatus: true, email: null },
    { id: 9, name: "Grupo Traxión", telefono: "+52 555 012-3456", sftService: true, emailService: true, estatus: true, email: ["sistemas@traxion.global"] },
];

export let SftConfiguration: ISftpConfiguration[] = [
    { id: 1, idClient: 1, username: "expeditors_sftp", password: "P@sswordExp2026!", port: 22, host: "sftp.expeditors.com" },
    { id: 2, idClient: 3, username: "castores_usr", password: "Cas#867Secret123", port: 22, host: "sftp.castores.com.mx" },
    { id: 3, idClient: 4, username: "lenaredo_sftp", password: "LenaR3do$SecureKey", port: 2222, host: "transfer.lenaredo.com" },
    { id: 4, idClient: 6, username: "bnsf_partner", password: "BNSF_Logistics#2026", port: 22, host: "sftp.bnsflogistics.com" },
    { id: 5, idClient: 7, username: "schneider_edi", password: "Schne1der!Pass2026", port: 22, host: "edi-sftp.schneider.com" },
    { id: 6, idClient: 9, username: "traxion_sftp", password: "Trx!Key#992812", port: 22, host: "sftp.traxion.global" },
];
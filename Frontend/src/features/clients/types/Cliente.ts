import { SftpSendStatus } from "@/features/sftp/types/ISftpSend";

export interface ICliente {
    id: number;
    name: string;
    telefono: string;
    still_active: boolean;
    sftService: boolean;
    emailService: boolean;
    email?: string[] | null
}


export interface IClientCard {
    total: number;
    title: string;
    context: string;
}

export interface ISftpConfiguration {
    id?: number;
    idClient: number;
    username: string;
    password: string;
    port: number;
    host: string;
    root_folder?: string;
    remote_folder?: string;
}

export interface ISftpSend {
    id: number;
    filename: string;
    status: string;
    retries: number;
    sftp_log: string | null;
    sent_to: number;
    client_id: number;
    reference: string;
    shipment_event_id: number;
}

export interface ISftpSendFilters {
    client_id?: number;
    reference?: string;
    status?: SftpSendStatus;
}

export interface ResendRequest {
    send_ids: number[];
}

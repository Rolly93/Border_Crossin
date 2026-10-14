import { SftpSendStatus, ISftpSend, SftpSendFilters } from '@/features/sftp/types/ISftpSend';

export interface ICliente {
    id: number;
    name: string;
    telefono: string;
    still_active: boolean;
    sftService: boolean;
    emailService: boolean;
    email?: string[] | null;
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

// Re-export SFTP types from canonical location
export type { ISftpSend, SftpSendFilters, SftpSendStatus };

export interface ResendRequest {
    send_ids: number[];
}

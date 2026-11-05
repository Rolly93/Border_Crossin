import { SftpSendStatus, ISftpSend, SftpSendFilters } from '@/features/sftp/types/ISftpSend';


export interface IClientCard {
    total: number;
    title: string;
    context: string;
}

export interface ISftpConfiguration {
    id?: number;
    idClient: number;
    host: string;
    port: number;
    username: string;
    password: string;
    root_folder?: string;
    remote_folder?: string;
}

export type { ISftpSend, SftpSendFilters, SftpSendStatus };

export interface ResendRequest {
    send_ids: number[];
}

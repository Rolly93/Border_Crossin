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
    /** false = desactivada; guardarla la reactiva. */
    is_active?: boolean;
    /** Huella de la llave del servidor; null = falta "Probar conexión". */
    host_key_fingerprint?: string | null;
}

export type { ISftpSend, SftpSendFilters, SftpSendStatus };

export interface ResendRequest {
    send_ids: number[];
}


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
    host: string
}

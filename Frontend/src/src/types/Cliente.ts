
export interface ICliente{
    id:number;
    name:string;
    contacto:string;
    telefono:string;
    estatus:boolean;
    sftService:boolean;
    emailService:boolean;
    email?:string[]|null
}


export interface IClientCard{
    total:number;
    title:string;
    context:string;
}
import { ICliente } from "@/types/Cliente";

export let CLIENT:ICliente [] =[
    {
        id:1,
        name:"Expeditors",
        contacto:"Rolando Rios",
        telefono:'N/A',
        sftService:true,
        emailService:true,
        estatus:true,
        email:["test@tes.com" , 'any@email.com']

    },
        {
        id:2,
        name:"Egoba",
        contacto:"Carlos Fernando",
        telefono:'+52 867 987-9874',
        sftService:false,
        emailService:true,
        estatus:true,
        email:["just@onemail.com"]

    },
        {
        id:3,
        name:"any client",
        contacto:"Abraham de Jesus",
        telefono:'+52 867 123-5871',
        sftService:false,
        emailService:true,
        estatus:true,
        email:null
    }

]


import { ICliente, ISftpConfiguration } from "@/features/clients/types/Cliente";

export let CLIENT: ICliente[] = [
    {
        id: 1,
        name: "Expeditors",
        telefono: 'N/A',
        sftService: true,
        emailService: true,
        estatus: true,
        email: ["test@tes.com", 'any@email.com']

    },
    {
        id: 2,
        name: "Egoba",
        telefono: '+52 867 987-9874',
        sftService: false,
        emailService: true,
        estatus: true,
        email: ["just@onemail.com"]

    },
    {
        id: 3,
        name: "any client",
        telefono: '+52 867 123-5871',
        sftService: true,
        emailService: false,
        estatus: true,
        email: null
    }

]

export let SftConfiguration: ISftpConfiguration[] = [
    {
        id: 1,
        idClient: 1,
        username: 'sftp-username',
        password: 'pass-test',
        port: 22,
        host: 'domain@.org'

    },
    {
        id: 2,
        idClient: 3,
        username: 'sftp-ontheruser',
        password: 'this-is-a-test',
        port: 22,
        host: 'testing@.com'

    }
]
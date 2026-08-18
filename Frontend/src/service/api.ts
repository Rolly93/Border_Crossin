import axios, { AxiosInstance } from 'axios'


export const createApiClient = (ip: string): AxiosInstance => {
    const baseURL = import.meta.env.VITE_API_URL || `http://${ip}:8000/api`
    return axios.create({
        baseURL: baseURL,
        headers: { 'Content-Type': 'application/json', }
    },)
}

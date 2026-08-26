import axios, { AxiosInstance } from 'axios'

export const getBaseUrle = (ip: string) => import.meta.env.VITE_API_URL || `http://${ip}:8000/api`

export const createApiClient = (ip: string): AxiosInstance => {
    return axios.create({
        baseURL: getBaseUrle(ip),
        headers: { 'Content-Type': 'application/json', }
    },)
}

export const createEventSource = (ip: string, endpoint: string): EventSource => {
    const fullUrl = `${getBaseUrle(ip)}${endpoint}`
    return new EventSource(fullUrl)
}
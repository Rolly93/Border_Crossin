import axios, { AxiosInstance } from 'axios'

export const getBaseUrle = (ip: string) => import.meta.env.VITE_API_URL || `http://${ip}:8000`

export const createApiClient = (ip: string): AxiosInstance => {
    const client = axios.create({
        baseURL: getBaseUrle(ip),
        headers: { 'Content-Type': 'application/json', }
    },)

    client.interceptors.request.use((config) => {
        const token = localStorage.getItem('jwt_token');
        if (
            token &&
            token !== 'undefined' &&
            token !== 'null' &&
            token.trim() !== ''
        ) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config
    })

    return client

}




export const createEventSource = (ip: string, endpoint: string): EventSource => {
    const token = localStorage.getItem('jwt_token')

    const toeknQuery = token ? `?token=${encodeURIComponent(token)}` : ''
    const fullUrl = `${getBaseUrle(ip)}${endpoint}${toeknQuery}`
    return new EventSource(fullUrl)
}
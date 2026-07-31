import axios ,{ AxiosInstance } from 'axios'

export const getBaseUrl = (ip: string): string => `http://${ip}:8000`;

export const createApiClient= (ip:string):AxiosInstance => {
    return axios.create({
        baseURL:getBaseUrl(ip),
        headers:{ 'Content-Type': 'application/json',}
    },)}


export const createEventSource =(ip:string , endpoint :string): EventSource =>{
    const fullUrl =`${getBaseUrl(ip)}${endpoint}`
    return new EventSource(fullUrl)
}
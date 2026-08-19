import axios ,{ AxiosInstance } from 'axios'


export const createApiClient= (ip:string):AxiosInstance => {
    return axios.create({
        baseURL:`htt://${ip}:8000/api`,
        headers:{ 'Content-Type': 'application/json',}
    },)}



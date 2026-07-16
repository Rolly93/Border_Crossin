export abstract class BaseShipemntService {
    protected delay(ms:number):Promise<void>{
        return new Promise((resolve) => setTimeout(resolve,ms))
    }
}
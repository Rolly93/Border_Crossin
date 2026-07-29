import { createEventSource } from "../api";
import { INotificationStreamService, NotificationEvent } from "./INotificationStreamService";

export class ApiNotificationStreamService implements INotificationStreamService{
    private ip:string;

    constructor(ip:string){
        this.ip = ip;
    }
    subscribe(onMessage: (data: NotificationEvent) => void): () => void {
        const eventSource = createEventSource(this.ip , `/events/stream`);

        eventSource.onmessage = (event) =>{
            const data: NotificationEvent = JSON.parse(event.data);
            onMessage(data);
        }

        return ()=> eventSource.close();
    }
}
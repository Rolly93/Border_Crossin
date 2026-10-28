import { createEventSource } from "../../../service/api";
import { INotificationStreamService, NotificationEvent } from "./INotificationStreamService";

export class ApiNotificationStreamService implements INotificationStreamService {
    subscribe(onMessage: (data: NotificationEvent) => void): () => void {
        try {
            const eventSource = createEventSource(`/events/stream`);

            eventSource.onmessage = (event) => {
                const data: NotificationEvent = JSON.parse(event.data);
                onMessage(data);
            }

            return () => eventSource.close();



        } catch (error: any) {
            console.log(error);
            throw error.message
        }
    }
}
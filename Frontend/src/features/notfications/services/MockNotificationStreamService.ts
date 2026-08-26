import { INotificationStreamService, NotificationEvent } from "@/features/notfications/services/INotificationStreamService";

export class MockNotificationStreamService implements INotificationStreamService {

    private listeners: ((data: NotificationEvent) => void)[] = [];

    subscribe(onMessage: (data: NotificationEvent) => void): () => void {
        this.listeners.push(onMessage);
        console.log(this.listeners = this.listeners.filter((l) => l != onMessage))
        console.log('testing subscribe')
        return () => {
            this.listeners = this.listeners.filter((l) => l != onMessage)
        }
    }
    emitMockEvent(event: NotificationEvent): void {
        console.log('📣 [MOCK EMITER] Disparando evento. Suscriptores activos:', this.listeners.length);

        this.listeners.forEach((listener) => listener(event))
    }
}
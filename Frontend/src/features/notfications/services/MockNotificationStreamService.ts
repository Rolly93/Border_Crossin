import { INotificationStreamService, NotificationEvent } from "@/features/notfications/services/INotificationStreamService";

export class MockNotificationStreamService implements INotificationStreamService {
    private static instance: MockNotificationStreamService;
    private listeners: ((data: NotificationEvent) => void)[] = [];
    private constructor() {
    }

    public static getInstance(): MockNotificationStreamService {
        if (!MockNotificationStreamService.instance) {
            MockNotificationStreamService.instance = new MockNotificationStreamService();
        }
        return MockNotificationStreamService.instance;
    }

    subscribe(onMessage: (data: NotificationEvent) => void): () => void {
        this.listeners.push(onMessage);

        return () => {
            this.listeners = this.listeners.filter((l) => l !== onMessage);
        };
    }

    emitMockEvent(event: NotificationEvent): void {
        console.log(' [MOCK EMITER] Disparando evento. Suscriptores activos:', this.listeners.length);
        this.listeners.forEach((listener) => listener(event));
    }
}
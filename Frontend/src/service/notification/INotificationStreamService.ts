export interface NotificationEvent{
    shipment_id: number;
    status:'SUCCESS'|'FAILED'
    message:string
}

export interface INotificationStreamService{
subscribe(onMessage: (data: NotificationEvent) => void): () => void;
  emitMockEvent?(event: NotificationEvent): void;

}
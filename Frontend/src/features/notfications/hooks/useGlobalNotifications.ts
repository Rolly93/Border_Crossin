import { notificationsStreamService } from "@/features/notfications/services/NotificationService";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

export function useGlobalNotifications() {
    useEffect(() => {
        const unsubscribe = notificationsStreamService.subscribe((data) => {

            console.log('Evento recibido en React:', data);
            notifications.show({
                id: `sftp-${data.shipment_id}`,
                color: data.status === 'SUCCESS' ? 'green' : 'red',
                title: `Embarque #${data.shipment_id}`,
                message: data.message,
                autoClose: 2500,
            })
        })
        return () => { unsubscribe(); }

    }, [])
}
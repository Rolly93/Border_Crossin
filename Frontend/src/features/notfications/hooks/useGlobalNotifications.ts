import { useAuth } from "@/features/login/context/AuthContext";
import { notificationsStreamService } from "@/features/notfications/services/NotificationService";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

export function useGlobalNotifications() {
    const { token, isAuthenticated } = useAuth();

    // El stream se abre solo con sesión vigente y se cierra al cerrar sesión o
    // al expirar el token; con un nuevo login se abre otra vez.
    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        const unsubscribe = notificationsStreamService.subscribe((data) => {
            if (!data || !data.shipment_id || data.shipment_id === null) {
                return;
            }
            if (!data.message) { return; }

            notifications.show({
                id: `sftp-${data.shipment_id}`,
                color: data.status === 'SUCCESS' ? 'green' : 'red',
                title: `Embarque #${data.shipment_id}`,
                message: data.message,
                autoClose: 2500,
            })
        })
        return () => { unsubscribe(); }
    }, [isAuthenticated, token])
}

import { notificationsStreamService } from "@/service/NotificationService";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

export function useGlobalNotifications(){
    useEffect(()=>{
        console.log('1️⃣ [HOOK] Escuchando notificaciones...');
        const unsubscribe = notificationsStreamService.subscribe((data)=>{
            
    console.log('📡 Evento recibido en React:', data); 
    notifications.show({
        id:`sftp-${data.shipment_id}`,
        color:data.status ==='SUCCESS' ? 'green':'red',
        title: `Embarque #${data.shipment_id}`,
        message:data.message,
        autoClose:2500,
    })
    })
    return ()=> unsubscribe();

},[])
}
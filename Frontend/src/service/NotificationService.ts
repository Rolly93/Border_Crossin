import { ApiNotificationStreamService } from "./notification/ApiNotificationStreamService"
import { INotificationStreamService } from "./notification/INotificationStreamService"
import { MockNotificationStreamService } from "./notification/MockNotificationStreamService"

const ip = import.meta.env.VITE_API_URL||false
console.log(ip)
export const notificationsStreamService : INotificationStreamService = ip
? new ApiNotificationStreamService(ip) 
: new MockNotificationStreamService();
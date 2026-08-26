import { ApiNotificationStreamService } from "./ApiNotificationStreamService"
import { INotificationStreamService } from "./INotificationStreamService"
import { MockNotificationStreamService } from "./MockNotificationStreamService"

const ip = import.meta.env.VITE_API_URL || false
console.log(ip)
export const notificationsStreamService: INotificationStreamService = ip
  ? new ApiNotificationStreamService(ip)
  : new MockNotificationStreamService();
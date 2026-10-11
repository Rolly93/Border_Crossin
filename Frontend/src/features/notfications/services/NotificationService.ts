import { ApiNotificationStreamService } from "./ApiNotificationStreamService"
import { INotificationStreamService } from "./INotificationStreamService"

export const notificationsStreamService: INotificationStreamService =
  new ApiNotificationStreamService(import.meta.env.VITE_API_URL)

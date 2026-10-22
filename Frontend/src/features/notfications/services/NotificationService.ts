import { ApiNotificationStreamService } from "./ApiNotificationStreamService"
import { INotificationStreamService } from "./INotificationStreamService"

export const notificationsStreamService: INotificationStreamService =
  new ApiNotificationStreamService()

import ApiInstance from "@/constants/api-instance";
import { NOTIFICATIONS_ROUTE } from "./routes";

export const notificationsApi = {
  list: () => ApiInstance.get(NOTIFICATIONS_ROUTE.LIST),

  readOne: notificationId => ApiInstance.get(NOTIFICATIONS_ROUTE.READ_ONE(notificationId)),

  readAll: () => ApiInstance.get(NOTIFICATIONS_ROUTE.READ_ALL),

  deleteOne: notificationId => ApiInstance.delete(NOTIFICATIONS_ROUTE.DELETE_ONE(notificationId)),

  deleteAll: () => ApiInstance.delete(NOTIFICATIONS_ROUTE.DELETE_ALL),
};

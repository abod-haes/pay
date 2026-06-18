export const NOTIFICATIONS_ROUTE = {
  LIST: "/notifications",
  READ_ONE: notificationId => `/notifications/read/${notificationId}`,
  READ_ALL: "/notifications/read-all",
  DELETE_ALL: "/notifications/delete-all",
  DELETE_ONE: notificationId => `/notifications/${notificationId}`,
};

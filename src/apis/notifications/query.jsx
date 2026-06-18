import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "./api";

export const NotificationTypeEnum = {
  PATIENT: "patient",
  EXAMINATION: "examination",
  BOOKING: "booking",
};

export const notificationsKeys = {
  all: ["notifications"],
  lists: () => [...notificationsKeys.all, "list"],
};

const pickDateKey = item => {
  const raw = item?.date || item?.created_at || "";

  if (!raw) return "";
  if (raw.includes("T")) return raw.slice(0, 10);
  if (raw.includes(" ")) return raw.slice(0, 10);
  return raw;
};

const normalizeListPayload = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.data?.notifications)) return payload.data.notifications;
  return [];
};

const isGroup = item => item && Array.isArray(item.notifications);

export const normalizeNotificationsToGroups = payload => {
  const list = normalizeListPayload(payload);

  if (!list.length) return [];

  if (isGroup(list[0])) return list;

  const groupsMap = new Map();

  list.forEach(item => {
    const date = pickDateKey(item);
    const currentItems = groupsMap.get(date) || [];
    currentItems.push(item);
    groupsMap.set(date, currentItems);
  });

  return Array.from(groupsMap.entries()).map(([date, notifications]) => ({
    date,
    notifications,
  }));
};

const GetAllNotifications = () => {
  const queryResult = useQuery({
    queryKey: notificationsKeys.lists(),
    queryFn: async () => {
      const res = await notificationsApi.list();
      return normalizeNotificationsToGroups(res?.data);
    },
    refetchInterval: 60000,
  });

  return queryResult;
};

export const useNotificationsQueries = {
  GetAllNotifications,
};

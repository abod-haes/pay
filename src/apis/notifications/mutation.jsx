import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./api";
import { notificationsKeys } from "./query";

export const useReadNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationId => notificationsApi.readOne(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
    },
  });
};

export const useReadAllNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationId => notificationsApi.deleteOne(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
    },
  });
};

export const useDeleteAllNotificationsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
    },
  });
};

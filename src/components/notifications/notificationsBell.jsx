import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import notificationIcon from "@/assets/svgs/common/notification.svg";
import { useTranslation } from "@hooks/useTranslation";
import {
  NotificationTypeEnum,
  useNotificationsQueries,
} from "@/apis/notifications/query";
import {
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
} from "@/apis/notifications/mutation";

const getBaseLanguage = language => String(language || "ar").split("-")[0];

const labels = {
  ar: {
    title: "الإشعارات",
    loading: "جاري تحميل الإشعارات...",
    empty: "لا توجد إشعارات",
    readAll: "قراءة الكل",
    deleteAll: "حذف الكل",
    deleteOne: "حذف الإشعار",
    deleteConfirm: "هل تريد حذف هذا الإشعار؟",
    deleteAllConfirm: "هل تريد حذف جميع الإشعارات؟",
    patient: "مريض",
    examination: "معاينة",
    booking: "حجز",
    notification: "إشعار",
  },
  en: {
    title: "Notifications",
    loading: "Loading notifications...",
    empty: "No notifications",
    readAll: "Read all",
    deleteAll: "Delete all",
    deleteOne: "Delete notification",
    deleteConfirm: "Do you want to delete this notification?",
    deleteAllConfirm: "Do you want to delete all notifications?",
    patient: "Patient",
    examination: "Examination",
    booking: "Booking",
    notification: "Notification",
  },
  fa: {
    title: "اعلان‌ها",
    loading: "در حال بارگذاری اعلان‌ها...",
    empty: "اعلانی وجود ندارد",
    readAll: "خواندن همه",
    deleteAll: "حذف همه",
    deleteOne: "حذف اعلان",
    deleteConfirm: "آیا می‌خواهید این اعلان را حذف کنید؟",
    deleteAllConfirm: "آیا می‌خواهید همه اعلان‌ها را حذف کنید؟",
    patient: "بیمار",
    examination: "معاینه",
    booking: "رزرو",
    notification: "اعلان",
  },
};

const getTranslationResult = (t, value) => {
  if (!value) return "";
  const translated = t(value);
  return translated && translated !== value ? translated : value;
};

const getNotificationTypeLabel = (type, currentLabels) => {
  if (type === NotificationTypeEnum.PATIENT) return currentLabels.patient;
  if (type === NotificationTypeEnum.EXAMINATION) return currentLabels.examination;
  if (type === NotificationTypeEnum.BOOKING) return currentLabels.booking;
  return currentLabels.notification;
};

const normalizeDateValue = value => {
  if (!value) return "";
  if (String(value).includes(" ") && !String(value).includes("T")) {
    return String(value).replace(" ", "T");
  }
  return value;
};

const getNotificationDataId = item => {
  const data = item?.data || {};
  const patientId = data.patient_id || data.patient?.id || item.patient_id;
  const examinationId = data.examination_id || data.examination?.id || item.examination_id;
  const bookingId = data.booking_id || data.booking?.id || item.booking_id;

  if (item?.type === NotificationTypeEnum.PATIENT) return patientId || data.id || item.data_id;
  if (item?.type === NotificationTypeEnum.EXAMINATION) {
    return examinationId || data.id || item.data_id;
  }
  if (item?.type === NotificationTypeEnum.BOOKING) return bookingId || data.id || item.data_id;

  return data.id || patientId || examinationId || bookingId || item.data_id;
};

const getNotificationRoute = item => {
  const dataId = getNotificationDataId(item);

  if (item?.type === NotificationTypeEnum.PATIENT) {
    return dataId ? `/patient-details/${dataId}` : "/patient";
  }

  if (item?.type === NotificationTypeEnum.EXAMINATION) {
    return dataId ? `/examination/examination-details/${dataId}` : "/examination";
  }

  if (item?.type === NotificationTypeEnum.BOOKING) {
    return dataId ? `/booking/general-booking-details/${dataId}` : "/booking/reservation-patients";
  }

  return null;
};

const formatGroupDate = (value, language) => {
  if (!value) return "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (value, language) => {
  if (!value) return "";
  const date = new Date(normalizeDateValue(value));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationsBell({ unreadCount = 0 }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = getBaseLanguage(i18n.language);
  const currentLabels = labels[language] || labels.ar;

  const { data: notificationGroups = [], isLoading } = useNotificationsQueries.GetAllNotifications();
  const readOneMutation = useReadNotificationMutation();
  const readAllMutation = useReadAllNotificationsMutation();
  const deleteOneMutation = useDeleteNotificationMutation();
  const deleteAllMutation = useDeleteAllNotificationsMutation();

  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const notificationsCount = useMemo(
    () => notificationGroups.reduce((sum, group) => sum + (group.notifications || []).length, 0),
    [notificationGroups]
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = event => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleNotificationClick = item => {
    if (!item.read_at) {
      readOneMutation.mutate(item.id);
    }

    const route = getNotificationRoute(item);
    if (route) {
      setOpen(false);
      navigate(route);
    }
  };

  const handleDeleteOne = (event, item) => {
    event.stopPropagation();
    const confirmed = window.confirm(currentLabels.deleteConfirm);
    if (confirmed) {
      deleteOneMutation.mutate(item.id);
    }
  };

  const handleDeleteAll = () => {
    const confirmed = window.confirm(currentLabels.deleteAllConfirm);
    if (confirmed) {
      deleteAllMutation.mutate();
    }
  };

  const renderNotificationText = item => {
    const title = getTranslationResult(t, item.title);
    const body = getTranslationResult(t, item.body || item.message);
    const typeLabel = getNotificationTypeLabel(item.type, currentLabels);

    return {
      title: title && title !== item.title ? title : title || typeLabel,
      body: body || typeLabel,
      typeLabel,
    };
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="max-sm:w-[25px] max-sm:h-[25px] w-[48px] h-[48px] bg-gray-100 rounded-full flex justify-center items-center cursor-pointer transition hover:bg-gray-200"
        onClick={() => setOpen(prev => !prev)}
        aria-label={currentLabels.title}
      >
        <img
          src={notificationIcon}
          alt={currentLabels.title}
          className="w-[20px] h-[20px] max-sm:w-[15px] max-sm:h-[15px] object-contain"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-[58px] z-50 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[14px] border border-[#E9EEF3] bg-white shadow-xl ${
            language === "en" ? "right-0" : "left-0"
          }`}
          dir={language === "en" ? "ltr" : "rtl"}
        >
          <div className="flex items-center justify-between border-b border-[#EEF2F6] px-4 py-3">
            <h3 className="text-[0.9rem] font-bold text-[#333]">{currentLabels.title}</h3>
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                {unreadLabel}
              </span>
            )}
          </div>

          <div className="flex max-h-[340px] flex-col">
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-accent">
                  {currentLabels.loading}
                </div>
              ) : notificationsCount === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-accent">
                  <img src={notificationIcon} alt="" className="h-8 w-8 opacity-40" />
                  {currentLabels.empty}
                </div>
              ) : (
                <ul className="divide-y divide-[#EEF2F6]">
                  {notificationGroups.map((group, groupIndex) => (
                    <li key={`${group.date || "group"}-${groupIndex}`}>
                      {group.date && (
                        <div className="bg-[#F8FAFC] px-4 py-2 text-[0.72rem] font-semibold text-accent">
                          {formatGroupDate(group.date, i18n.language)}
                        </div>
                      )}
                      <ul className="divide-y divide-[#EEF2F6]">
                        {(group.notifications || []).map(item => {
                          const notificationText = renderNotificationText(item);

                          return (
                            <li key={item.id}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => handleNotificationClick(item)}
                                onKeyDown={event => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleNotificationClick(item);
                                  }
                                }}
                                className={`flex items-start gap-3 px-4 py-3 text-start transition hover:bg-[#F8FAFC] ${
                                  !item.read_at ? "bg-primary/5" : ""
                                }`}
                              >
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary">
                                      {notificationText.typeLabel}
                                    </span>
                                    {!item.read_at && (
                                      <span className="h-2 w-2 rounded-full bg-red-500" />
                                    )}
                                  </div>
                                  <p className="truncate text-[0.82rem] font-bold text-[#333]">
                                    {notificationText.title}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-[0.76rem] text-accent">
                                    {notificationText.body}
                                  </p>
                                  <p className="mt-1 text-[0.68rem] text-[#9AA3AF]">
                                    {formatDateTime(item.created_at || item.date, i18n.language)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="shrink-0 rounded-full p-1.5 text-[#9AA3AF] transition hover:bg-red-50 hover:text-red-500"
                                  aria-label={currentLabels.deleteOne}
                                  onClick={event => handleDeleteOne(event, item)}
                                >
                                  ×
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {notificationsCount > 0 && (
              <div className="sticky bottom-0 flex shrink-0 gap-2 border-t border-[#EEF2F6] bg-[#F8FAFC]/95 px-3 py-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center rounded-full border border-[#DDE5EC] bg-white px-3 py-2 text-[0.75rem] font-bold text-accent transition hover:bg-[#F1F5F9] disabled:opacity-50"
                  onClick={() => readAllMutation.mutate()}
                  disabled={readAllMutation.isPending}
                >
                  {currentLabels.readAll}
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[0.75rem] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  onClick={handleDeleteAll}
                  disabled={deleteAllMutation.isPending}
                >
                  {currentLabels.deleteAll}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

import SpecialSetting from "./specialSetting";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import Services from "./generalSetting/services";
import Planting from "./generalSetting/planting";
import ReminderSettings from "./reminderSettings";

const reminderTabLabels = {
  ar: "إعدادات التنبيهات",
  en: "Reminder settings",
  fa: "تنظیمات یادآوری‌ها",
};

export default function Setting() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("services");
  const tabs = [
    {
      id: "services",
      component: <Services />,
      translationKey: "setting.services",
    },
    {
      id: "planting",
      component: <Planting />,
      translationKey: "setting.planting",
    },
    {
      id: "reminders",
      component: <ReminderSettings />,
      label: reminderTabLabels[i18n.language] || reminderTabLabels.ar,
    },
    {
      id: "special",
      component: <SpecialSetting />,
      translationKey: "setting.special",
    },
  ];
  return (
    <div className="flex h-full flex-col">
      <BreadCrumb title={t("sidebar.setting")} isAdd={true} showArrow={false} />
      <div className="sticky top-20 left-0 right-0 z-[10] pb-2">
        <div className="inline-flex bg-[#F9F9F9] items-center gap-4 border border-accent rounded p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-8 py-2 rounded-md cursor-pointer text-[0.85rem] ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm font-main"
                  : "bg-gray-200 font-main"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label || t(tab.translationKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex-1 overflow-y-auto hide-scrollbar">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}

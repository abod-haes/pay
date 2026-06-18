import React, { useMemo, useState } from "react";
import { useTranslation } from "@hooks/useTranslation";
import { useLocation, useNavigate } from "react-router";
import Portal from "@/components/portal";
import logout from "@assets/svgs/common/logout.svg";
import { getPageTitle } from "@/utils/navigationHelpers";
import user from "@/assets/svgs/common/user.svg";
import menuIcon from "@/assets/svgs/common/menu.svg";
import { AuthApis } from "@/apis/auth/api";
import { handleBackendErrors } from "@/utils/helpers";
import global from "@assets/svgs/common/global.svg";
import NotificationsBell from "@/components/notifications/notificationsBell";
import { useNotificationsQueries } from "@/apis/notifications/query";

export default function Navbar({ isSidebarOpen, shouldShowSidebarToggle, setIsSidebarOpen }) {
  const { t, i18n } = useTranslation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: notificationGroups = [] } = useNotificationsQueries.GetAllNotifications();

  const unreadNotificationsCount = useMemo(
    () =>
      notificationGroups.reduce(
        (sum, group) => sum + (group.notifications || []).filter(item => !item.read_at).length,
        0
      ),
    [notificationGroups]
  );

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isLanguageDropdownOpen) {
      setIsLanguageDropdownOpen(false);
    }
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    if (isProfileDropdownOpen) {
      setIsProfileDropdownOpen(false);
    }
  };

  const changeLanguage = langCode => {
    i18n.changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };

  const handelLogout = async () => {
    try {
      await AuthApis.logout();
      localStorage.removeItem("authData");
      sessionStorage.removeItem("authData");
      localStorage.removeItem("is_admin");
      localStorage.removeItem("branch_id");
      sessionStorage.removeItem("is_admin");
      localStorage.removeItem("rememberedCredentials");
      localStorage.removeItem("fcm_token");
      navigate("/");
    } catch (error) {
      handleBackendErrors({ error });
    }
  };

  const dropdownItems = [
    // {
    //   icon: profile,
    //   text: t("common.account_info"),
    //   action: () => setIsProfileModalOpen(true),
    // },
    // {
    //   icon: lockA,
    //   text: t("common.change_password"),
    //   action: () => setChangePasswordModal(true),
    // },
    {
      icon: logout,
      text: t("common.logout"),
      action: handelLogout,
    },
  ];

  const hasBranc = localStorage.getItem("branch_id");

  const languages = [
    { code: "ar", name: t("عربي") },
    { code: "en", name: t("english") },
    { code: "fa", name: t("فارسي") },
  ];

  return (
    <div
      className={
        "bg-white border-y border-[#EFEFEF] sticky h-[70px] flex justify-between max-sm:gap-8 items-center px-6 max-sm:px-2 z-10 transition-all duration-300"
      }
    >
      {shouldShowSidebarToggle && (
        <button
          className="flex items-center justify-center w-[48px] h-[48px] bg-gray-100 rounded-full cursor-pointer lg:hidden me-2"
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Open sidebar menu"
        >
          <img src={menuIcon} alt="menu" className="w-[24px] h-[24px]" />
        </button>
      )}
      <div className="flex items-center text-[#000] line-height-[100%] text-[20px]">
        <p className="max-sm:text-[10px]">{t("common.dashboard")}/</p>
        <p className="max-sm:text-[10px]">{getPageTitle(location.pathname, t)}</p>
      </div>
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          {isProfileDropdownOpen && (
            <Portal>
              <div className="fixed inset-0 z-40" onClick={toggleProfileDropdown} />
              <div
                className={
                  "absolute left-2 bg-white left-0 shadow-lg rounded-md w-[200px] z-50 font-din-regular-xs"
                }
                style={{
                  top: "10%",
                }}
              >
                {dropdownItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      item.action();
                      setIsProfileDropdownOpen(false);
                    }}
                  >
                    <img src={item.icon} alt="" className="w-5 h-5 ms-2 me-2" />
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </Portal>
          )}
        </div>
        {hasBranc && (
          <button
            type="button"
            className="bg-primary text-white rounded-[6px] p-2 text-[16px] font-medium cursor-pointer"
            onClick={() => {
              localStorage.removeItem("branch_id");
              window.location.reload();
            }}
          >
            {t("branches.cancel")}
          </button>
        )}

        {/* Language Dropdown */}
        <div className="relative">
          <div
            className="max-sm:w-[25px]  max-sm:h-[25px] w-[48px] h-[48px]  bg-gray-100 rounded-full flex justify-center items-center cursor-pointer"
            onClick={toggleLanguageDropdown}
          >
            <img
              src={global}
              alt="language-toggle"
              className="w-[20px] h-[20px] max-sm:w-[15px] max-sm:h-[15px] object-contain"
            />
          </div>

          {isLanguageDropdownOpen && (
            <Portal>
              <div className="fixed inset-0 z-40" onClick={toggleLanguageDropdown} />
              <div
                className={`absolute bg-white shadow-lg rounded-md w-[150px] z-50  ${
                  i18n.language === "en" ? "right-8" : "left-8"
                }`}
                style={{
                  top: " 70px",
                }}
              >
                {languages.map(lang => (
                  <div
                    key={lang.code}
                    className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span className="text-sm text-gray-700">{lang.name}</span>
                    {i18n.language === lang.code && <span className="text-green-500">✓</span>}
                  </div>
                ))}
              </div>
            </Portal>
          )}
        </div>

        <NotificationsBell unreadCount={unreadNotificationsCount} />

        <div className="relative">
          <div
            className="max-sm:w-[25px]  max-sm:h-[25px] w-[48px] h-[48px]  bg-gray-100 rounded-full flex justify-center items-center cursor-pointer"
            onClick={toggleProfileDropdown}
          >
            <img
              src={user}
              alt="language-toggle"
              className="w-[20px] h-[20px] max-sm:w-[15px] max-sm:h-[15px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Backdrop for profile dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
}

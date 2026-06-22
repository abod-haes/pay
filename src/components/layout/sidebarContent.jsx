/* eslint-disable complexity */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { Tooltip } from "react-tooltip";
import home from "@assets/svgs/sidebar/home.svg";
import branches from "@assets/svgs/sidebar/branches.svg";
import permissions from "@assets/svgs/common/user.svg";
import logo from "@assets/svgs/common/logo.svg";
import arrowDown from "@assets/svgs/common/arrow-down.svg";
import money from "@assets/svgs/sidebar/money.svg";
import calendar from "@assets/svgs/sidebar/calendar.svg";
import folder from "@assets/svgs/sidebar/folder.svg";
import headphone from "@assets/svgs/sidebar/headphone.svg";
import clipBoard from "@assets/svgs/sidebar/clipboard.svg";
import shop from "@assets/svgs/sidebar/shop.svg";
import moneys from "@assets/svgs/sidebar/moneys.svg";
import maintenance from "@assets/svgs/sidebar/maintenance.svg";
import surgeriesBlack from "@assets/svgs/sidebar/surgeries-black.svg";
import users from "@assets/svgs/sidebar/user.svg";
import setting from "@assets/svgs/sidebar/setting.svg";
import doctors from "@assets/svgs/sidebar/doctors.svg";
import Reason from "@assets/svgs/sidebar/confused-confusion-icon.svg";
import { useSettingsQueries } from "@/apis/setting/query";

import "react-tooltip/dist/react-tooltip.css";
import "./sidebar.css";

import { hasPermissionFunction } from "@utils/helpers";
import { PERMISSION_GROUP } from "@/constants/constants";

const isTruthy = value => value === true || value === 1 || value === "1" || value === "true";

const getAuthData = () => {
  try {
    const authString = localStorage.getItem("authData") || sessionStorage.getItem("authData");
    return authString ? JSON.parse(authString) : null;
  } catch {
    return null;
  }
};

const isAuthBranchMain = () => {
  const authData = getAuthData();
  const branch = authData?.user?.branch || authData?.branch;

  return isTruthy(branch?.is_main ?? authData?.user?.branch_is_main ?? authData?.user?.is_main_branch);
};

export default function SidebarContent({ isCollapsed, setIsCollapsed, onClose, isMobile }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const domain = location.state?.domain || window.location.hostname;

  const { data } = useSettingsQueries.GetAll({ domain_name: domain });
  const toggleSection = sectionId => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const menuItems = [
    {
      id: "homepage",
      icon: home,
      title: t("sidebar.home"),
      link: "/homepage",
      type: "single",
      permission: { group: PERMISSION_GROUP.Dashboard, type: "index" },
    },
    {
      id: "booking",
      icon: home,
      title: t("sidebar.booking"),
      type: "expandable",
      children: [
        {
          title: t("sidebar.reservations"),
          link: "/booking/reservation-patients",
          permission: { group: PERMISSION_GROUP.Booking, type: "index" },
        },
        // {
        //   title: t("sidebar.patients-without-reservation"),
        //   link: "/booking/implanted-patients",
        //   permission: { group: PERMISSION_GROUP.Booking, type: "index" },
        // },
        {
          title: t("sidebar.implanted-patients"),
          link: "/booking/patients-without-reservation",
          permission: { group: PERMISSION_GROUP.Booking, type: "index" },
        },
      ],
    },
    {
      id: "examination",
      icon: surgeriesBlack,
      type: "single",
      title: t("sidebar.examination"),
      link: "/examination",
      permission: { group: PERMISSION_GROUP.Examination, type: "index" },
    },
    {
      id: "injections",
      icon: clipBoard,
      type: "single",
      title: t("sidebar.injections"),
      link: "/injections",
      permission: { group: PERMISSION_GROUP.Injection, type: "index" },
    },
    {
      id: "hairCare",
      icon: clipBoard,
      type: "single",
      title: t("sidebar.hair"),
      link: "/hair",
      permission: { group: PERMISSION_GROUP.HairCare, type: "index" },
    },
    {
      id: "surgeries",
      icon: surgeriesBlack,
      title: t("sidebar.surgeries"),
      type: "expandable",
      children: [
        {
          title: t("sidebar.operation-bookings"),
          link: "/surgeries/operation-bookings",
          permission: { group: PERMISSION_GROUP.HairTransplant, type: "index" },
        },
        {
          title: t("sidebar.canceled-operations"),
          link: "/surgeries/canceled-operations",
          permission: { group: PERMISSION_GROUP.HairTransplant, type: "index" },
        },
      ],
    },
    {
      id: "patient",
      icon: folder,
      type: "single",
      title: t("sidebar.patient"),
      link: "/patient",
      permission: { group: PERMISSION_GROUP.Patient, type: "index" },
    },
    {
      id: "complaints",
      icon: headphone,
      type: "single",
      title: t("sidebar.complaints"),
      link: "/complaints",
      permission: { group: PERMISSION_GROUP.Complaint, type: "index" },
    },
    {
      id: "maintenance",
      type: "single",
      title: t("sidebar.maintenance"),
      link: "/maintenance",
      icon: maintenance,
      permission: { group: PERMISSION_GROUP.Maintenance, type: "index" },
    },
    {
      id: "accounts",
      type: "expandable",
      icon: moneys,
      title: t("sidebar.accounts"),
      children: [
        {
          title: t("sidebar.cashier"),
          link: "/accounts/cashier",
          permission: { group: PERMISSION_GROUP.Cashier, type: "index" },
        },
        {
          title: t("sidebar.bills"),
          link: "/accounts/bills",
          permission: { group: PERMISSION_GROUP.Bill, type: "index" },
        },
        {
          title: t("sidebar.vouchers"),
          link: "/accounts/vouchers",
          permission: {
            group: [
              PERMISSION_GROUP.BOOKING_BOND,
              PERMISSION_GROUP.SALARY_BOND,
              PERMISSION_GROUP.FINANCIER_BOND,
              PERMISSION_GROUP.GENERAL_BOND,
              PERMISSION_GROUP.INVOICE_BOND,
            ],
            type: "index",
          },
        },
      ],
    },
    {
      id: "offers",
      type: "single",
      title: t("sidebar.offers"),
      link: "/offers",
      icon: money,
      permission: { group: PERMISSION_GROUP.Offers, type: "index" },
    },
    {
      id: "warehouse",
      icon: shop,
      type: "expandable",
      title: t("sidebar.warehouse"),
      children: [
        {
          title: t("sidebar.warehouses"),
          link: "/warehouse/warehouses",
          permission: { group: PERMISSION_GROUP.Warehouse, type: "index" },
        },
        {
          title: t("sidebar.items"),
          link: "/warehouse/items",
          permission: { group: PERMISSION_GROUP.Material, type: "index" },
        },
        {
          title: t("sidebar.vendors"),
          link: "/warehouse/vendors",
          permission: {
            group: PERMISSION_GROUP.Vendors,
            type: "index",
          },
        },
        {
          title: t("sidebar.package"),
          link: "/warehouse/package",
          permission: { group: PERMISSION_GROUP.Unit, type: "index" },
        },
      ],
    },
    {
      id: "delayed",
      icon: calendar,
      type: "single",
      title: t("sidebar.delayed"),
      link: "/delayed",
      permission: { group: PERMISSION_GROUP.Delayed, type: "index" },
    },
    {
      id: "branches",
      icon: branches,
      title: t("sidebar.branches"),
      link: "/branches",
      type: "single",
      showCondition: () => {
        const hasPermission = hasPermissionFunction({
          group: PERMISSION_GROUP.Branch,
          type: "index",
        });

        return isAuthBranchMain() && hasPermission;
      },
      permission: { group: PERMISSION_GROUP.Branch, type: "index" },
    },
    {
      id: "staff",
      icon: users,
      title: t("sidebar.staff"),
      type: "expandable",
      children: [
        {
          title: t("staff.admin"),
          link: "/staff/admin",
          permission: { group: PERMISSION_GROUP.Employee, type: "index" },
        },
        {
          title: t("staff.employees"),
          link: "/staff/employee",
          permission: { group: PERMISSION_GROUP.Employee, type: "index" },
        },
        {
          title: t("doctors.doctors"),
          link: "/staff/doctor",
          permission: { group: PERMISSION_GROUP.Employee, type: "index" },
        },

        {
          title: t("staff.Tunisian"),
          link: "/staff/tenchnician",
          permission: { group: PERMISSION_GROUP.Employee, type: "index" },
        },
        {
          title: t("physician-assistant.physician-assistants"),
          link: "/staff/physician-assistant",
          permission: { group: PERMISSION_GROUP.Employee, type: "index" },
        },
        {
          title: t("staff.bones"),
          link: "/staff/bonus",
          permission: { group: PERMISSION_GROUP.Reward, type: "index" },
        },
        {
          title: t("deduction.deduction"),
          link: "/staff/deduction",
          permission: { group: PERMISSION_GROUP.Punishment, type: "index" },
        },
        {
          title: t("sidebar.holiday"),
          link: "/staff/holiday",
          permission: { group: PERMISSION_GROUP.Holiday, type: "index" },
        },
        {
          id: "department",
          icon: home,
          title: t("sidebar.department"),
          link: "/staff/department",
          permission: { group: PERMISSION_GROUP.Department, type: "index" },
        },
        {
          id: "job-title",
          icon: home,
          title: t("sidebar.job-title"),
          link: "/staff/job-title",
          permission: { group: PERMISSION_GROUP.JobTitle, type: "index" },
        },
      ],
    },
    {
      id: "salary",
      icon: money,
      type: "single",
      title: t("sidebar.salary"),
      link: "/salary",
      permission: { group: PERMISSION_GROUP.Salary, type: "index" },
    },
    {
      id: "permissions",
      icon: permissions,
      title: t("sidebar.permissions"),
      link: "/permissions",
      type: "single",
      showCondition: () => {
        try {
          const authString = localStorage.getItem("authData");
          // eslint-disable-next-line curly
          if (!authString) return false;
          const authData = JSON.parse(authString);
          const isMain = authData?.user?.branch?.is_main;

          // تحقق من الصلاحية
          const hasPermission = hasPermissionFunction({
            group: PERMISSION_GROUP.Role,
            type: "index",
          });

          return hasPermission || isMain === true;
        } catch {
          return false;
        }
      },
      permission: { group: PERMISSION_GROUP.Role, type: "index" },
    },
    {
      id: "users",
      icon: permissions,
      title: t("sidebar.users"),
      link: "/users",
      type: "single",
      permission: { group: PERMISSION_GROUP.User, type: "index" },
    },
    {
      id: "sponsors",
      icon: permissions,
      title: t("sponsors.sponsors"),
      link: "/sponsors",
      type: "single",
      permission: { group: PERMISSION_GROUP.SPONSOR, type: "index" },
    },
    {
      id: "reasons_for_not_booking",
      icon: Reason,
      title: t("sidebar.reasons_for_not_booking"),
      link: "/reasons_for_not_booking",
      type: "single",
      permission: { group: PERMISSION_GROUP.REASON_FOR_NOT_BOOKING, type: "index" },
    },
    {
      id: "booking-status",
      icon: home,
      title: t("sidebar.booking-status"),
      link: "/booking-status",
      type: "single",
      permission: { group: PERMISSION_GROUP.BOOKING_STATUS, type: "index" },
    },
    {
      id: "setting",
      icon: setting,
      title: t("sidebar.setting"),
      link: "/setting",
      type: "single",
      permission: { group: PERMISSION_GROUP.Setting, type: "index" },
    },
  ];

  const isMenuItemActive = menuLink => {
    if (menuLink === "/homepage") {
      return location.pathname === menuLink;
    }
    return location.pathname.startsWith(menuLink);
  };

  // Check if any child of a parent is active
  const isParentActive = item => {
    if (item.type === "expandable" && item.children) {
      return item.children.some(child => isMenuItemActive(child.link));
    }
    return false;
  };

  const filterMenuByPermissions = items => {
    return items
      .map(item => {
        // أولاً، تحقق من showCondition إذا كانت موجودة
        if (typeof item.showCondition === "function" && !item.showCondition()) {
          return null;
        }

        if (item.type === "single") {
          // عنصر مفرد
          if (item.permission && hasPermissionFunction(item.permission)) {
            return item;
          } else if (!item.permission) {
            return item;
          }
          return null;
        } else if (item.type === "expandable" && item.children) {
          // عنصر أب
          const filteredChildren = item.children.filter(
            child =>
              // تحقق من permission
              (!child.permission || hasPermissionFunction(child.permission)) &&
              // تحقق من showCondition
              (typeof child.showCondition !== "function" || child.showCondition())
          );
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredMenu = filterMenuByPermissions(
    menuItems.filter(item => {
      if (typeof item.showCondition === "function") {
        return item.showCondition();
      }
      return true;
    })
  );

  return (
    <div
      className={`${
        isCollapsed ? "w-[100px]" : "w-[17%]"
      } sticky flex flex-none flex-col bg-white pt-[20px] transition-all duration-300 z-10 border-x border-[#EFEFEF] ${
        isMobile ? " fixed top-0 left-0 h-full w-[280px] z-30" : ""
      }`}
    >
      <div className="flex justify-center items-center !mb-2">
        {isCollapsed ? (
          <div className="logo-container w-[50px] h-[50px] rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">P</span>
          </div>
        ) : (
          <div className="logo-container flex items-center gap-4 px-2">
            <img src={!Array.isArray(data?.data?.image) ? data?.data?.image : logo} alt="logo" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 overflow-y-auto max-h-[75vh] scrollbar-hide hover:scrollbar-default">
        {filteredMenu?.map(item => {
          const isExpanded = expandedSections[item.id];
          const isActive = item.link && isMenuItemActive(item.link);
          const hasActiveChild = isParentActive(item);

          return (
            <div key={item.id} className="flex flex-col">
              {/* Main item */}
              {item.type === "single" ? (
                <Link
                  to={item.link}
                  className={`sidebar-item flex items-center justify-between h-[45px] px-3 rounded-lg cursor-pointer group text-decoration-none  ${
                    isActive ? "active" : ""
                  }`}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                  data-tooltip-id={`tooltip-${item.title}`}
                  data-tooltip-content={item.title}
                  data-tooltip-place="right"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isCollapsed ? "mx-auto" : ""}`}>
                      {/* <item.icon /> */}
                      <img src={item.icon} alt="icon" className="w-[20px] h-[20px]" />
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                  </div>
                </Link>
              ) : (
                <>
                  <div
                    className={`sidebar-item flex items-center justify-between h-[45px] px-3 rounded-lg cursor-pointer group ${
                      hasActiveChild ? "active" : ""
                    }`}
                    onClick={() => toggleSection(item.id)}
                    data-tooltip-id={`tooltip-${item.title}`}
                    data-tooltip-content={item.title}
                    data-tooltip-place="right"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${isCollapsed ? "mx-auto" : ""}`}>
                        <img src={item.icon} alt="icon" className="w-[20px] h-[20px]" />
                      </div>
                      {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                      <img
                        src={arrowDown}
                        alt="arrow"
                        className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </div>
                  {isExpanded && !isCollapsed && (
                    <div className="flex flex-col gap-1 mt-1 ps-8">
                      {item.children.map(child => {
                        const childActive = isMenuItemActive(child.link);
                        return (
                          <Link
                            key={child.link}
                            to={child.link}
                            className={`sidebar-subitem h-[36px] px-3 rounded-lg flex items-center text-sm text-decoration-none ${
                              childActive ? "active" : ""
                            }`}
                            onClick={() => {
                              if (isMobile && onClose) {
                                onClose();
                              }
                            }}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              {isCollapsed && <Tooltip id={`tooltip-${item.title}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

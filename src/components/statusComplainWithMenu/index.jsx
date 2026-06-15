/* eslint-disable indent */
/* eslint-disable curly */
import { useTranslation } from "react-i18next";
import React, { useState, useRef } from "react";
import LoadingElement from "../shared/loading";
import { ComplaintsStatus } from "@/constants/constants";
const statusColors = {
  waiting: "#F49A13",
  done: "#3B5A92",
  canceled: "#C3292C",
};

// eslint-disable-next-line complexity
const StatusComplainButtonWithMenu = ({ status, items = [], isSending, isSuperAdmin = false }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const statusObj = ComplaintsStatus[status] || {};
  const bg = statusColors[status] || "#F49A13";
  const text = statusObj.label ? t(statusObj.label) : status;

  // إغلاق القائمة عند الضغط خارجها
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (btnRef.current && !btnRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // eslint-disable-next-line no-unused-vars
  const filteredItems = React.useMemo(() => {
    if (!items) return [];

    let filtered = [];

    switch (status) {
      case "waiting": // في انتظار - يمكن تغييره إلى "done" أو "canceled"
        filtered = items.filter(
          item => !item.value.includes("waiting") && !item.value.includes("canceled")
        );
        break;
      case "canceled":
      case "done":
        filtered = [];
        break;
      default:
        filtered = items.filter(item => item.value !== status);
        break;
    }

    if (!isSuperAdmin) {
      filtered = filtered.filter(item => item.value !== "done");
    }

    return filtered;
  }, [items, status, isSuperAdmin]);

  return (
    <div style={{ display: "inline-block", position: "relative" }} ref={btnRef}>
      <div
        style={{
          background: bg,
          borderRadius: 4,
          color: "#fff",
          fontSize: "0.75rem",
          display: "flex",
          alignItems: "center",
          minWidth: 100,
          textAlign: "center",
          padding: 6,
          cursor: "pointer",
          gap: 8,
          justifyContent: "center",
        }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{}}>{text}</span>
        {isSending ? (
          <LoadingElement size={10} color="#fff" />
        ) : (
          status !== "done" &&
          status !== "canceled" && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
        )}
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: 4,
            minWidth: 100,
            zIndex: 100,
            width: "100%",
          }}
        >
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "8px 12px",
                fontSize: "0.75rem",
                cursor: "pointer",
                color: "#333",
              }}
              onClick={() => {
                setOpen(false);
                if (typeof item === "object" && typeof item.onClick === "function") {
                  item.onClick(item);
                }
              }}
            >
              {typeof item === "string" ? item : t(item.label)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusComplainButtonWithMenu;

import React, { useState, useRef, useMemo } from "react";
import LoadingElement from "../shared/loading";
import { hasStatusPermission } from "@/utils/helpers";
const StatusButtonWithMenu = ({
  status,
  items = [],
  onChangeId,
  isSending,
  disabled = false,
  isSuperAdmin = true,
  userPermissions,
}) => {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);

  const currentType = status?.type;
  const currentId = status?.id;
  const currentColor = status?.color ?? "#29b4c3";
  const currentName = status?.name;

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    let filtered = [];

    switch (currentType) {
      case "cancel":
      case "done":
      case "delayed":
        filtered = [];
        break;

      default:
        filtered = items
          .filter(_item => _item.id !== currentId)
          .filter(_item => hasStatusPermission(_item.id, userPermissions))
          .filter(_item => _item.is_default === false);
        break;
    }
    return filtered;
  }, [items, currentType, isSuperAdmin]);

  return (
    <div style={{ display: "inline-block", position: "relative" }} ref={btnRef}>
      <div
        style={{
          background: currentColor,
          borderRadius: 4,
          color: "#fff",
          fontSize: "0.75rem",
          display: "flex",
          alignItems: "center",
          minWidth: 100,
          justifyContent: "center",
          padding: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          gap: 8,
        }}
        onClick={() => !disabled && setOpen(v => !v)}
      >
        <span>{currentName}</span>
        {isSending ? (
          <LoadingElement size={10} color="#fff" />
        ) : (
          !["done", "cancel", "delayed"].includes(currentType) &&
          filteredItems?.length > 0 &&
          !disabled && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
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
            width: "100%",
            zIndex: 100,
          }}
        >
          {filteredItems.map(item => (
            <div
              key={item.id}
              style={{
                padding: "8px 12px",
                fontSize: "0.75rem",
                cursor: "pointer",
                color: "#333",
              }}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
                onChangeId?.(item.id);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusButtonWithMenu;

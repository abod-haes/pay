/* eslint-disable no-constant-binary-expression */
/* eslint-disable complexity */
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import Portal from "@/components/portal";
import dots from "@/assets/svgs/common/3 dots.svg";
import "./dropdownMenu.css";

const getContextualPrintLabel = label => {
  if (label !== "طباعة معلومات المريض") return label;

  const pathname = window.location.pathname;

  if (pathname.includes("/surgeries/operation-bookings")) {
    return "طباعة عملية";
  }

  if (pathname.includes("/booking/reservation-patients")) {
    return "طباعة حجز";
  }

  return label;
};

const DropdownMenu = ({
  items = [],
  className = "",
  triggerClassName = "",
  menuClassName = "",
  onItemClick,
  disabled = false,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // إغلاق عند النقر خارج
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // إغلاق بالـ Escape
  useEffect(() => {
    const handleEscape = event => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // حساب موضع الـ trigger
  const updateTriggerPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  // تحديث الموضع قبل العرض لتفادي "القفز"
  useLayoutEffect(() => {
    if (isOpen) {
      updateTriggerPosition();
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpward(spaceBelow < 200 && spaceAbove > spaceBelow);
      }
    }
  }, [isOpen]);

  const toggleMenu = () => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  };

  const handleItemClick = (item, index) => {
    if (item.disabled) return;
    item.onClick?.();
    onItemClick?.(item, index);
    setIsOpen(false);
  };

  // حساب مكان القائمة
  const getMenuPosition = () => {
    const { top, left, width, height } = triggerPosition;
    const offset = 4;

    if (openUpward) {
      return {
        top: top - offset,
        left,
        transform: "translateY(-100%)",
      };
    }
    return {
      top: top + height + offset,
      left,
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true); // true ليتم التقاط التمرير في أي عنصر
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // محتوى القائمة
  const menuContent = (
    <div
      ref={menuRef}
      className={`dropdown-menu ${menuClassName}`}
      style={getMenuPosition()}
      role="menu"
    >
      <div className="dropdown-menu-inner">
        {items.length === 0 ? (
          <div className="dropdown-menu-item disabled">لا توجد خيارات</div>
        ) : (
          items.map(
            (item, index) =>
              item.show !== false && (
                <div
                  key={index}
                  className={`dropdown-menu-item ${item.disabled ? "disabled" : ""} ${
                    item.className || ""
                  }`}
                  onClick={() => handleItemClick(item, index)}
                  role="menuitem"
                  tabIndex={item.disabled ? -1 : 0}
                >
                  {item.icon && <span className="dropdown-menu-item-icon">{item.icon}</span>}
                  <span className="dropdown-menu-item-text">{getContextualPrintLabel(item.label)}</span>
                </div>
              )
          )
        )}
      </div>
    </div>
  );

  return (
    <div className={`dropdown-menu-container ${className}`} style={{ position: "relative" }}>
      {/* trigger */}
      {items.some(item => item.show) && (
        <button
          ref={triggerRef}
          className={`dropdown-menu-trigger ${triggerClassName} ${disabled ? "disabled" : ""}`}
          onClick={toggleMenu}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {trigger ? (
            trigger
          ) : (
            <div className="dropdown-menu-dots">
              <img src={dots} alt="dots" />
            </div>
          )}
        </button>
      )}

      {/* القائمة */}
      {isOpen && (openUpward ? menuContent : <Portal>{menuContent}</Portal>)}
    </div>
  );
};

export default DropdownMenu;

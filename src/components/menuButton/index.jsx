/* eslint-disable complexity */
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import Portal from "@/components/portal";
import "../shared/dropdownMenu/dropdownMenu.css";
import PrimaryButton from "../shared/primaryButton";

const MenuButton = ({
  items = [],
  position = "bottom-left",
  className = "",
  menuClassName = "",
  onItemClick,
  disabled = false,
  text,
  customText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateTriggerPosition();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateTriggerPosition();
      }
    };
    if (isOpen) {
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (disabled) {
      return;
    }
    setIsOpen(prev => !prev);
  };

  const handleItemClick = (item, index) => {
    if (item.disabled) {
      return;
    }
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item, index);
    }
    setIsOpen(false);
  };

  const getMenuPosition = () => {
    const { top, left, width, height } = triggerPosition;
    const menuOffset = 4;
    switch (position) {
      case "top-left":
        return { top: top - menuOffset, left, transform: "translateY(-100%)" };
      case "top-right":
        return {
          top: top - menuOffset,
          left: left + width,
          transform: "translate(-100%, -100%)",
        };
      case "bottom-left":
        return { top: top + height + menuOffset, left };
      case "bottom-right":
        return {
          top: top + height + menuOffset,
          left: left + width,
          transform: "translateX(-100%)",
        };
      default:
        return { top: top + height + menuOffset, left };
    }
  };

  return (
    <div className={`dropdown-menu-container ${className}`}>
      {customText ? (
        <div
          ref={triggerRef}
          onClick={toggleMenu}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="cursor-pointer"
        >
          {customText}
        </div>
      ) : (
        <PrimaryButton
          text={text}
          otherStyle={""}
          ref={triggerRef}
          onClick={toggleMenu}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="true"
        />
      )}

      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            className={`dropdown-menu dropdown-menu--portal ${menuClassName}`}
            style={getMenuPosition()}
            role="menu"
          >
            <div className="dropdown-menu-inner">
              {items.length === 0 ? (
                <div className="dropdown-menu-item disabled">لا توجد خيارات</div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className={`dropdown-menu-item  !text-black !text-center font-semibold text-[12px] ${
                      item.disabled ? "disabled" : ""
                    } ${item.className || ""}`}
                    onClick={() => handleItemClick(item, index)}
                    role="menuitem"
                    tabIndex={item.disabled ? -1 : 0}
                  >
                    {item.icon && <span className="dropdown-menu-item-icon">{item.icon}</span>}
                    <span className="dropdown-menu-item-text">{item.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default MenuButton;

/* eslint-disable curly */
import React, { useRef, useState, useEffect } from "react";

export default function Tooltip({ title, description, children, customStyle }) {
  const parentRef = useRef(null);
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    visible: false,
    placeAbove: false,
  });

  const showTooltip = () => {
    if (parentRef.current && tooltipRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      const tooltipHeight = tooltipRef.current.offsetHeight;
      const margin = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top,
        placeAbove = false;
      if (spaceBelow < tooltipHeight + margin && spaceAbove >= tooltipHeight + margin) {
        // Place above
        top = rect.top - tooltipHeight - margin;
        placeAbove = true;
      } else {
        // Place below
        top = rect.bottom + margin;
        placeAbove = false;
      }
      setCoords({
        top,
        left: rect.left + rect.width / 2,
        visible: true,
        placeAbove,
      });
    }
  };

  const hideTooltip = () => {
    setCoords(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (!coords.visible) return;
    function handleScrollOrResize() {
      hideTooltip();
    }
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [coords.visible]);

  // Render tooltip hidden to measure its height before showing
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div
      className="relative cursor-pointer group inline-block"
      ref={parentRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {/* Render hidden tooltip for measurement */}
      {!coords.visible && ready && (
        <div
          ref={tooltipRef}
          className="fixed opacity-0 pointer-events-none z-[-1]"
          style={{ top: 0, left: 0 }}
        >
          {title && <div className="font-semibold mb-1">{title}</div>}
          {description && <div className="text-gray-300">{description}</div>}
        </div>
      )}
      {coords.visible && (
        <div
          ref={tooltipRef}
          className={`fixed z-10 opacity-100 scale-100 flex flex-col items-start p-3 bg-gray-900 text-white rounded-lg shadow-lg transition-all duration-300 text-sm max-w-[350px] min-w-[200px] pointer-events-none ${customStyle}`}
          style={{
            top: coords.top,
            left: coords.left,
            transform: "translateX(-50%)",
          }}
        >
          {title && <div className="font-semibold mb-1">{title}</div>}
          {description && <div className="text-accent">{description}</div>}
        </div>
      )}
    </div>
  );
}

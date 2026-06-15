import React from "react";

const CustomFlexButtons = ({
  buttons = [],
  containerClass = "",
  gap = "gap-2",
  justify = "justify-start",
  reverse = false,
}) => {
  const containerClasses = `${gap} ${justify} flex md:flex-row flex-col ${
    reverse ? "flex-row-reverse" : ""
  } ${containerClass}`;

  return (
    <div className={containerClasses}>
      {buttons.map((btn, idx) => {
        if (btn.show === false) return null; // لو show=false لا يظهر العنصر
        return <React.Fragment key={idx}>{btn.component}</React.Fragment>;
      })}
    </div>
  );
};

export default CustomFlexButtons;

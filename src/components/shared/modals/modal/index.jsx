import React from "react";
import useClickOutside from "@/hooks/useClickOutside";

const Modal = ({ open, overlayStyle, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 z-[50] w-screen h-screen flex items-center justify-center  ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out z-[20] bg-black ${
          open ? "opacity-60" : "opacity-0"
        } ${overlayStyle || ""} 
           
        `}
      />
      <div onClick={e => e.stopPropagation()} className="relative z-[100]">
        {children}
      </div>
    </div>
  );
};

export default Modal;

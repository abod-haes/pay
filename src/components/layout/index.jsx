import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import SidebarContent from "./sidebarContent";
import { Outlet } from "react-router-dom";

import { useWindowSize } from "@uidotdev/usehooks";

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { width } = useWindowSize();

  const [showNavbar] = useState(true);

  useEffect(() => {
    if (width > 1240) {
      setIsSidebarCollapsed(false);
      setIsSidebarOpen(true);
    } else if (width <= 1240 && width > 1024) {
      setIsSidebarCollapsed(true);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarCollapsed(true);
      setIsSidebarOpen(false);
    }
  }, [width]);

  useEffect(() => {});

  const shouldShowSidebarToggle = (width <= 1024 && showNavbar) || !showNavbar;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className={"flex"}>
        {/* Sidebar */}
        {(width > 1024 && showNavbar) || !showNavbar ? (
          <SidebarContent isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        ) : (
          isSidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-[rgba(0,0,0,0.4)] backdrop-blur-[4px] bg-opacity-30"
              onClick={() => setIsSidebarOpen(false)}
            >
              <div className="absolute top-0 h-full" onClick={e => e.stopPropagation()}>
                <SidebarContent
                  isCollapsed={false}
                  setIsCollapsed={setIsSidebarCollapsed}
                  onClose={() => setIsSidebarOpen(false)}
                  isMobile={true}
                />
              </div>
            </div>
          )
        )}

        <main className={"h-screen flex flex-col w-full"}>
          {/* Navbar */}
          {showNavbar && (
            <Navbar
              isSidebarOpen={isSidebarOpen}
              shouldShowSidebarToggle={shouldShowSidebarToggle}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}
          <div className="flex-1 h-full overflow-y-auto hide-scrollbar lg:px-6 pt-0 px-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/nav-user";

export const AppHeader: React.FC = () => {
  const { open } = useSidebar();
  return (
    <header
      style={{ width: open ? "calc(100% - 16rem)" : "calc(100% - 3rem)" }}
      className="fixed z-50 flex justify-between bg-white h-12 shrink-0 items-center gap-2 border-b transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </div>
      <div>
        <NavUser />
      </div>
    </header>
  );
};

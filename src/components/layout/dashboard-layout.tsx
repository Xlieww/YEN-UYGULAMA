"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger, // For desktop if needed, or use Header's one
} from "@/components/ui/sidebar";
import { NavigationLinks, SettingsLink } from "@/components/layout/navigation-links";
import { Header } from "@/components/layout/header";
import { Gauge } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <SidebarapsibleWrapper>
        {children}
      </SidebarapsibleWrapper>
    </SidebarProvider>
  );
}

// Helper component to enable collapsible sidebar functionality using shadcn/ui/sidebar
function SidebarapsibleWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Gauge className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">BizTrack</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex-grow">
          <NavigationLinks />
        </SidebarContent>
        <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
         <SidebarFooter className="p-2">
          <SettingsLink />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}


"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  QrCode,
  SendToBack,
  ListChecks
} from "lucide-react";

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/dashboard")) return "Genel Bakış";
  if (pathname.startsWith("/memberships")) return "Üyelik Yönetimi";
  if (pathname.startsWith("/employee-activity")) return "Personel Aktivite Takibi";
  if (pathname.startsWith("/leave-request")) return "İzin Talebi Oluştur";
  if (pathname.startsWith("/leave-approvals")) return "İzin Talepleri Yönetimi";
  if (pathname.startsWith("/qr/entry")) return "Giriş QR Tarama";
  if (pathname.startsWith("/qr/exit")) return "Çıkış QR Tarama";
  if (pathname.startsWith("/settings")) return "Ayarlar";
  return "BizTrack";
};

const getPageIcon = (pathname: string) => {
  if (pathname.startsWith("/dashboard")) return <LayoutDashboard className="h-6 w-6 mr-2" />;
  if (pathname.startsWith("/memberships")) return <Users className="h-6 w-6 mr-2" />;
  if (pathname.startsWith("/employee-activity")) return <ClipboardList className="h-6 w-6 mr-2" />;
  if (pathname.startsWith("/leave-request")) return <SendToBack className="h-6 w-6 mr-2" />;
  if (pathname.startsWith("/leave-approvals")) return <ListChecks className="h-6 w-6 mr-2" />;
  if (pathname.startsWith("/qr")) return <QrCode className="h-6 w-6 mr-2" />;
  if (pathname.startsWith("/settings")) return <Settings className="h-6 w-6 mr-2" />;
  return null;
}


export function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const pageIcon = getPageIcon(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center">
        {pageIcon}
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}

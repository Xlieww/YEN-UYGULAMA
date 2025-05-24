
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  QrCode,
  SendToBack, // For Leave Request Submission
  ListChecks, // For Leave Approvals (Admin)
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, PATRON_EMAIL } from "@/lib/mock-data"; // For admin check
import { useEffect, useState } from "react";


const navItemsBase = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/memberships", label: "Üyelik Yönetimi", icon: Users },
  { href: "/employee-activity", label: "Personel Aktivitesi", icon: ClipboardList },
  { href: "/leave-request", label: "İzin Talebi Oluştur", icon: SendToBack },
];

const adminNavItems = [
    { href: "/leave-approvals", label: "İzin Talepleri", icon: ListChecks },
];

const qrNavItems = [
  { href: "/qr/entry", label: "Giriş QR Tara", icon: QrCode },
  { href: "/qr/exit", label: "Çıkış QR Tara", icon: QrCode },
];

const settingsItem = { href: "/settings", label: "Ayarlar", icon: Settings };


export function NavigationLinks() {
  const pathname = usePathname();
  const [user, setUser] = useState<{email: string, name: string} | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const combinedNavItems = [
    ...navItemsBase,
    ...(user && user.email === PATRON_EMAIL ? adminNavItems : []),
    ...qrNavItems,
  ];


  return (
    <SidebarMenu>
      {combinedNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              tooltip={item.label}
              className={cn(
                "justify-start",
                (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <a> {/* <a> tag is required by SidebarMenuButton asChild with Link */}
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function SettingsLink() {
  const pathname = usePathname();
  return (
     <SidebarMenuItem>
        <Link href={settingsItem.href} passHref legacyBehavior>
          <SidebarMenuButton
            asChild
            isActive={pathname === settingsItem.href}
            tooltip={settingsItem.label}
             className={cn(
                "justify-start",
                pathname === settingsItem.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
          >
            <a>
              <settingsItem.icon className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">{settingsItem.label}</span>
            </a>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
  )
}

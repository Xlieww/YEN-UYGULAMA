import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // Here you would typically add authentication checks.
  // If not authenticated, redirect to /login.
  // For this example, we assume authentication is handled by reaching this layout.
  return <DashboardLayout>{children}</DashboardLayout>;
}

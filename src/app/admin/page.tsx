"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserRole } from "@/lib/userService";
import AdminUserManager from "@/components/AdminUserManager";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getUserRole(user.uid).then(setRole);
    }
  }, [user]);

  if (loading || !user || role === null) return <div>Yükleniyor...</div>;
  if (role !== "admin") return <div>Bu sayfaya erişim yetkiniz yok.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">Admin Paneli</h1>
      <div className="bg-card rounded-lg p-6 shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">İzin Talepleri</h2>
        <div className="text-muted-foreground mb-6">Burada izin taleplerini listeleyip yönetebilirsiniz. (Demo içerik)</div>
      </div>
      <AdminUserManager />
    </div>
  );
} 
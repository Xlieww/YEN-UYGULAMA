"use client";
import { useState } from "react";
import { registerUserWithRole } from "@/lib/userService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerUserWithRole(email, password, "admin");
      setSuccess("Admin hesabı başarıyla oluşturuldu!");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-sans">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-primary">Admin Hesabı Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block mb-1">E-posta</label>
              <input
                type="email"
                className="w-full border border-border rounded px-2 py-1 bg-background"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1">Şifre</label>
              <input
                type="password"
                className="w-full border border-border rounded px-2 py-1 bg-background"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Admin Hesabı Oluştur"}
            </Button>
            {success && <div className="text-green-600 mt-2">{success}</div>}
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
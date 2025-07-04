"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, saveEmployeeActivityToStorage } from "@/lib/mock-data";
import { QrCode, UserX, XCircle } from "lucide-react"; // XCircle for exit
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

export default function QRExitPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [qrCodeDataString, setQrCodeDataString] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'requires_login' | 'processing' | 'processed' | 'error'>('loading');
  const [userForDisplay, setUserForDisplay] = useState<{name: string, email: string} | null>(null);

  const processExit = useCallback(async (user: { name: string; email: string }) => {
    try {
      saveEmployeeActivityToStorage({
        employeeName: user.name, // Use full name
        employeeEmail: user.email,
        description: `${user.name} iş yerinden çıkış yaptı.`,
        eventType: "QR_EXIT",
      });

      toast({
        title: "Çıkış Başarılı",
        description: `${user.name}, çıkış kaydınız oluşturuldu. Yönlendiriliyorsunuz...`,
        className: "bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-800 dark:text-orange-200 dark:border-orange-700"
      });
      setStatus('processed');
      setTimeout(() => router.push("/employee-activity"), 1500); // Slight delay for toast visibility
    } catch (error) {
      console.error("Error recording exit automatically:", error);
      toast({
        variant: "destructive",
        title: "Çıkış Kaydedilemedi",
        description: "Otomatik çıkış kaydı sırasında bir hata oluştu.",
      });
      setStatus('error');
    }
  }, [toast, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setQrCodeDataString(origin + "/qr/exit");

      const user = getCurrentUser();
      // console.log("QR Exit Page - Current User:", user); // For debugging

      if (user && user.email && user.name) {
        setUserForDisplay(user);
        setStatus('processing');
        // processExit(user); // Automatic processing removed
      } else {
        // console.log("QR Exit Page - No user found, showing login prompt."); // For debugging
        setStatus('requires_login');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processExit]); // processExit is memoized

  if (status === 'requires_login') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardHeader className="items-center">
            <UserX className="h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl">Giriş Gerekli</CardTitle>
            <CardDescription>
              Bu QR kodunu kullanabilmek için lütfen uygulamaya bu cihaz/tarayıcı üzerinden giriş yapın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" passHref legacyBehavior>
              <Button className="w-full" asChild><a>Giriş Sayfasına Git</a></Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">QR kodunu taradıktan sonra bu ekrana geldiyseniz, önce giriş yapmanız gerekmektedir.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let statusMessageText = "QR Kodu Yükleniyor...";
  let icon = <QrCode className="h-16 w-16 text-destructive mb-4" />;

  if (status === 'processing' && userForDisplay) {
    statusMessageText = `Çıkış bilgisi alındı (${userForDisplay.name}), işlem yapılıyor...`;
  } else if (status === 'processed' && userForDisplay) {
    statusMessageText = `${userForDisplay.name}, çıkışınız başarıyla kaydedildi. Yönlendiriliyorsunuz...`;
    icon = <XCircle className="h-16 w-16 text-red-500 mb-4 animate-pulse" />;
  } else if (status === 'error') {
    statusMessageText = "Hata: Çıkış kaydedilemedi. Lütfen tekrar deneyin veya yöneticiye bildirin.";
  } else if (status === 'loading' && qrCodeDataString) {
    statusMessageText = "Çıkış bilgileriniz kontrol ediliyor...";
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader className="items-center">
          {icon}
          <CardTitle className="text-2xl">Çıkış QR Kodu</CardTitle>
          <CardDescription>
            {statusMessageText}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="bg-card p-4 rounded-lg shadow-inner">
            {qrCodeDataString ? (
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeDataString)}&size=250x250&qzone=1&bgcolor=transparent`}
                alt="Çıkış QR Kodu"
                width={250}
                height={250}
                data-ai-hint="qr code"
                className="rounded-md"
                priority
              />
            ) : (
              <div className="w-[250px] h-[250px] flex items-center justify-center bg-muted rounded-md" data-ai-hint="loading spinner">
                 <svg className="animate-spin h-10 w-10 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {(status === 'processing' || (status === 'loading' && userForDisplay)) && (
            <div className="flex items-center space-x-2 text-muted-foreground">
                <svg className="animate-spin h-5 w-5 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>İşleniyor... Lütfen bekleyin.</span>
            </div>
          )}
           {status === 'error' && (
             <Button onClick={() => typeof window !== 'undefined' && window.location.reload()} variant="outline">Sayfayı Yenile</Button>
           )}
           <p className="text-xs text-muted-foreground mt-2">Bu sayfayı iş yerinden çıkış yaparken telefonunuzla tarayın.</p>
        </CardContent>
      </Card>
    </div>
  );
}

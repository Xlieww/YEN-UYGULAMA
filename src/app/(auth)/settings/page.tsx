import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
          <CardDescription>Uygulama genel ayarlarını buradan yönetebilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">İşletme Adı</Label>
            <Input id="businessName" defaultValue="BizTrack Demo İşletmesi" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">İşletme Adresi</Label>
            <Input id="businessAddress" defaultValue="123 Demo Sokak, Örnek Şehir" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base">
                E-posta Bildirimleri
              </Label>
              <p className="text-sm text-muted-foreground">
                Önemli aktiviteler için e-posta bildirimleri alın.
              </p>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
           <Button>Ayarları Kaydet</Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Hesap Ayarları</CardTitle>
          <CardDescription>Kullanıcı hesap ayarlarınızı yönetin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
            <Input id="confirmPassword" type="password" />
          </div>
           <Button>Şifreyi Değiştir</Button>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Label is not used directly in the form, FormLabel is. Keep for consistency or remove if strictly not needed.
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Users, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  type Personnel, 
  getPersonnelListFromStorage, 
  addPersonnelToStorage, 
  removePersonnelFromStorage,
  type EmployeeActivity, // Keep type EmployeeActivity if used for casting or other types
  getEmployeeActivitiesFromStorage
} from "@/lib/mock-data";
import { parseISO } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { buttonVariants } from "@/components/ui/button";

const personnelFormSchema = z.object({
  name: z.string().min(2, { message: "Personel adı en az 2 karakter olmalıdır." }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
});
type PersonnelFormValues = z.infer<typeof personnelFormSchema>;

type PersonnelWithStatus = Personnel & {
  status: "Aktif (İş Yerinde)" | "Pasif (Dışarıda)" | "Bilinmiyor";
  lastActivityType?: "QR_ENTRY" | "QR_EXIT";
  lastActivityTimestamp?: string;
};

export default function DashboardPage() {
  const [personnelList, setPersonnelList] = useState<PersonnelWithStatus[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const fetchPersonnelAndActivities = () => {
    const personnel = getPersonnelListFromStorage();
    const activities = getEmployeeActivitiesFromStorage();

    const personnelWithStatus = personnel.map(p => {
      const pActivities = activities
        .filter(act => act.employeeEmail === p.email && (act.eventType === 'QR_ENTRY' || act.eventType === 'QR_EXIT'))
        .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
      
      let status: PersonnelWithStatus['status'] = "Bilinmiyor";
      let lastActivityType: PersonnelWithStatus['lastActivityType'];
      let lastActivityTimestamp: PersonnelWithStatus['lastActivityTimestamp'];

      if (pActivities.length > 0) {
        const latestActivity = pActivities[0];
        lastActivityType = latestActivity.eventType as 'QR_ENTRY' | 'QR_EXIT';
        lastActivityTimestamp = latestActivity.timestamp;
        if (latestActivity.eventType === 'QR_ENTRY') {
          status = "Aktif (İş Yerinde)";
        } else if (latestActivity.eventType === 'QR_EXIT') {
          status = "Pasif (Dışarıda)";
        }
      } else {
        status = "Pasif (Dışarıda)"; // No QR activity means they are likely out or never scanned
      }
      return { ...p, status, lastActivityType, lastActivityTimestamp };
    });
    setPersonnelList(personnelWithStatus);
  };

  useEffect(() => {
    fetchPersonnelAndActivities();
    // Listen for storage changes to auto-update if activities are changed in other tabs/components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'biztrack_personnel_list' || event.key === 'biztrack_employee_activities') {
        fetchPersonnelAndActivities();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddPersonnel = (data: PersonnelFormValues) => {
    const existingPersonnel = getPersonnelListFromStorage().find(p => p.email === data.email);
    if (existingPersonnel) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Bu e-posta adresi zaten kayıtlı.",
      });
      return;
    }
    
    addPersonnelToStorage(data);
    fetchPersonnelAndActivities(); // Re-fetch to update list and counts
    toast({
      title: "Başarılı",
      description: `${data.name} adlı personel eklendi.`,
    });
    setIsAddModalOpen(false);
    form.reset();
  };

  const handleDeletePersonnel = (personnelId: string, personnelName: string) => {
    removePersonnelFromStorage(personnelId);
    fetchPersonnelAndActivities(); // Re-fetch to update list and counts
    toast({
      title: "Başarılı",
      description: `${personnelName} adlı personel silindi.`,
      variant: "destructive"
    });
  };

  const activePersonnelCount = personnelList.filter(p => p.status === "Aktif (İş Yerinde)").length;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2 text-primary" />
              <CardTitle>Aktif Personel</CardTitle>
            </div>
            <div className="text-2xl font-bold">{activePersonnelCount} / {personnelList.length}</div>
          </div>
          <CardDescription>Şu anda iş yerinde bulunan personel sayısı.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Personel Yönetimi</CardTitle>
              <CardDescription>
                Personelleri görüntüleyin, ekleyin veya silin. Durumları en son QR hareketine göre belirlenir.
              </CardDescription>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Personel Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Personel Ekle</DialogTitle>
                  <DialogDescription>
                    Yeni personel için gerekli bilgileri girin.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddPersonnel)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Soyad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ahmet Yılmaz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ahmet@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        İptal
                      </Button>
                      <Button type="submit">Kaydet</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Aktivite</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnelList.length > 0 ? (
                personnelList.map((personnel) => (
                  <TableRow key={personnel.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{personnel.name}</TableCell>
                    <TableCell>{personnel.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={personnel.status === "Aktif (İş Yerinde)" ? "default" : "secondary"}
                        className={
                          personnel.status === "Aktif (İş Yerinde)"
                            ? "bg-green-500/20 text-green-700 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                        }
                      >
                        {personnel.status === "Aktif (İş Yerinde)" ? 
                          <LogIn className="mr-1 h-3 w-3" /> : 
                          <LogOut className="mr-1 h-3 w-3" />
                        }
                        {personnel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {personnel.lastActivityTimestamp ? 
                        `${personnel.lastActivityType === 'QR_ENTRY' ? 'Giriş' : 'Çıkış'}: ${new Date(personnel.lastActivityTimestamp).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                        : 'Kayıt Yok'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Sil</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {personnel.name} adlı personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePersonnel(personnel.id, personnel.name)}
                              className={buttonVariants({ variant: "destructive" })}
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    Kayıtlı personel bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

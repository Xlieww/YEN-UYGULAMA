
"use client";

import { useState, type ChangeEvent, useEffect, useCallback } from "react";
import { 
  getEmployeeActivitiesFromStorage, 
  type EmployeeActivity, 
  getPersonnelListFromStorage, // Changed from mockEmployees
  getCurrentUser
} from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Calendar as CalendarIcon, CheckCircle, XCircle, AlertTriangle, Zap, Download } from "lucide-react"; // PlusCircle removed, Download added
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, parseISO, isValid } from "date-fns";
import { tr } from 'date-fns/locale';

// Define a "patron" email. In a real app, this would be role-based.
const PATRON_EMAIL = "admin@biztrack.com"; // Example patron email

export default function EmployeeActivityPage() {
  const [allActivities, setAllActivities] = useState<EmployeeActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState<string>("all"); // Filter by email
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [personnelNames, setPersonnelNames] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{email: string, name: string} | null>(null);

  const fetchActivitiesAndPersonnel = useCallback(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    const activitiesFromStorage = getEmployeeActivitiesFromStorage();
    setAllActivities(activitiesFromStorage);

    const personnelList = getPersonnelListFromStorage();
    const uniqueNames = [...new Set(personnelList.map(p => p.name))].sort();
    setPersonnelNames(uniqueNames);

    // If current user is not a patron, pre-filter by their email and disable employee selector
    // For now, let's keep the filter open for all, as per revised plan to make this the patron view
    // if (user && user.email !== PATRON_EMAIL) {
    //   setSelectedEmployeeEmail(user.email);
    // }

  }, []);

  useEffect(() => {
    fetchActivitiesAndPersonnel();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'biztrack_employee_activities' || event.key === 'biztrack_personnel_list') {
        fetchActivitiesAndPersonnel();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchActivitiesAndPersonnel]);


  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleEmployeeFilter = (employeeName: string) => { // Filter by name, convert to email if needed or map emails
     if (employeeName === "all") {
        setSelectedEmployeeEmail("all");
     } else {
        const personnelList = getPersonnelListFromStorage();
        const selectedPerson = personnelList.find(p => p.name === employeeName);
        setSelectedEmployeeEmail(selectedPerson ? selectedPerson.email : "all");
     }
  };

  const filteredActivities = allActivities.filter(activity => {
    const activityDate = parseISO(activity.timestamp);
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm) || activity.employeeName.toLowerCase().includes(searchTerm);
    const matchesEmployee = selectedEmployeeEmail === "all" || activity.employeeEmail === selectedEmployeeEmail;
    
    let matchesDate = true;
    if (dateRange?.from && isValid(activityDate)) {
        matchesDate = activityDate >= dateRange.from;
        if (dateRange.to && matchesDate) {
            matchesDate = activityDate <= addDays(dateRange.to, 1); // Ensure end of day is included
        }
    } else if (dateRange?.from && !dateRange?.to && isValid(activityDate)) { // Only from date selected
        matchesDate = activityDate >= dateRange.from;
    }


    return matchesSearch && matchesEmployee && matchesDate;
  }).sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
  
  const getEventTypeDisplay = (activity: EmployeeActivity) => {
    switch (activity.eventType) {
      case "QR_ENTRY":
        return { text: "Giriş Yapıldı", variant: "bg-green-500/20 text-green-700 border-green-500/30", icon: <CheckCircle className="mr-1 h-3 w-3" /> };
      case "QR_EXIT":
        return { text: "Çıkış Yapıldı", variant: "bg-red-500/20 text-red-700 border-red-500/30", icon: <XCircle className="mr-1 h-3 w-3" /> };
      case "TASK":
        switch (activity.status) {
          case "completed": return { text: "Tamamlandı", variant: "bg-green-500/20 text-green-700 border-green-500/30", icon: <CheckCircle className="mr-1 h-3 w-3" /> };
          case "in_progress": return { text: "Devam Ediyor", variant: "bg-blue-500/20 text-blue-700 border-blue-500/30", icon: <Zap className="mr-1 h-3 w-3 animate-pulse" /> };
          case "started": return { text: "Başladı", variant: "bg-sky-500/20 text-sky-700 border-sky-500/30", icon: <Zap className="mr-1 h-3 w-3" /> };
          case "pending": return { text: "Beklemede", variant: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30", icon: <AlertTriangle className="mr-1 h-3 w-3" /> };
          default: return { text: "Bilinmiyor", variant: "secondary", icon: null };
        }
      default:
        return { text: String(activity.eventType), variant: "secondary", icon: null };
    }
  };

  const downloadCSV = () => {
    const headers = ["Zaman Damgası", "Personel Adı", "Personel E-posta", "Açıklama", "Etkinlik Türü", "Durum", "Süre"];
    const rows = filteredActivities.map(activity => [
      format(parseISO(activity.timestamp), "yyyy-MM-dd HH:mm:ss", { locale: tr }),
      activity.employeeName,
      activity.employeeEmail,
      activity.description,
      activity.eventType,
      activity.status || "",
      activity.duration || ""
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `personel_aktiviteleri_${format(new Date(), "yyyyMMddHHmmss")}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle>Personel Aktivite Takibi</CardTitle>
                <CardDescription>
                  Tüm personellerin görevlerini, giriş ve çıkışlarını izleyin. Verileri CSV olarak indirin.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={downloadCSV}>
                <Download className="mr-2 h-4 w-4" />
                CSV İndir
            </Button>
        </div>
        <div className="mt-6 flex flex-col md:flex-row flex-wrap gap-4">
          <Input
            placeholder="Açıklama veya Personel Adı ile Ara..."
            value={searchTerm}
            onChange={handleSearch}
            className="md:max-w-xs"
          />
          <Select 
            value={personnelNames.find(name => getPersonnelListFromStorage().find(p=>p.name === name)?.email === selectedEmployeeEmail) || "all"} 
            onValueChange={handleEmployeeFilter}
            // disabled={currentUser && currentUser.email !== PATRON_EMAIL} // Example of disabling for non-patron
            >
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Personele Göre Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Personeller</SelectItem>
              {personnelNames.map(employeeName => (
                <SelectItem key={employeeName} value={employeeName}>{employeeName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full md:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "d MMM yyyy", { locale: tr })} -{" "}
                      {format(dateRange.to, "d MMM yyyy", { locale: tr })}
                    </>
                  ) : (
                    format(dateRange.from, "d MMM yyyy", { locale: tr })
                  )
                ) : (
                  <span>Tarih Aralığı Seç</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zaman Damgası</TableHead>
              <TableHead>Personel Adı</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Etkinlik Türü / Durum</TableHead>
              <TableHead>Süre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => {
                const displayInfo = getEventTypeDisplay(activity);
                return (
                  <TableRow key={activity.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>{isValid(parseISO(activity.timestamp)) ? format(parseISO(activity.timestamp), "dd.MM.yyyy HH:mm:ss", { locale: tr }) : activity.timestamp}</TableCell>
                    <TableCell className="font-medium">{activity.employeeName}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>
                      <Badge className={displayInfo.variant + " flex items-center"}>
                        {displayInfo.icon}
                        {displayInfo.text}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.duration || "-"}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Filtrelerle eşleşen aktivite bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

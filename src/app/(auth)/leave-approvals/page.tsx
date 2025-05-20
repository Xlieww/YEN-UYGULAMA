
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getLeaveRequestsFromStorage,
  type LeaveRequest,
  getCurrentUser,
  PATRON_EMAIL,
  updateLeaveRequestStatusInStorage,
} from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle, XCircle, Hourglass, ShieldAlert, ListChecks, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function LeaveApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLeaveRequests = useCallback(() => {
    setIsLoading(true);
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user && user.email === PATRON_EMAIL) {
      const requestsFromStorage = getLeaveRequestsFromStorage();
      // Ensure a new array reference for sorting and setting state
      // This helps React detect changes reliably.
      const sortedRequests = [...requestsFromStorage].sort((a, b) => 
        parseISO(b.submissionTimestamp).getTime() - parseISO(a.submissionTimestamp).getTime()
      );
      setLeaveRequests(sortedRequests);
    } else {
      setLeaveRequests([]); 
    }
    setIsLoading(false);
  }, []); // Empty dependency array: PATRON_EMAIL is a constant, getCurrentUser reads from localStorage

  useEffect(() => {
    fetchLeaveRequests();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'biztrack_leave_requests') {
        fetchLeaveRequests();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchLeaveRequests]);

  const handleUpdateRequestStatus = (requestId: string, newStatus: LeaveRequest['status']) => {
    const updatedRequest = updateLeaveRequestStatusInStorage(requestId, newStatus);
    if (updatedRequest) {
      // Re-fetch to ensure the list is up-to-date after an update
      fetchLeaveRequests(); 
      toast({
        title: "Talep Güncellendi",
        description: `${updatedRequest.employeeName} adlı personelin izin talebi ${newStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İzin talebi güncellenirken bir sorun oluştu.",
      });
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
            <Hourglass className="mr-1 h-3 w-3" /> Beklemede
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
            <CheckCircle className="mr-1 h-3 w-3" /> Onaylandı
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-700 border-red-500/30">
            <XCircle className="mr-1 h-3 w-3" /> Reddedildi
          </Badge>
        );
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">İzin talepleri yükleniyor...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.email !== PATRON_EMAIL) {
    return (
      <Card className="shadow-xl">
        <CardHeader className="items-center text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mb-3" />
          <CardTitle>Yetkisiz Erişim</CardTitle>
          <CardDescription>Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center">
            <ListChecks className="h-6 w-6 mr-2 text-primary" />
            <CardTitle>Personel İzin Talepleri</CardTitle>
        </div>
        <CardDescription>
          Personeller tarafından gönderilen izin taleplerini inceleyin ve yönetin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personel Adı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Başlangıç Tarihi</TableHead>
              <TableHead>Bitiş Tarihi</TableHead>
              <TableHead>Talep Tarihi</TableHead>
              <TableHead>İzin Sebebi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length > 0 ? (
              leaveRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{request.employeeName}</TableCell>
                  <TableCell>{request.employeeEmail}</TableCell>
                  <TableCell>{format(parseISO(request.startDate), "dd.MM.yyyy", { locale: tr })}</TableCell>
                  <TableCell>{format(parseISO(request.endDate), "dd.MM.yyyy", { locale: tr })}</TableCell>
                  <TableCell>{format(parseISO(request.submissionTimestamp), "dd.MM.yyyy HH:mm", { locale: tr })}</TableCell>
                  <TableCell className="max-w-xs truncate" title={request.reason}>{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">İşlemler</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Talebi Yönet</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleUpdateRequestStatus(request.id, "approved")}>
                            <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                            Onayla
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRequestStatus(request.id, "rejected")}>
                            <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                            Reddet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  Henüz gönderilmiş izin talebi bulunmamaktadır.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

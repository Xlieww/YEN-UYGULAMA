"use client";

import { useState, type ChangeEvent } from "react";
import { mockMemberships, type Membership } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit3, History, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function MembershipManagementPage() {
  const [members, setMembers] = useState<Membership[]>(mockMemberships);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Membership | null>(null);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm) ||
    member.memberId.toLowerCase().includes(searchTerm) ||
    member.email.toLowerCase().includes(searchTerm)
  );

  const handleEdit = (member: Membership) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMember(null); // For new member, no existing data
    setIsModalOpen(true);
  }

  const handleSaveMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedMemberData = {
      id: editingMember?.id || `mem${members.length + 1}`, // Generate new ID if new
      memberId: formData.get('memberId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as Membership['status'],
      joinDate: editingMember?.joinDate || new Date().toISOString().split('T')[0], // Keep original or set new
      lastVisit: editingMember?.lastVisit || new Date().toISOString().split('T')[0], // Keep original or set new
    };

    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...updatedMemberData } : m));
    } else {
      setMembers([...members, updatedMemberData]);
    }
    setIsModalOpen(false);
    setEditingMember(null);
  };
  
  const getStatusBadgeVariant = (status: Membership['status']) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-700 border-green-500/30";
      case "inactive": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "expired": return "bg-red-500/20 text-red-700 border-red-500/30";
      default: return "secondary";
    }
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Üyelik Yönetimi</CardTitle>
            <CardDescription>Mevcut üyeleri görüntüleyin, düzenleyin veya yeni üye ekleyin.</CardDescription>
          </div>
          <Button onClick={handleAddNew} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Üye Ekle
          </Button>
        </div>
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Üye Adı, ID veya E-posta ile Ara..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Üye ID</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Katılım Tarihi</TableHead>
              <TableHead>Son Ziyaret</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>{member.memberId}</TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(member.status)}>
                      {member.status === "active" && "Aktif"}
                      {member.status === "inactive" && "Pasif"}
                      {member.status === "expired" && "Süresi Dolmuş"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(member.joinDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{new Date(member.lastVisit).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(member)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="mr-2 h-4 w-4" />
                          Geçmişi Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          Üyeliği Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  Filtrelerle eşleşen üye bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Üye Bilgilerini Düzenle" : "Yeni Üye Ekle"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Üyenin bilgilerini güncelleyin." : "Yeni üye için gerekli bilgileri girin."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMember}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="memberId" className="text-right">
                  Üye ID
                </Label>
                <Input id="memberId" name="memberId" defaultValue={editingMember?.memberId || ""} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Ad Soyad
                </Label>
                <Input id="name" name="name" defaultValue={editingMember?.name || ""} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-posta
                </Label>
                <Input id="email" name="email" type="email" defaultValue={editingMember?.email || ""} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Durum
                </Label>
                <Select name="status" defaultValue={editingMember?.status || "active"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                    <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
              <Button type="submit">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </Card>
  );
}

import PersonelTable from "@/components/PersonelTable";

export default function PersonelGirisCikisPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4">
      <h1 className="text-2xl font-bold text-primary mb-6">Personel Giriş-Çıkış Tablosu</h1>
      <PersonelTable />
    </div>
  );
} 
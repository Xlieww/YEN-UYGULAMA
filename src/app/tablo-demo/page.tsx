import PersonelTable from "@/components/PersonelTable";
import AracFormuTable from "@/components/AracFormuTable";

export default function TabloDemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 space-y-12">
      <h1 className="text-3xl font-bold text-primary mb-4">Tablo Demo</h1>
      <PersonelTable />
      <AracFormuTable />
    </div>
  );
} 
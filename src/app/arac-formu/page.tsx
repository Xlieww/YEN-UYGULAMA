import AracFormuTable from "@/components/AracFormuTable";

export default function AracFormuPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4">
      <h1 className="text-2xl font-bold text-primary mb-6">Araç Formu Tablosu</h1>
      <AracFormuTable />
    </div>
  );
} 
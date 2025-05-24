"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Row = {
  tarih: string;
  cikisKm: string;
  cikisImza: string;
  girisKm: string;
  girisImza: string;
  yapilanKm: string;
  yakitAlimTutari: string;
};

export default function AracFormuTable() {
  const [rows, setRows] = useState<Row[]>([
    { tarih: "", cikisKm: "", cikisImza: "", girisKm: "", girisImza: "", yapilanKm: "", yakitAlimTutari: "" },
  ]);

  const handleChange = (i: number, field: keyof Row, value: string) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  const addRow = () =>
    setRows([
      ...rows,
      { tarih: "", cikisKm: "", cikisImza: "", girisKm: "", girisImza: "", yapilanKm: "", yakitAlimTutari: "" },
    ]);

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-primary">Araç Formu Tablosu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-border font-sans text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-3 py-2">Tarih</th>
                <th className="border border-border px-3 py-2">Çıkış KM</th>
                <th className="border border-border px-3 py-2">Çıkış İmza</th>
                <th className="border border-border px-3 py-2">Giriş KM</th>
                <th className="border border-border px-3 py-2">Giriş İmza</th>
                <th className="border border-border px-3 py-2">Yapılan KM</th>
                <th className="border border-border px-3 py-2">Yakıt Alım Tutarı</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-accent/30 transition">
                  {(["tarih", "cikisKm", "cikisImza", "girisKm", "girisImza", "yapilanKm", "yakitAlimTutari"] as (keyof Row)[]).map((field) => (
                    <td className="border border-border px-2 py-1" key={field}>
                      <input
                        className="w-full bg-transparent outline-none px-1 py-0.5"
                        value={row[field]}
                        onChange={(e) => handleChange(i, field, e.target.value)}
                        placeholder={field.includes("Imza") ? "İmza" : ""}
                        style={{ fontFamily: "var(--font-geist-sans)" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button className="mt-4" onClick={addRow} type="button">
          Satır Ekle
        </Button>
      </CardContent>
    </Card>
  );
} 
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Row = {
  ad: string;
  soyad: string;
  girisSaati: string;
  girisImza: string;
  cikisSaati: string;
  cikisImza: string;
};

export default function PersonelTable() {
  const [rows, setRows] = useState<Row[]>([
    { ad: "", soyad: "", girisSaati: "", girisImza: "", cikisSaati: "", cikisImza: "" },
  ]);

  const handleChange = (i: number, field: keyof Row, value: string) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  const addRow = () =>
    setRows([
      ...rows,
      { ad: "", soyad: "", girisSaati: "", girisImza: "", cikisSaati: "", cikisImza: "" },
    ]);

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-primary">Personel Giriş-Çıkış Tablosu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-border font-sans text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-3 py-2">Adı</th>
                <th className="border border-border px-3 py-2">Soyadı</th>
                <th className="border border-border px-3 py-2">Giriş Saati</th>
                <th className="border border-border px-3 py-2">Giriş İmza</th>
                <th className="border border-border px-3 py-2">Çıkış Saati</th>
                <th className="border border-border px-3 py-2">Çıkış İmza</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-accent/30 transition">
                  {(["ad", "soyad", "girisSaati", "girisImza", "cikisSaati", "cikisImza"] as (keyof Row)[]).map((field) => (
                    <td className="border border-border px-2 py-1" key={field}>
                      <input
                        className="w-full bg-transparent outline-none px-1 py-0.5"
                        value={row[field]}
                        onChange={(e) => handleChange(i, field, e.target.value)}
                        placeholder={field === "girisImza" || field === "cikisImza" ? "İmza" : ""}
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
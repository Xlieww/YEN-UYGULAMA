"use client";
import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { registerUserWithRole } from "@/lib/userService";
import { Button } from "@/components/ui/button";

const db = getFirestore(app);

export default function AdminUserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("personel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerUserWithRole(email, password, role);
      setSuccess("Kullanıcı başarıyla eklendi!");
      setEmail("");
      setPassword("");
      setRole("personel");
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    await fetchUsers();
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4 text-primary">Üye Ekle/Sil</h2>
      <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-2 mb-6">
        <input type="email" placeholder="E-posta" className="border border-border rounded px-2 py-1 bg-background" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Şifre" className="border border-border rounded px-2 py-1 bg-background" value={password} onChange={e => setPassword(e.target.value)} required />
        <select className="border border-border rounded px-2 py-1 bg-background" value={role} onChange={e => setRole(e.target.value)}>
          <option value="personel">Personel</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" disabled={loading}>{loading ? "Ekleniyor..." : "Ekle"}</Button>
      </form>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div>
        <h3 className="font-semibold mb-2">Kullanıcılar</h3>
        <ul>
          {users.map(user => (
            <li key={user.id} className="flex items-center justify-between border-b border-border py-1">
              <span>{user.email} ({user.role})</span>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>Sil</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 
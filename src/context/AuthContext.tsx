'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
// import { auth } from '@/lib/firebase'; // Firebase auth import edilebilir
// import { User } from 'firebase/auth'; // Firebase User tipi import edilebilir

// AuthContext'in tipi
interface AuthContextType {
  // user: User | null; // Firebase User tipi kullanılabilir
  user: any | null; // Şimdilik any kullanıldı, Firebase entegrasyonu ile güncellenecek
  loading: boolean;
  // login: (email, password) => Promise<void>; // Giriş fonksiyonu
  // logout: () => Promise<void>; // Çıkış fonksiyonu
  // signup: (email, password) => Promise<void>; // Kayıt fonksiyonu
}

// AuthContext oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthContext'i kullanmak için hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthContextProvider component'i
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null); // Şimdilik null, Firebase entegrasyonu ile güncellenecek
  const [loading, setLoading] = useState(true);

  // Firebase Auth state değişikliklerini dinlemek için useEffect kullanılabilir
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
  //     setUser(firebaseUser);
  //     setLoading(false);
  //   });
  //   return () => unsubscribe();
  // }, []);

  // Giriş, çıkış, kayıt fonksiyonları buraya eklenecek

  const value = {
    user,
    loading,
    // login,
    // logout,
    // signup,
  };

  if (loading) {
    // Yükleniyor durumu için bir şeyler gösterebilirsiniz
    return <div>Loading...</div>; // veya null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
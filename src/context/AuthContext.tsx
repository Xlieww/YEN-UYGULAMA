'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

// AuthContext'in tipi
interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
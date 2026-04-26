"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Shield, User, Key, ArrowRight, BookOpen, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Kichik harflarni kattaga aylantirib va bo'shliqlarni olib tashlab tekshiramiz
    const cleanId = userId.trim().toUpperCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      setIsLoading(false);

      // 1. DIREKTOR (ADMIN) TEKSHIRUVI
      if (cleanId.startsWith("ADMIN-")) {
        if (cleanId === "ADMIN-001" && cleanPass === "director2026") {
          router.push("/director/dashboard");
          return;
        } else {
          setError("Direktor ID yoki paroli noto'g'ri!");
          return;
        }
      }

      // 2. O'QITUVCHI TEKSHIRUVI
      else if (cleanId.startsWith("T-")) {
        if (cleanId === "T-1045" && cleanPass === "ustoz123") {
          router.push("/teacher/dashboard");
          return;
        } else {
          setError("O'qituvchi ID yoki paroli noto'g'ri!");
          return;
        }
      }

      // 3. O'QUVCHI TEKSHIRUVI
      else if (cleanId.startsWith("S-")) {
        if (cleanId === "S-8392" && cleanPass === "student123") {
          router.push("/student/dashboard"); // yoki /student/ranking ga, xohishingiz
          return;
        } else {
          setError("O'quvchi ID yoki paroli noto'g'ri!");
          return;
        }
      }

      // AGAR FORMAT UMUMAN BOSHQA BO'LSA
      else {
        setError("Noto'g'ri ID formati! (S-, T- yoki ADMIN- bilan boshlanishi kerak)");
      }
      
    }, 800); // Tizim tekshirayotganini ko'rsatish uchun 0.8 soniya kutamiz
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Orqa fondagi bezaklar */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Loti va Sarlavha */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-black tracking-widest text-slate-900 mb-1">ELITA</h1>
          <p className="text-slate-500 text-sm font-medium">Yagona raqamli ta'lim tizimi</p>
        </div>

        {/* Xatolik Xabari */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700 leading-tight">{error}</p>
          </div>
        )}

        {/* Kirish Formasi */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Foydalanuvchi ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ADMIN-001, T-1045 yoki S-8392"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 font-bold placeholder:font-medium placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Parol</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 font-bold placeholder:font-medium placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>Tizimga kirish <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        {/* Eslatmalar (Design uchun) */}
        <div className="mt-8 flex justify-center gap-6 border-t border-slate-100 pt-6">
          <div className="flex flex-col items-center justify-center opacity-50">
            <Shield className="w-5 h-5 text-purple-600 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Direktor</span>
          </div>
          <div className="flex flex-col items-center justify-center opacity-50">
            <BookOpen className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ustoz</span>
          </div>
          <div className="flex flex-col items-center justify-center opacity-50">
            <GraduationCap className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">O'quvchi</span>
          </div>
        </div>

      </div>
    </div>
  );
}

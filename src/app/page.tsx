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

    // Kiritilgan ID ni katta harflarga o'tkazib, bo'shliqlarni tozalaymiz
    const cleanId = userId.trim().toUpperCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      setIsLoading(false);

      // 1. DIREKTOR (ADMIN) TEKSHIRUVI
      if (cleanId.startsWith("ADMIN")) {
        if (cleanPass === "123456") {
          router.push("/director/dashboard");
        } else {
          setError("Direktor paroli noto'g'ri! (Parol: 123456 bo'lishi kerak)");
        }
      }

      // 2. O'QITUVCHI TEKSHIRUVI
      else if (cleanId.startsWith("T-")) {
        if (cleanPass === "123456") {
          router.push("/teacher/dashboard");
        } else {
          setError("O'qituvchi paroli noto'g'ri! (Parol: 123456 bo'lishi kerak)");
        }
      }

      // 3. O'QUVCHI TEKSHIRUVI
      else if (cleanId.startsWith("S-")) {
        if (cleanPass === "123456") {
          router.push("/student/dashboard");
        } else {
          setError("O'quvchi paroli noto'g'ri! (Parol: 123456 bo'lishi kerak)");
        }
      }

      // AGAR FORMAT BOSHQA BO'LSA
      else {
        setError("Noto'g'ri ID! Direktor uchun 'ADMIN', Ustoz uchun 'T-', O'quvchi uchun 'S-' bilan boshlang.");
      }
      
    }, 800); // 0.8 soniya kutish animatsiyasi
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
                placeholder="Masalan: ADMIN, T-1045, S-8392"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
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
                placeholder="Parolni kiriting"
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

        {/* Yo'riqnoma */}
        <div className="mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-slate-500 text-center mb-3 uppercase">Test uchun ma'lumotlar:</p>
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center"><Shield className="w-3 h-3 mr-1 text-purple-500"/> ADMIN</span>
            <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1 text-emerald-500"/> T-1045</span>
            <span className="flex items-center"><GraduationCap className="w-3 h-3 mr-1 text-blue-500"/> S-8392</span>
          </div>
          <p className="text-center text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 py-1 rounded-lg">Barchasi uchun parol: 123456</p>
        </div>

      </div>
    </div>
  );
}

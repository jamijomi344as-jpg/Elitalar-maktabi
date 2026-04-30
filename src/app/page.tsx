"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

export default function MainLogin() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // ✅ HYDRATION HIMOYASI
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setIsMounted(true); // Sahifa brauzerda ochilganini tasdiqlash
    const role = localStorage.getItem('user_role');
    if (role === 'director' || role === 'admin') router.push('/director/dashboard');
    else if (role === 'teacher') router.push('/teacher/dashboard');
    else if (role === 'student') router.push('/student/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) {
      setErrorMsg("Iltimos, ID va parolni to'liq kiriting.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id.toUpperCase().trim())
        .eq('password', password.trim())
        .single();

      if (error || !data) {
        setErrorMsg("ID yoki Parol noto'g'ri. Qaytadan urinib ko'ring.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem('user_id', data.id);
      localStorage.setItem('user_role', data.role);

      if (data.role === 'director' || data.role === 'admin') {
        router.push('/director/dashboard');
      } 
      else if (data.role === 'teacher') {
        localStorage.setItem('teacher_id', data.id);
        router.push('/teacher/dashboard');
      } 
      else if (data.role === 'student') {
        router.push('/student/dashboard');
      } 
      else {
        setErrorMsg("Sizning rolingiz tizimda aniqlanmadi.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("Tarmoqda xatolik yuz berdi. Internetni tekshiring.");
      setIsLoading(false);
    }
  };

  // ✅ Server va Client o'rtasida to'qnashuv bo'lmasligi uchun
  if (!isMounted) return null; 

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md z-10 border-4 border-white/10 relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl rotate-12 hover:rotate-0 transition-all duration-300">
             <ShieldCheck className="w-12 h-12"/>
           </div>
        </div>

        <div className="mt-12 mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ELITA META</h2>
          <p className="text-slate-500 font-medium mt-2">Tizimga kirish uchun identifikatsiya</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl font-bold text-sm flex items-center animate-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Shaxsiy ID Raqam</label>
            <input 
              type="text" 
              placeholder="DIR-1000 yoki T-XXXX" 
              className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-slate-100 focus:border-indigo-500 focus:bg-white font-black text-slate-800 text-lg uppercase transition-all shadow-inner" 
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Maxfiy Parol</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full p-5 bg-slate-50 rounded-2xl outline-none border-2 border-slate-100 focus:border-indigo-500 focus:bg-white font-black text-slate-800 text-lg pr-14 transition-all shadow-inner" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-2 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <button 
            disabled={isLoading} 
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 transition-all text-lg disabled:opacity-70 mt-4 flex items-center justify-center gap-3 active:scale-95"
          >
            {isLoading ? <><Loader2 className="w-6 h-6 animate-spin"/> TEKSHIRILMOQDA...</> : "TIZIMGA KIRISH"}
          </button>
        </form>
      </div>
    </div>
  );
}

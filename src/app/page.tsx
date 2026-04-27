"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // BAZADAN QIDIRAMIZ
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id.toUpperCase())
      .eq('password', password)
      .single();

    if (fetchError || !data) {
      setError("Foydalanuvchi ID yoki Parol noto'g'ri!");
      setIsLoading(false);
      return;
    }

    // ==========================================
    // MUVAFFAQIYATLI LOGIN - XOTIRAGA SAQLASH
    // ==========================================
    // Foydalanuvchining ID raqamini roliga qarab Local Storage'ga saqlaymiz:
    if (data.role === 'student') {
      localStorage.setItem('student_id', data.id);
    } else if (data.role === 'teacher') {
      localStorage.setItem('teacher_id', data.id);
    } else if (data.role === 'director' || data.role === 'admin') {
      localStorage.setItem('director_id', data.id);
    }

    // ROLIGA QARAB TEGISHLI SAHIFAGA YO'NALTIRAMIZ
    if (data.role === 'director' || data.role === 'admin') {
      router.push('/director/dashboard');
    } else if (data.role === 'teacher') {
      router.push('/teacher/dashboard');
    } else if (data.role === 'student') {
      router.push('/student/dashboard');
    } else {
      setError("Rol aniqlanmadi!");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic mb-2">ELITA</h1>
          <p className="text-slate-500 font-bold text-sm">Yagona raqamli ta'lim tizimi</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-black text-sm mb-2 ml-2">Foydalanuvchi ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Masalan: T-1234 yoki S-5678"
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-2xl outline-none font-black text-slate-900 uppercase transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-black text-sm mb-2 ml-2">Maxfiy Parol</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolingizni kiriting"
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-2xl outline-none font-black text-slate-900 pr-12 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Tizimga kirilmoqda..." : "Tizimga kirish →"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Calendar, Award, BookOpen, 
  Clock, LogOut, ShieldCheck, Star, Loader2 
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "timetable" | "homeworks">("boshqaruv");
  
  // ✅ XATONING OLDINI OLISH: Faqat Client-side da ishlashini kafolatlash
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const sId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');

    if (!sId || role !== 'student') {
      localStorage.clear();
      router.push('/');
      return;
    }

    fetchStudentData(sId);
  }, [router]);

  const fetchStudentData = async (sId: string) => {
    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', sId).single();
      
      if (error || !profile) {
         localStorage.clear();
         router.push('/');
         return;
      }

      setCurrentStudent(profile);

    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/'); 
  };

  // Agar Next.js ni asabi buzilsa, render qilmay turish
  if (!isMounted) return null;

  if (isLoading || !currentStudent) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans p-6">
        <div className="flex flex-col items-center">
           <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4 shadow-lg rounded-full" />
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">O'quvchi paneli ochilmoqda...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-blue-950 border-r border-blue-900 flex flex-col h-screen flex-shrink-0 z-20 text-blue-100 hidden md:flex p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
            {currentStudent.full_name?.charAt(0) || "S"}
          </div>
          <div>
            <h2 className="text-xl font-black text-white truncate w-40">{currentStudent.full_name}</h2>
            <p className="text-xs font-bold text-blue-400">O'quvchi • {currentStudent.class_name}</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy Panel
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'timetable' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3" /> Dars Jadvalim
          </button>
          <button onClick={() => setActiveMenu("homeworks")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'homeworks' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <BookOpen className="w-5 h-5 mr-3" /> Uy Vazifalari
          </button>
        </nav>
        
        <button onClick={handleLogout} className="w-full flex items-center justify-center p-4 rounded-2xl text-red-400 font-black hover:bg-red-500/10 mt-4 transition-all">
          <LogOut className="w-5 h-5 mr-2" /> Tizimdan Chiqish
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12 relative pb-24">
        
        {/* HEADER HERO */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-48 h-48" /></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {currentStudent.full_name}! 🚀</h1>
            <div className="flex gap-4 mt-6">
              <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-300" /> {currentStudent.class_name} sinfi
              </span>
              <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner">
                <Star className="w-4 h-4 mr-2" /> Balans: {currentStudent.pp_balance || 0} PP
              </span>
            </div>
          </div>
        </div>

        {/* DASHBOARD KONTENTI */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeMenu === "boshqaruv" && (
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200 text-center">
               <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
               <h3 className="text-xl font-bold text-slate-400">Tez orada bu yerda kunlik darslaringiz chiqadi!</h3>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

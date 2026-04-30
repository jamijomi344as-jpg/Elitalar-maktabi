"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Calendar, Award, BookOpen, 
  Clock, LogOut, ShieldCheck, Star, Loader2, AlertTriangle 
} from "lucide-react";

// ========================================================
// 🚨 XATO USHLAGICH (Qizil ekranni yo'q qiluvchi tizim)
// ========================================================
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, errorMsg: string}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error.message || "Noma'lum xatolik" };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-red-50 p-6">
           <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg text-center border-2 border-red-200">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-black text-red-700 mb-2">Tizimda xatolik yuz berdi!</h1>
              <div className="bg-slate-100 p-4 rounded-xl text-left text-sm font-mono text-slate-800 overflow-auto">
                {this.state.errorMsg}
              </div>
              <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Loginga qaytish</button>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ========================================================
// ASOSIY O'QUVCHI KONTENTI
// ========================================================
function StudentDashboardContent() {
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [activeMenu, setActiveMenu] = useState<string>("boshqaruv");

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const sId = localStorage.getItem('user_id');
        const role = localStorage.getItem('user_role');

        // Xavfsiz qaytarish (Router o'rniga window.location ishlatildi)
        if (!sId || role !== 'student') {
          localStorage.clear();
          window.location.href = '/'; 
          return;
        }

        const { data, error } = await supabase.from('profiles').select('*').eq('id', sId).single();
        
        if (error || !data) {
          localStorage.clear();
          window.location.href = '/';
          return;
        }

        setCurrentStudent(data);
      } catch (err) {
        console.error("Tarmoq xatosi:", err);
        window.location.href = '/';
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  // ✅ LOADING EKRANI
  if (isLoading || !currentStudent) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans p-6">
         <div className="flex flex-col items-center">
           <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4 shadow-lg rounded-full" />
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">O'quvchi paneli ochilmoqda...</h2>
         </div>
      </div>
    );
  }

  // ✅ XAVFSIZ O'ZGARUVCHILAR
  const fullName = currentStudent.full_name || "O'quvchi Noma'lum";
  const initial = fullName.charAt(0).toUpperCase() || "O";
  const firstName = fullName.split(" ")[0] || "O'quvchi";
  const className = currentStudent.class_name || "Sinf belgilanmagan";
  const ppBalance = currentStudent.pp_balance || 0;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-blue-950 border-r border-blue-900 flex flex-col h-screen flex-shrink-0 z-20 text-blue-100 hidden md:flex p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-black text-white truncate w-40">{fullName}</h2>
            <p className="text-xs font-bold text-blue-400">O'quvchi • {className}</p>
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
        
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-48 h-48" /></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {firstName}! 🚀</h1>
            <div className="flex gap-4 mt-6">
              <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-300" /> {className}
              </span>
              <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner">
                <Star className="w-4 h-4 mr-2" /> Balans: {ppBalance} PP
              </span>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeMenu === "boshqaruv" && (
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200 text-center">
               <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
               <h3 className="text-xl font-bold text-slate-400">Tez orada bu yerda kunlik darslaringiz chiqadi!</h3>
            </div>
          )}
          {activeMenu === "timetable" && (
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200 text-center">
               <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
               <h3 className="text-xl font-bold text-slate-400">Dars jadvali moduli o'rnatilmoqda...</h3>
            </div>
          )}
          {activeMenu === "homeworks" && (
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200 text-center">
               <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
               <h3 className="text-xl font-bold text-slate-400">Uy vazifalari moduli o'rnatilmoqda...</h3>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

// ASOSIY SAHIFA COMPONENTI (Xato ushlagichga o'ralgan)
export default function StudentDashboard() {
  return (
    <ErrorBoundary>
      <StudentDashboardContent />
    </ErrorBoundary>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, MessageCircle, Wallet, GraduationCap, 
  Trophy, Settings, LogOut, Calendar, BookOpen, 
  Loader2, AlertTriangle, ShieldCheck, Star
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
        <div className="flex h-screen items-center justify-center bg-slate-900 p-6">
           <div className="bg-slate-800 p-8 rounded-3xl shadow-xl max-w-lg text-center border-2 border-red-500/30">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-black text-red-400 mb-2">Tizimda xatolik yuz berdi!</h1>
              <div className="bg-slate-900 p-4 rounded-xl text-left text-sm font-mono text-slate-300 overflow-auto">
                {this.state.errorMsg}
              </div>
              <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all">Loginga qaytish</button>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ========================================================
// ASOSIY O'QUVCHI KONTENTI (Eski dizayn qaytarildi!)
// ========================================================
function StudentDashboardContent() {
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); 
  
  // Menyular holati
  const [activeMenu, setActiveMenu] = useState<string>("asosiy");
  
  // "Ta'lim" menyusining ichki tablari (Dars jadvali / Uy vazifasi)
  const [talimTab, setTalimTab] = useState<"jadval" | "vazifa">("jadval");

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const sId = localStorage.getItem('user_id');
        const role = localStorage.getItem('user_role');

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

  // YUKLANISH EKRANI
  if (isLoading || !currentStudent) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B1121] font-sans p-6">
         <div className="flex flex-col items-center">
           <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
           <h2 className="text-2xl font-black text-slate-200 tracking-tight">O'quvchi paneli ochilmoqda...</h2>
         </div>
      </div>
    );
  }

  // XAVFSIZ O'ZGARUVCHILAR
  const fullName = currentStudent.full_name || "O'quvchi";
  const firstName = fullName.split(" ")[0] || "O'quvchi";
  const className = currentStudent.class_name || "Sinf yo'q";
  const ppBalance = currentStudent.pp_balance || 0;

  // Sidebar tugmasi komponenti
  const MenuButton = ({ id, icon, label }: { id: string, icon: React.ReactNode, label: string }) => {
    const isActive = activeMenu === id;
    return (
      <button 
        onClick={() => setActiveMenu(id)} 
        className={`w-full flex items-center p-3.5 rounded-2xl font-bold transition-all ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`}
      >
        <span className="w-5 h-5 mr-3 flex items-center justify-center">{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      
      {/* SIDEBAR (Qora rang, eski dizayn) */}
      <aside className="w-64 bg-[#0B1121] border-r border-slate-800/50 flex flex-col h-screen flex-shrink-0 z-20 p-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">
            E
          </div>
          <span className="text-2xl font-black text-white tracking-widest">ELITA</span>
        </div>
        
        {/* MENYULAR */}
        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <MenuButton id="asosiy" icon={<LayoutDashboard />} label="Asosiy" />
          <MenuButton id="messenger" icon={<MessageCircle />} label="Messenger" />
          <MenuButton id="hamyon" icon={<Wallet />} label="Hamyon (PP)" />
          <MenuButton id="talim" icon={<GraduationCap />} label="Ta'lim" />
          <MenuButton id="reyting" icon={<Trophy />} label="Reyting" />
        </nav>
        
        {/* SOZLAMALAR VA CHIQISH */}
        <div className="mt-auto space-y-1 pt-4 border-t border-slate-800/50">
          <MenuButton id="sozlamalar" icon={<Settings />} label="Sozlamalar" />
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center p-3.5 rounded-2xl font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" /> Chiqish
          </button>
        </div>
      </aside>

      {/* ASOSIY CONTENT QISMI */}
      <main className="flex-1 h-full overflow-y-auto relative bg-[#0f172a]">
        
        {/* Yuqori qism (Sizning ismingiz va profilingiz chiroyli chiqadigan joy) */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0B1121]/50 backdrop-blur-md sticky top-0 z-10">
           <h1 className="text-xl font-black text-white capitalize">
             {activeMenu === 'talim' ? "Ta'lim bo'limi" : activeMenu}
           </h1>
           
           <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{fullName}</p>
                <p className="text-xs text-blue-400">{className} o'quvchisi</p>
             </div>
             <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-black shadow-md border-2 border-slate-800">
               {firstName.charAt(0).toUpperCase()}
             </div>
           </div>
        </header>

        <div className="p-8 lg:p-12 pb-24">
          
          {/* ASOSIY OYNA */}
          {activeMenu === "asosiy" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              {/* Eski rasmdagi ko'k "Salom" oynasi */}
              <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-10 text-white shadow-xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-48 h-48" /></div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {firstName}! 🚀</h1>
                  <div className="flex gap-4 mt-6">
                    <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-emerald-300" /> {className} SINF
                    </span>
                    <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner">
                      <Star className="w-4 h-4 mr-2" /> BALANS: {ppBalance} PP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TA'LIM BO'LIMI (Jadval va Vazifalar bitta joyda birlashtirildi) */}
          {activeMenu === "talim" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
               
               {/* Ichki Tablar */}
               <div className="flex bg-[#0B1121] p-1.5 rounded-2xl w-fit border border-slate-800/50">
                  <button 
                    onClick={() => setTalimTab("jadval")} 
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${talimTab === 'jadval' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Calendar className="w-4 h-4"/> Dars Jadvali
                  </button>
                  <button 
                    onClick={() => setTalimTab("vazifa")} 
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${talimTab === 'vazifa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <BookOpen className="w-4 h-4"/> Uy Vazifalari
                  </button>
               </div>

               {/* Tab Kontenti */}
               <div className="bg-[#0B1121] rounded-[2rem] border border-slate-800/50 p-10 min-h-[400px] flex items-center justify-center text-center">
                  {talimTab === "jadval" ? (
                     <div>
                        <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-slate-400">Dars jadvalingiz tez orada shu yerga yuklanadi!</h3>
                     </div>
                  ) : (
                     <div>
                        <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-slate-400">Uy vazifalaringiz tez orada shu yerga yuklanadi!</h3>
                     </div>
                  )}
               </div>
            </div>
          )}

          {/* MESSENGER BO'LIMI */}
          {activeMenu === "messenger" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-[#0B1121] rounded-[2rem] border border-slate-800/50 flex h-[600px] overflow-hidden">
               <div className="w-80 border-r border-slate-800/50 p-4">
                  <div className="bg-[#0f172a] rounded-xl p-3 flex items-center gap-2 text-slate-400 mb-4 border border-slate-800">
                     <MessageCircle className="w-4 h-4" />
                     <input type="text" placeholder="Qidiruv..." className="bg-transparent outline-none text-sm w-full" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 text-center mt-10">Hali chatlar yo'q.</p>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold">Yozishish uchun chatni tanlang</h3>
               </div>
            </div>
          )}

          {/* BOSHQA BO'LIMLAR UCHUN ZAXIRA */}
          {["hamyon", "reyting", "sozlamalar"].includes(activeMenu) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 bg-[#0B1121] rounded-[2rem] border border-slate-800/50 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-blue-500">
                  {activeMenu === 'hamyon' && <Wallet className="w-8 h-8" />}
                  {activeMenu === 'reyting' && <Trophy className="w-8 h-8" />}
                  {activeMenu === 'sozlamalar' && <Settings className="w-8 h-8" />}
               </div>
               <h3 className="text-xl font-bold text-slate-300 capitalize">{activeMenu} bo'limi tez orada ishga tushadi!</h3>
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

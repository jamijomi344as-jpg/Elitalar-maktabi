"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, MessageCircle, Wallet, GraduationCap, 
  Trophy, Settings, LogOut, Calendar, BookOpen, 
  Loader2, ShieldCheck, Star, Award, Search, Sun, Moon, Bell, Clock, Menu, CheckCircle2, AlertTriangle
} from "lucide-react";

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
        <div className="flex h-screen items-center justify-center bg-[#0f172a] p-6">
           <div className="bg-[#0B1121] p-8 rounded-3xl shadow-xl max-w-lg text-center border border-red-500/30">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-black text-red-400 mb-2">Tizimda xatolik yuz berdi!</h1>
              <div className="bg-[#0f172a] p-4 rounded-xl text-left text-sm font-mono text-slate-400 overflow-auto">
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

function StudentDashboardContent() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [loadError, setLoadError] = useState("");
  
  // TUGMALAR HOLATI (Fon va Bildirishnoma)
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Menyular
  const [activeMenu, setActiveMenu] = useState<string>("asosiy");
  const [talimTab, setTalimTab] = useState<"jadval" | "vazifa">("jadval");

  useEffect(() => {
    setIsMounted(true);
    
    const init = async () => {
      try {
        const sId = localStorage.getItem('user_id');
        const role = localStorage.getItem('user_role')?.toLowerCase();

        if (!sId || role !== 'student') {
          setLoadError(`Xatolik: Sizning rolingiz 'student' emas, balki '${role}' ga teng.`);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.from('profiles').select('*').eq('id', sId).single();
        
        if (error || !data) {
          setLoadError("Profilingizni bazadan yuklashda xatolik yuz berdi. Internetni tekshiring.");
          setIsLoading(false);
          return;
        }

        setCurrentStudent(data);
      } catch (err) {
        console.error("Xatolik:", err);
        setLoadError("Kutilmagan tarmoq xatosi yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/'); 
  };

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'}`}>
         <div className="flex flex-col items-center">
           <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
           <h2 className="text-2xl font-black tracking-tight">Profil ochilmoqda...</h2>
         </div>
      </div>
    );
  }

  // 🔴 AGAR XATOLIK BO'LSA, ORQAGA HAYDAMAYDI, XATONI EKRANDA KO'RSATADI!
  if (loadError || !currentStudent) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'} flex-col p-6`}>
         <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
         <h2 className="text-3xl font-black mb-4 text-center">Kirishda xatolik!</h2>
         <p className="text-center font-medium mb-8 max-w-md opacity-70">
           {loadError || "Ma'lumotlar topilmadi."}
         </p>
         <button onClick={handleLogout} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl transition-all">
           Loginga qaytish
         </button>
      </div>
    );
  }

  const fullName = currentStudent.full_name || "O'quvchi";
  const firstName = fullName.split(" ")[0] || "O'quvchi";
  const className = currentStudent.class_name || "Sinf yo'q";
  const ppBalance = currentStudent.pp_balance || 0;
  const initial = firstName.charAt(0).toUpperCase() || "O";

  const themeStyles = {
    bgMain: isDarkMode ? "bg-[#0f172a]" : "bg-slate-50",
    bgSidebar: isDarkMode ? "bg-[#0B1121]" : "bg-white",
    textMain: isDarkMode ? "text-slate-200" : "text-slate-800",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    border: isDarkMode ? "border-slate-800/50" : "border-slate-200",
    cardBg: isDarkMode ? "bg-[#0B1121]" : "bg-white",
    menuHover: isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100",
  };

  const getMenuTitle = () => {
    switch (activeMenu) {
      case "asosiy": return "Asosiy Panel";
      case "messenger": return "Messenger";
      case "hamyon": return "Hamyon (PP)";
      case "talim": return "Ta'lim bo'limi";
      case "reyting": return "Reyting";
      case "sozlamalar": return "Sozlamalar";
      default: return "Elita";
    }
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${themeStyles.bgMain} ${themeStyles.textMain} transition-colors duration-300`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 ${themeStyles.bgSidebar} border-r ${themeStyles.border} flex flex-col h-screen flex-shrink-0 z-20 p-4 transition-colors duration-300`}>
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">E</div>
          <span className={`text-2xl font-black tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ELITA</span>
        </div>
        
        <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {[
            { id: "asosiy", icon: <LayoutDashboard className="w-5 h-5"/>, label: "Asosiy" },
            { id: "messenger", icon: <MessageCircle className="w-5 h-5"/>, label: "Messenger" },
            { id: "hamyon", icon: <Wallet className="w-5 h-5"/>, label: "Hamyon (PP)" },
            { id: "talim", icon: <GraduationCap className="w-5 h-5"/>, label: "Ta'lim" },
            { id: "reyting", icon: <Trophy className="w-5 h-5"/>, label: "Reyting" },
          ].map(menu => (
            <button 
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)} 
              className={`w-full flex items-center p-3.5 rounded-xl font-bold transition-all ${
                activeMenu === menu.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : `${themeStyles.textMuted} ${themeStyles.menuHover}`
              }`}
            >
              <span className="mr-3">{menu.icon}</span>{menu.label}
            </button>
          ))}
        </nav>
        
        <div className={`mt-auto space-y-1.5 pt-4 border-t ${themeStyles.border}`}>
          <button 
            onClick={() => setActiveMenu("sozlamalar")} 
            className={`w-full flex items-center p-3.5 rounded-xl font-bold transition-all ${
              activeMenu === "sozlamalar" 
                ? 'bg-blue-600 text-white shadow-md' 
                : `${themeStyles.textMuted} ${themeStyles.menuHover}`
            }`}
          >
            <span className="mr-3"><Settings className="w-5 h-5" /></span>Sozlamalar
          </button>
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center p-3.5 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all`}
          >
            <span className="mr-3"><LogOut className="w-5 h-5" /></span>Chiqish
          </button>
        </div>
      </aside>

      {/* ASOSIY CONTENT QISMI */}
      <main className="flex-1 h-full flex flex-col relative">
        <header className={`h-16 border-b ${themeStyles.border} flex items-center justify-between px-6 ${themeStyles.bgSidebar} z-10 flex-shrink-0 transition-colors duration-300`}>
           <div className="flex items-center gap-4">
             <Menu className={`w-5 h-5 ${themeStyles.textMuted} hidden lg:block cursor-pointer`} />
             <h1 className={`text-xl font-black capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{getMenuTitle()}</h1>
           </div>
           
           <div className="flex items-center gap-4 relative">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${themeStyles.menuHover} ${themeStyles.textMuted} transition-colors outline-none`}>
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
             </button>
             
             <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-full relative ${themeStyles.menuHover} ${themeStyles.textMuted} transition-colors outline-none`}>
                <Bell className={`w-5 h-5 ${showNotifications ? 'text-blue-500' : ''}`} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
             </button>

             {showNotifications && (
               <div className={`absolute top-12 right-12 w-80 rounded-2xl shadow-2xl border ${themeStyles.border} ${themeStyles.cardBg} p-4 z-50 animate-in fade-in zoom-in-95`}>
                  <h3 className={`font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bildirishnomalar</h3>
                  <div className="space-y-2">
                     <div className={`p-3 rounded-xl border ${themeStyles.border} ${isDarkMode ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
                        <div className="flex items-start gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                           <div>
                             <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Tizimga xush kelibsiz!</p>
                             <p className={`text-xs ${themeStyles.textMuted} mt-1`}>Elita maktabi tizimi muvaffaqiyatli ishga tushdi.</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}
             
             <div className={`w-px h-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'} mx-2`}></div>
             
             <div className="text-right hidden md:block">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{fullName}</p>
                <p className="text-xs text-blue-500">{className} o'quvchisi</p>
             </div>
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black shadow-md cursor-pointer ml-2">
               {initial}
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeMenu === "asosiy" && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-48 h-48" /></div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {firstName}! 🚀</h1>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-emerald-300" /> {className} SINFI
                    </span>
                    <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner">
                      <Star className="w-4 h-4 mr-2" /> BALANS: {ppBalance} PP
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${themeStyles.cardBg} rounded-[2rem] border-2 border-dashed ${themeStyles.border} p-12 text-center flex flex-col items-center transition-colors`}>
                 <Clock className={`w-16 h-16 ${themeStyles.textMuted} mx-auto mb-4`}/>
                 <h3 className={`text-xl font-bold ${themeStyles.textMuted}`}>Tez orada bu yerda kunlik darslaringiz chiqadi!</h3>
              </div>
            </div>
          )}

          {activeMenu === "talim" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
               <div className={`flex ${themeStyles.cardBg} p-1.5 rounded-2xl w-fit border ${themeStyles.border} transition-colors`}>
                  <button 
                    onClick={() => setTalimTab("jadval")} 
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${talimTab === 'jadval' ? 'bg-blue-600 text-white shadow-md' : `${themeStyles.textMuted} ${themeStyles.menuHover}`}`}
                  >
                    <Calendar className="w-4 h-4"/> Dars Jadvali
                  </button>
                  <button 
                    onClick={() => setTalimTab("vazifa")} 
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${talimTab === 'vazifa' ? 'bg-blue-600 text-white shadow-md' : `${themeStyles.textMuted} ${themeStyles.menuHover}`}`}
                  >
                    <BookOpen className="w-4 h-4"/> Uy Vazifalari
                  </button>
               </div>

               <div className={`${themeStyles.cardBg} rounded-[2rem] border ${themeStyles.border} p-10 min-h-[400px] flex flex-col items-center justify-center text-center transition-colors`}>
                  {talimTab === "jadval" ? (
                     <>
                        <Calendar className={`w-16 h-16 ${themeStyles.textMuted} mx-auto mb-4`}/>
                        <h3 className={`text-xl font-bold ${themeStyles.textMuted}`}>Dars jadvalingiz tez orada shu yerga yuklanadi!</h3>
                     </>
                  ) : (
                     <>
                        <BookOpen className={`w-16 h-16 ${themeStyles.textMuted} mx-auto mb-4`}/>
                        <h3 className={`text-xl font-bold ${themeStyles.textMuted}`}>Uy vazifalaringiz tez orada shu yerga yuklanadi!</h3>
                     </>
                  )}
               </div>
            </div>
          )}

          {activeMenu === "messenger" && (
            <div className={`animate-in fade-in slide-in-from-bottom-4 ${themeStyles.cardBg} rounded-[2rem] border ${themeStyles.border} flex h-[600px] overflow-hidden transition-colors`}>
               <div className={`w-80 border-r ${themeStyles.border} flex flex-col`}>
                  <div className={`p-4 border-b ${themeStyles.border}`}>
                    <div className={`${themeStyles.bgMain} rounded-xl p-3 flex items-center gap-2 ${themeStyles.textMuted} border ${themeStyles.border}`}>
                       <Search className="w-4 h-4" />
                       <input type="text" placeholder="Qidiruv..." className={`bg-transparent outline-none text-sm w-full ${themeStyles.textMain}`} />
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4">
                     <p className={`text-sm font-bold ${themeStyles.textMuted} text-center`}>Hali chatlar yo'q. Yangi guruh oching!</p>
                  </div>
               </div>
               <div className={`flex-1 flex flex-col items-center justify-center ${themeStyles.bgMain} bg-opacity-50`}>
                  <div className={`w-20 h-20 rounded-full ${themeStyles.bgSidebar} border ${themeStyles.border} flex items-center justify-center mb-4`}>
                    <MessageCircle className={`w-8 h-8 ${themeStyles.textMuted}`} />
                  </div>
                  <h3 className={`font-bold ${themeStyles.textMuted}`}>Yozishish uchun chatni tanlang</h3>
               </div>
            </div>
          )}

          {["hamyon", "reyting", "sozlamalar"].includes(activeMenu) && (
            <div className={`animate-in fade-in slide-in-from-bottom-4 ${themeStyles.cardBg} rounded-[2rem] border ${themeStyles.border} p-12 text-center flex flex-col items-center justify-center min-h-[400px] transition-colors`}>
               <div className={`w-20 h-20 rounded-full ${themeStyles.bgMain} border ${themeStyles.border} flex items-center justify-center mb-4 text-blue-500`}>
                  {activeMenu === 'hamyon' && <Wallet className="w-8 h-8" />}
                  {activeMenu === 'reyting' && <Trophy className="w-8 h-8" />}
                  {activeMenu === 'sozlamalar' && <Settings className="w-8 h-8" />}
               </div>
               <h3 className={`text-xl font-bold ${themeStyles.textMain} capitalize`}>{activeMenu} bo'limi tez orada ishga tushadi!</h3>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <ErrorBoundary>
      <StudentDashboardContent />
    </ErrorBoundary>
  );
}

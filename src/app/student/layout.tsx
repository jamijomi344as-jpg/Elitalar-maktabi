"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, BookA, Trophy, Sun, Moon, Bell, User, MessageSquare, TrendingUp, BellRing } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ==========================================
  // 1. GLOBAL DARK MODE
  // ==========================================
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  // ==========================================
  // 2. BILDIRISHNOMA (NOTIFICATION) STATE
  // ==========================================
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Yangi Baho!", message: "Algebra fanidan (Abduraximov) 5 baho oldingiz. +10 CP qo'shildi.", time: "2 daqiqa oldin", read: false, type: "grade" },
    { id: 2, title: "Uy Vazifasi", message: "Ona tilidan yangi vazifa yuklandi. Muddati: Ertaga.", time: "1 soat oldin", read: false, type: "task" },
    { id: 3, title: "Direktor xabari", message: "Ertaga shanba kuni maktabda shanbalik! Oq ko'ylak shart emas.", time: "Kecha, 14:30", read: true, type: "system" }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Menyu ro'yxati
  const menuItems = [
    { name: "Asosiy", icon: LayoutDashboard, path: "/student/dashboard" },
    { name: "Hamyon (PP)", icon: Wallet, path: "/student/wallet" },
    { name: "Ta'lim", icon: BookA, path: "/student/education" },
    { name: "Reyting", icon: Trophy, path: "/student/ranking" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. YON PANEL (SIDEBAR) */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen flex-shrink-0 z-20 transition-colors duration-300 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">E</div>
          <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">ELITA</span>
        </div>

        <div className="p-4 flex flex-col gap-2 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all cursor-pointer ${isActive ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. O'NG TOMON (KONTENT VA HEADER) */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">
        
        {/* TEPADAGI GLOBAL HEADER (Oy/Quyosh VA Qo'ng'iroqcha shu yerda!) */}
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex justify-between items-center transition-colors duration-300 flex-shrink-0 z-40">
           <h2 className="font-black text-xl text-blue-900 dark:text-white hidden sm:block">O'quvchi Paneli</h2>
           <div className="flex items-center gap-3 ml-auto">
             
             {/* Dark Mode */}
             <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             {/* BILDIRISHNOMA (Notification) */}
             <div className="relative">
               <button 
                 onClick={() => setShowNotifications(!showNotifications)}
                 className={`p-2.5 rounded-full transition-all relative ${showNotifications ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
               >
                 <Bell className="w-5 h-5" />
                 {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>}
               </button>

               {/* DROPDOWN (Ochilgan Xabarlar) */}
               {showNotifications && (
                 <>
                   <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
                   <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 animate-in slide-in-from-top-4 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                       <h3 className="font-bold text-gray-800 dark:text-white">Bildirishnomalar</h3>
                       <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">{unreadCount} yangi</span>
                     </div>
                     <div className="max-h-[400px] overflow-y-auto">
                       {notifications.length === 0 ? (
                         <div className="p-8 text-center text-gray-400">Yangi xabarlar yo'q</div>
                       ) : (
                         notifications.map(note => (
                           <div 
                             key={note.id} 
                             onClick={() => markAsRead(note.id)}
                             className={`p-4 border-b border-gray-50 dark:border-slate-700/50 cursor-pointer transition-colors ${note.read ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40'}`}
                           >
                             <div className="flex gap-3">
                               <div className={`mt-1 flex-shrink-0 ${note.type === 'grade' ? 'text-emerald-500' : note.type === 'task' ? 'text-blue-500' : 'text-purple-500'}`}>
                                 {note.type === 'grade' ? <TrendingUp className="w-5 h-5"/> : note.type === 'task' ? <MessageSquare className="w-5 h-5"/> : <BellRing className="w-5 h-5"/>}
                               </div>
                               <div>
                                 <div className="flex justify-between items-start mb-1">
                                   <h4 className={`text-sm font-bold ${note.read ? 'text-gray-700 dark:text-gray-300' : 'text-blue-900 dark:text-blue-300'}`}>{note.title}</h4>
                                   <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{note.time}</span>
                                 </div>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{note.message}</p>
                               </div>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                     {unreadCount > 0 && (
                       <div className="p-3 text-center border-t border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                         <button onClick={markAllAsRead} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Barchasini o'qilgan deb belgilash</button>
                       </div>
                     )}
                   </div>
                 </>
               )}
             </div>
             
             {/* Profil */}
             <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity ml-1">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">K</div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200 hidden sm:block">Kiyotaka A.</span>
             </div>
           </div>
        </div>

        {/* SAHIFALAR KONTENTI SHU YERDA CHIQADI */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
           {children}
        </div>
        
      </div>

    </div>
  );
}

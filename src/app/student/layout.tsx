"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, BookA, Trophy, Sun, Moon, Bell, User, MessageSquare, TrendingUp, BellRing, Menu, X } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ==========================================
  // STATE'LAR
  // ==========================================
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // SIDEBAR OCHIB-YOPISH UCHUN
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Yangi Baho!", message: "Algebra fanidan 5 baho oldingiz. +10 CP qo'shildi.", time: "2 daqiqa oldin", read: false, type: "grade" }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

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

  const menuItems = [
    { name: "Asosiy", icon: LayoutDashboard, path: "/student/dashboard" },
    { name: "Messenger", icon: MessageSquare, path: "/student/messenger" },
    { name: "Hamyon (PP)", icon: Wallet, path: "/student/wallet" },
    { name: "Ta'lim", icon: BookA, path: "/student/education" },
    { name: "Reyting", icon: Trophy, path: "/student/ranking" },
  ];

  // Agar hozirgi sahifa Messenger bo'lsa, chetidagi bo'shliqlarni (padding) olib tashlaymiz
  const isMessenger = pathname?.includes("messenger");

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. YON PANEL (SIDEBAR) - Endi ochilib-yopiladi! */}
      <div 
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen flex-shrink-0 z-30 transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? "w-64" : "w-0 border-none"
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 w-64">
          <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">E</div>
          <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">ELITA</span>
        </div>

        <div className="p-4 flex flex-col gap-2 mt-2 w-64">
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
        
        {/* GLOBAL HEADER */}
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex justify-between items-center transition-colors duration-300 flex-shrink-0 z-40">
           
           <div className="flex items-center gap-4">
             {/* MENU TUGMASI (Gamburger) - Sidebar ni ochib yopish uchun */}
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
             >
                {isSidebarOpen ? <Menu className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
             <h2 className="font-black text-xl text-blue-900 dark:text-white hidden sm:block">
                {isMessenger ? "Telegram Klon" : "O'quvchi Paneli"}
             </h2>
           </div>

           <div className="flex items-center gap-3 ml-auto">
             <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             <div className="relative">
               <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                 <Bell className="w-5 h-5" />
               </button>
             </div>
             
             <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700 cursor-pointer ml-1">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">K</div>
             </div>
           </div>
        </div>

        {/* SAHIFALAR KONTENTI: Agar Messenger bo'lsa Padding 0 qilinadi (Butun ekran) */}
        <div className={`flex-1 overflow-y-auto relative z-10 transition-all duration-300 ${isMessenger ? 'p-0 bg-[#0e1621] dark:bg-[#0e1621]' : 'p-4 md:p-8 bg-slate-50 dark:bg-slate-950'}`}>
           {children}
        </div>
        
      </div>
    </div>
  );
}

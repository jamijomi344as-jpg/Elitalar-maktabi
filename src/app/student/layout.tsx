"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, BookA, Trophy, Sun, Moon, Bell, User } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ==========================================
  // GLOBAL DARK MODE FUNKSIYASI (Butun sayt uchun)
  // ==========================================
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sayt yangilanganda (refresh) oldingi holatni LocalStorage dan olish
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Tugma bosilganda temanini o'zgartirish va saqlab qo'yish
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
    { name: "Hamyon (PP)", icon: Wallet, path: "/student/wallet" },
    { name: "Ta'lim", icon: BookA, path: "/student/education" },
    { name: "Reyting", icon: Trophy, path: "/student/ranking" },
  ];

  return (
    // DIQQAT: Asosiy bg-slate-50 ga dark:bg-slate-950 qo'shildi! Bu oraliq bo'shliqlarni qora qiladi.
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden transition-colors duration-300">
      
      {/* ======================================================== */}
      {/* 1. YON PANEL (SIDEBAR) */}
      {/* ======================================================== */}
      {/* DIQQAT: Sidebar ga dark:bg-slate-900 va dark:border-slate-800 qo'shildi! */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen flex-shrink-0 z-20 transition-colors duration-300 hidden md:flex">
        
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
            E
          </div>
          <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white">ELITA</span>
        </div>

        <div className="p-4 flex flex-col gap-2 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.name} href={item.path}>
                <div
                  className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. O'NG TOMON (KONTENT VA HEADER) */}
      {/* ======================================================== */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">
        
        {/* TEPADAGI GLOBAL HEADER (Oy/Quyosh tugmalari bilan) */}
        {/* DIQQAT: Header endi layout ni ichiga oldindi. Shunda hamma joyda ko'rinadi! */}
        <div className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex justify-between items-center transition-colors duration-300 flex-shrink-0 z-10">
           <h2 className="font-black text-xl text-blue-900 dark:text-white hidden sm:block">O'quvchi Paneli</h2>
           <div className="flex items-center gap-3 ml-auto">
             
             {/* Tungi/Kunduzgi rejim tugmasi */}
             <button 
               onClick={toggleTheme} 
               className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
               title="Fonni o'zgartirish"
             >
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             <button className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             
             <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity ml-1">
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200 hidden sm:block">Kiyotaka A.</span>
             </div>
           </div>
        </div>

        {/* SAHIFALAR KONTENTI SHU YERDA CHIQADI */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {children}
        </div>
        
      </div>

    </div>
  );
}

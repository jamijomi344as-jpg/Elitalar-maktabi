"use client";

import { useState, useEffect } from "react";
import { Bell, Moon, Sun, User } from "lucide-react";

export default function TopBar() {
  const [isDark, setIsDark] = useState(false);

  // Sahifa yuklanganda kompyuterning mavzusini tekshirish
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  // Tungi va Kunduzgi rejimni almashtirish
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30 transition-colors duration-200">
      
      {/* Telefonlar uchun kichik logo (Kompyuterda yashiringan) */}
      <div className="flex items-center md:hidden">
        <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white font-bold">E</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">ELITA</h2>
      </div>

      {/* Kompyuter uchun sahifa nomi */}
      <div className="hidden md:block">
         <h1 className="text-lg font-medium text-gray-800 dark:text-gray-200">O'quvchi Paneli</h1>
      </div>

      {/* O'ng tomondagi tugmalar */}
      <div className="flex items-center space-x-3 md:space-x-4">
        
        {/* Dark Mode tugmasi */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        {/* Bildirishnomalar tugmasi */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>

        {/* Profil qismi */}
        <div className="flex items-center pl-2 border-l border-gray-200 dark:border-slate-700">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
            Kiyotaka A.
          </span>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Award, TrendingUp, BellRing, Calendar, Activity, Sun, Moon, Bell, CheckCircle2, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const student = {
    id: "S-8392",
    name: "Kiyotaka Ayanokoji",
    class: "9-B",
    balancePP: 12000,
    cp: 150
  };

  // ==========================================
  // STATE'LAR
  // ==========================================
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // Bildirishnoma oynasi uchun
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Yangi Baho!", message: "Algebra fanidan (Abduraximov) 5 baho oldingiz. +10 CP qo'shildi.", time: "2 daqiqa oldin", read: false, type: "grade" },
    { id: 2, title: "Uy Vazifasi", message: "Ona tilidan yangi vazifa yuklandi. Muddati: Ertaga.", time: "1 soat oldin", read: false, type: "task" },
    { id: 3, title: "Direktor xabari", message: "Ertaga shanba kuni maktabda shanbalik! Oq ko'ylak shart emas.", time: "Kecha, 14:30", read: true, type: "system" }
  ]);

  // Dark Mode Mantiqi
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // O'qilmagan xabarlarni sanash
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-500 pb-10 relative">
      
      {/* TEPADAGI ASOSIY HEADER */}
      <div className="w-full flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300 relative z-40">
        <h2 className="font-black text-xl text-blue-900 dark:text-blue-400">O'quvchi Paneli</h2>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Fonni o'zgartirish"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* BILDIRISHNOMA TUGMASI VA DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-full transition-all relative ${showNotifications ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Bildirishnoma Oynasi (Dropdown) */}
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
                  <div className="p-3 text-center border-t border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Barchasini o'qilgan deb belgilash</button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity">
             <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">K</div>
             <span className="font-bold text-sm text-slate-700 dark:text-slate-200 hidden sm:block">Kiyotaka A.</span>
          </div>
        </div>
      </div>

      {/* TEPADAGI PROFIL VA BALANS */}
      <div className="w-full bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-transparent dark:border-slate-700 transition-colors duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-blue-300 dark:text-blue-400 text-sm mb-1 uppercase tracking-wider font-bold">Xush kelibsiz</p>
            <h1 className="text-3xl font-black mb-2">{student.name}</h1>
            <p className="text-blue-200 dark:text-slate-300 font-medium flex items-center bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md">
              <GraduationCap className="w-4 h-4 mr-2" /> Sinf: {student.class}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 dark:text-slate-300 text-xs mb-1 font-bold uppercase">Balans (PP)</p>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.balancePP}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 dark:text-slate-300 text-xs mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1" /> {student.cp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ASOSIY SAHIFA KONTENTI */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-2 transition-colors duration-300">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center"><BellRing className="w-5 h-5 mr-2 text-indigo-500"/> Muhim E'lonlar</h2>
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 transition-colors duration-300">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md mb-2 inline-block">Bugun, 09:00</span>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Maktab do'koni yaqinda ochiladi!</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">Yig'ilgan PP ballaringiz evaziga qimmatbaho sovg'alar va xizmatlarni xarid qilishingiz mumkin bo'ladi.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-700 dark:to-teal-800 p-6 rounded-3xl shadow-sm text-white transition-colors duration-300">
            <h2 className="text-lg font-bold mb-1 flex items-center"><Activity className="w-5 h-5 mr-2"/> O'zlashtirish</h2>
            <p className="text-emerald-100 text-sm mb-4">Sinfdagi umumiy o'rningiz (Top 3)</p>
            <div className="text-4xl font-black mb-1">2-o'rin</div>
            <p className="text-sm font-medium text-emerald-200">1-o'ringa chiqish uchun yana 25 CP kerak.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

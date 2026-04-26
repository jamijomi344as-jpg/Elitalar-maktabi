"use client";

import { Info, User, GraduationCap, Award, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const student = {
    id: "S-8392",
    name: "Kiyotaka Ayanokoji",
    class: "9-B",
    balancePP: 12000,
    cp: 150
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* TEPADAGI PROFIL VA BALANS */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden w-full border border-transparent dark:border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div>
            <p className="text-blue-300 dark:text-blue-400 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchi Paneli</p>
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
      <div className="grid grid-cols-1 gap-6 w-full">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center items-center text-center min-h-[300px]">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-4">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Maktab yangiliklari</h2>
          <p className="text-gray-500 dark:text-gray-400">Hozircha hech qanday e'lon yoki yangilik yo'q.</p>
        </div>
      </div>

    </div>
  );
}

"use client";

import { User, GraduationCap, Award, TrendingUp, Info, BellRing, Calendar, Activity } from "lucide-react";

export default function DashboardPage() {
  const student = {
    id: "S-8392",
    name: "Kiyotaka Ayanokoji",
    class: "9-B",
    balancePP: 12000,
    cp: 150
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* TEPADAGI PROFIL VA BALANS (Qora Rejim xatosiz) */}
      <div className="w-full bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-transparent dark:border-slate-700">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <User className="w-32 h-32" />
        </div>
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
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5 mr-1"/> {student.balancePP}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 dark:text-slate-300 text-xs mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-1" /> {student.cp}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ASOSIY SAHIFA KONTENTI */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 lg:col-span-2 transition-colors duration-300">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <BellRing className="w-5 h-5 mr-2 text-indigo-500"/> Muhim E'lonlar
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md mb-2 inline-block">Bugun, 09:00</span>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Maktab do'koni yaqinda ochiladi!</h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">Yig'ilgan PP ballaringiz evaziga qimmatbaho sovg'alar va xizmatlarni xarid qilishingiz mumkin bo'ladi.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded-md mb-2 inline-block">24 Aprel</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Bahorgi imtihonlar (CHSB) sanalari</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">CHSB imtihonlari kelasi haftadan boshlanadi. Reytingingizni (CP) ko'tarish uchun ajoyib imkoniyat!</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-500"/> Ertangi darslar
            </h2>
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="font-bold text-gray-700 dark:text-gray-300">1. Algebra</span><span className="text-gray-500 dark:text-gray-400">08:00</span>
              </li>
              <li className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="font-bold text-gray-700 dark:text-gray-300">2. Ingliz tili</span><span className="text-gray-500 dark:text-gray-400">08:50</span>
              </li>
              <li className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="font-bold text-gray-700 dark:text-gray-300">3. Ona tili</span><span className="text-gray-500 dark:text-gray-400">09:40</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-700 dark:to-teal-800 p-6 rounded-3xl shadow-sm text-white transition-colors duration-300">
            <h2 className="text-lg font-bold mb-1 flex items-center">
              <Activity className="w-5 h-5 mr-2"/> O'zlashtirish
            </h2>
            <p className="text-emerald-100 text-sm mb-4">Sinfdagi umumiy o'rningiz (Top 3)</p>
            <div className="text-4xl font-black mb-1">2-o'rin</div>
            <p className="text-sm font-medium text-emerald-200">1-o'ringa chiqish uchun yana 25 CP kerak.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

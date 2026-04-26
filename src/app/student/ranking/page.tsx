"use client";

import { useState } from "react";
import { Trophy, Medal, Star, Lock, User, GraduationCap, Award, TrendingUp } from "lucide-react";

export default function RankingPage() {
  const student = { id: "S-8392", name: "Kiyotaka Ayanokoji", class: "9-B", balancePP: 12000, cp: 150 };
  const [ratingClass, setRatingClass] = useState<"9-A" | "9-B" | "9-C" | "9-D">("9-B");

  const schoolRanking = [
    { rank: 1, class: "9-B", cp: 4500, students: 25 },
    { rank: 2, class: "9-A", cp: 4100, students: 24 },
    { rank: 3, class: "9-C", cp: 3800, students: 26 },
    { rank: 4, class: "9-D", cp: 3200, students: 23 },
  ];

  const classRankings = {
    "9-B": [
      { rank: 1, name: "Azizbek O'lmasov", pp: 14500, isMe: false },
      { rank: 2, name: "Kiyotaka Ayanokoji", pp: 12000, isMe: true }, 
      { rank: 3, name: "Asadova Parizod", pp: 11200, isMe: false },
      { rank: 4, name: "Dilmurodov Javohir", pp: 9800, isMe: false },
      { rank: 5, name: "Botirova Bonu", pp: 8500, isMe: false },
    ],
    "9-A": [
      { rank: 1, name: "Rahmatov Alisher", pp: 15200, isMe: false },
      { rank: 2, name: "Valiyeva Kamila", pp: 13400, isMe: false },
      { rank: 3, name: "Tursunov Doston", pp: 10500, isMe: false },
    ],
    "9-C": [{ rank: 1, name: "Karimov Temur", pp: 11000, isMe: false }, { rank: 2, name: "Rustamova Shahnoza", pp: 9200, isMe: false }],
    "9-D": [{ rank: 1, name: "Umarov Sanjar", pp: 8900, isMe: false }, { rank: 2, name: "Nazarova Madina", pp: 7400, isMe: false }]
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* TEPADAGI PROFIL VA BALANS */}
      <div className="w-full bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-transparent dark:border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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

      {/* Maktab bo'yicha Sinflar Reytingi */}
      <div className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-20"><Trophy className="w-32 h-32" /></div>
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm mb-1 uppercase tracking-wider font-bold flex items-center"><Award className="w-4 h-4 mr-2"/> Maktab Reytingi (9-sinflar)</p>
          <h1 className="text-2xl font-black mb-4">Sinfingiz hozir 1-o'rinda! 🎉</h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {schoolRanking.map((sClass) => (
              <div key={sClass.rank} className={`p-4 rounded-2xl flex flex-col items-center justify-center border transition-all ${sClass.class === student.class ? 'bg-white text-emerald-700 border-white shadow-md transform scale-105 z-10' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer'}`} onClick={() => setRatingClass(sClass.class as any)}>
                <div className={`text-xl font-black mb-1 ${sClass.class === student.class ? 'text-emerald-600' : 'text-emerald-100'}`}>#{sClass.rank} {sClass.class}</div>
                <div className={`text-xs font-bold ${sClass.class === student.class ? 'text-emerald-500' : 'text-emerald-200'}`}>{sClass.cp} CP</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* O'quvchilar Reytingi */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center"><Medal className="w-5 h-5 mr-2 text-emerald-500"/> {ratingClass} O'quvchilari Reytingi</h2>
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            {(["9-A", "9-B", "9-C", "9-D"] as const).map(cls => (
              <button key={cls} onClick={() => setRatingClass(cls)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${ratingClass === cls ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs font-bold text-gray-400 mb-4 px-2 uppercase tracking-wide">O'rinlar o'quvchilarning Hamyonidagi (PP) pullari orqali hisoblangan.</div>
          {classRankings[ratingClass].map((st) => {
            const isMyClass = ratingClass === student.class;
            return (
              <div key={st.rank} className={`flex items-center justify-between p-4 mb-2 rounded-2xl transition-all border border-transparent ${st.isMe ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-gray-50 dark:border-slate-800/50 last:border-transparent'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${st.rank === 1 ? 'bg-yellow-400 text-yellow-900' : st.rank === 2 ? 'bg-slate-300 text-slate-700' : st.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                    {st.rank === 1 ? <Trophy className="w-5 h-5"/> : st.rank === 2 ? <Medal className="w-5 h-5"/> : st.rank}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${st.isMe ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {st.name} {st.isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-md ml-2 relative -top-0.5">Siz</span>}
                    </h3>
                  </div>
                </div>
                {isMyClass ? (
                  <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-800">
                    <Award className="w-4 h-4 text-amber-500 mr-2"/><span className="font-black text-amber-600 dark:text-amber-400">{st.pp} PP</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 opacity-60">
                    <Lock className="w-4 h-4 text-gray-400 mr-2"/><span className="font-bold text-gray-500 text-xs">Yashirin</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

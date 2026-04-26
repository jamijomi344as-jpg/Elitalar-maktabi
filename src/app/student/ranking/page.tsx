"use client";

import { Trophy, Medal, Star, User } from "lucide-react";

export default function RankingPage() {
  const leaderboard = [
    { rank: 1, name: "Azizbek O'lmasov", cp: 175, isMe: false },
    { rank: 2, name: "Kiyotaka Ayanokoji", cp: 150, isMe: true }, // <--- Bu siz!
    { rank: 3, name: "Asadova Parizod", cp: 140, isMe: false },
    { rank: 4, name: "Dilmurodov Javohir", cp: 120, isMe: false },
    { rank: 5, name: "Botirova Bonu", cp: 115, isMe: false },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 p-8 opacity-20"><Trophy className="w-32 h-32" /></div>
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchilar Reytingi</p>
          <h1 className="text-3xl font-black mb-2">9-B Sinf Jadvali (Top 5)</h1>
          <p className="text-emerald-100 font-medium">To'plangan CP (Class Points) asosida tuzilgan ro'yxat.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden w-full">
        <div className="p-2">
          {leaderboard.map((student) => (
            <div key={student.rank} className={`flex items-center justify-between p-4 mb-2 rounded-2xl transition-all ${student.isMe ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${student.rank === 1 ? 'bg-yellow-400 text-yellow-900' : student.rank === 2 ? 'bg-slate-300 text-slate-700' : student.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                  {student.rank === 1 ? <Trophy className="w-5 h-5"/> : student.rank === 2 ? <Medal className="w-5 h-5"/> : student.rank}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${student.isMe ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {student.name} {student.isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-md ml-2 relative -top-0.5">Siz</span>}
                  </h3>
                </div>
              </div>
              <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <Star className="w-4 h-4 text-emerald-500 mr-2 fill-emerald-500"/>
                <span className="font-black text-emerald-700 dark:text-emerald-400">{student.cp} CP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

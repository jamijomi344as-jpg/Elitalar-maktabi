"use client";

import { mockClasses } from "@/lib/mockData";
import { Trophy, Medal, TrendingUp, AlertTriangle } from "lucide-react";

export default function RankingsPage() {
  // Reytingni balanddan pastga qarab tartiblash
  const sortedClasses = [...mockClasses].sort((a, b) => b.pointsCP - a.pointsCP);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Sarlavha qismi */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-20">
          <Trophy className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 tracking-tight">S-Tizimi Reytingi</h1>
          <p className="text-amber-100 max-w-md text-sm md:text-base">
            Sinflar o'rtasidagi raqobat. Har oy oxirida eng kam ball to'plagan sinf maktabdan chetlatish xavfi ostida qoladi.
          </p>
        </div>
      </div>

      {/* 2. Top-3 Liderlar (Katta kartochkalar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {sortedClasses.slice(0, 3).map((cls, index) => {
          // O'rinlarga qarab rang va ikonkalarni belgilash
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          let bgColor = "bg-white dark:bg-slate-900";
          let borderColor = "border-gray-100 dark:border-slate-800";
          let iconColor = "text-gray-400";
          let badgeColor = "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400";
          let Icon = Medal;

          if (isFirst) {
            bgColor = "bg-amber-50 dark:bg-amber-500/10";
            borderColor = "border-amber-200 dark:border-amber-500/30";
            iconColor = "text-amber-500";
            badgeColor = "bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400";
            Icon = Trophy;
          } else if (isSecond) {
            bgColor = "bg-slate-50 dark:bg-slate-400/10";
            borderColor = "border-slate-200 dark:border-slate-500/30";
            iconColor = "text-slate-400";
            badgeColor = "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300";
          } else if (isThird) {
            bgColor = "bg-orange-50 dark:bg-orange-500/10";
            borderColor = "border-orange-200 dark:border-orange-500/30";
            iconColor = "text-orange-500";
            badgeColor = "bg-orange-200 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400";
          }

          return (
            <div key={cls.className} className={`${bgColor} rounded-3xl p-6 border ${borderColor} shadow-sm relative overflow-hidden flex flex-col items-center text-center transition-transform hover:-translate-y-1`}>
              <div className={`absolute top-4 left-4 text-sm font-black ${badgeColor} px-3 py-1 rounded-full`}>
                #{index + 1}
              </div>
              <div className={`w-20 h-20 rounded-full ${badgeColor} flex items-center justify-center mb-4 mt-4`}>
                <Icon className={`w-10 h-10 ${iconColor}`} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{cls.className}</h2>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                <span className="text-sm">Sinf reytingi</span>
              </div>
              <div className={`text-3xl font-black ${iconColor}`}>
                {cls.pointsCP} <span className="text-lg font-bold opacity-70">CP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Qolgan sinflar ro'yxati (Xavf ostidagilar) */}
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          Umumiy Reyting
        </h3>
        
        <div className="space-y-3">
          {sortedClasses.slice(3).map((cls, index) => {
            const actualRank = index + 4; // 3 ta top o'rindan keyin keladi
            const isDanger = cls.pointsCP === 0;

            return (
              <div key={cls.className} className={`flex items-center justify-between p-4 rounded-2xl border ${isDanger ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30' : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold mr-4">
                    {actualRank}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{cls.className}</h4>
                    {isDanger && (
                      <span className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Chetlatish xavfi
                      </span>
                    )}
                  </div>
                </div>
                <div className={`font-black text-xl ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {cls.pointsCP} <span className="text-sm font-medium">CP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

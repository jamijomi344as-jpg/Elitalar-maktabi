"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Medal, Star, Loader2 } from "lucide-react";

export default function StudentRankingPage() {
  const [student, setStudent] = useState<any>(null);
  const [parallelClasses, setParallelClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return window.location.replace('/');

        // 1. O'quvchini olamiz
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!profile) return;
        setStudent(profile);

        // 2. O'quvchi sinfidan (masalan "9-A") faqat raqamni (masalan "9") kesib olamiz
        const gradeMatch = profile.class_name?.match(/^(\d+)/);
        const gradeNumber = gradeMatch ? gradeMatch[1] : null;

        if (gradeNumber) {
          // 3. Faqat shu raqam bilan boshlanadigan sinflarni (Parallel sinflarni) chaqiramiz
          const { data: classes } = await supabase
            .from('classes')
            .select('*')
            .like('name', `${gradeNumber}-%`)
            .order('total_cp', { ascending: false }); // CP bo'yicha kamayish tartibida

          if (classes) setParallelClasses(classes);
        }
      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin"/></div>;
  if (!student) return null;

  // Parallelni aniqlash (Masalan "9")
  const gradeMatch = student.class_name?.match(/^(\d+)/);
  const gradeNumber = gradeMatch ? gradeMatch[1] : "?";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy className="w-48 h-48" /></div>
         <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Sinflar Reytingi</h1>
            <p className="text-blue-100 font-medium">Bu yerda faqat {gradeNumber}-sinflar o'rtasidagi raqobat ko'rsatilgan.</p>
         </div>
      </div>

      {/* REYTING JADVALI */}
      <div className="bg-[#131B2F] border border-slate-800 rounded-3xl shadow-lg overflow-hidden">
         <div className="p-6 border-b border-slate-800 bg-[#0f172a]">
            <h2 className="text-xl font-black text-white flex items-center">
              <Star className="w-5 h-5 text-amber-500 mr-3"/> {gradeNumber}-Sinflar Chempionati
            </h2>
         </div>

         <div className="p-2 md:p-6">
            {parallelClasses.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-bold">Hech qanday ma'lumot topilmadi.</div>
            ) : (
              <div className="space-y-3">
                {parallelClasses.map((cls, index) => {
                  const isMyClass = cls.name === student.class_name;
                  
                  // O'rinlarga qarab rang va ikonka
                  let rankColor = "text-slate-400 bg-slate-800/50";
                  let rankIcon = <span className="font-black text-lg">{index + 1}</span>;

                  if (index === 0) {
                    rankColor = "text-amber-500 bg-amber-500/10 border-amber-500/30";
                    rankIcon = <Trophy className="w-6 h-6" />;
                  } else if (index === 1) {
                    rankColor = "text-slate-300 bg-slate-300/10 border-slate-300/30";
                    rankIcon = <Medal className="w-6 h-6" />;
                  } else if (index === 2) {
                    rankColor = "text-amber-700 bg-amber-900/20 border-amber-800/30";
                    rankIcon = <Medal className="w-6 h-6" />;
                  }

                  return (
                    <div 
                      key={cls.id} 
                      className={`flex items-center justify-between p-4 md:p-6 rounded-2xl border transition-all ${
                        isMyClass 
                          ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                          : 'bg-[#0B1121] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        {/* O'rin */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${rankColor}`}>
                          {rankIcon}
                        </div>
                        
                        {/* Sinf nomi va Rahbar */}
                        <div>
                          <h3 className={`text-xl font-black ${isMyClass ? 'text-blue-400' : 'text-white'}`}>
                            {cls.name} {isMyClass && <span className="ml-2 text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase">Sizning sinfingiz</span>}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 font-medium hidden md:block">Sinf rahbari: {cls.homeroom_teacher || "Kiritilmagan"}</p>
                        </div>
                      </div>

                      {/* Ball */}
                      <div className="text-right flex-shrink-0">
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Jami Ball (CP)</p>
                         <p className={`text-2xl md:text-3xl font-black ${index === 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
                           {cls.total_cp || 0}
                         </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
         </div>
      </div>

    </div>
  );
}

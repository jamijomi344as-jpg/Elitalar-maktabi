"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trophy, Medal, Lock, User, GraduationCap, Award, TrendingUp } from "lucide-react";

export default function RankingPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [ratingClass, setRatingClass] = useState<string>("");
  
  const [schoolRanking, setSchoolRanking] = useState<any[]>([]);
  const [classRankings, setClassRankings] = useState<any[]>([]);
  const [allClassesNames, setAllClassesNames] = useState<string[]>([]);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) { router.push('/'); return; }

    const loadData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if (profile) {
        setStudent(profile);
        setRatingClass(profile.class_name);
        fetchClassmates(profile.class_name);
      }

      // Maktab reytingi
      const { data: classes } = await supabase.from('classes').select('*');
      if (classes) {
        const sorted = [...classes].sort((a,b) => (b.total_cp || 0) - (a.total_cp || 0));
        setSchoolRanking(sorted);
        setAllClassesNames(sorted.map(c => c.name));
      }
    };
    loadData();
  }, [router]);

  const fetchClassmates = async (className: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className);
    if (data) {
      const sorted = [...data].sort((a,b) => (b.cp_score || 0) - (a.cp_score || 0));
      setClassRankings(sorted);
    }
  };

  const handleTabChange = (cls: string) => {
    setRatingClass(cls);
    fetchClassmates(cls);
  };

  if (!student) return <div className="p-10 text-center text-slate-500">Yuklanmoqda...</div>;

  const mySchoolRank = schoolRanking.findIndex(c => c.name === student.class_name) + 1;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="w-full bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 border border-transparent dark:border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-blue-300 dark:text-blue-400 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchi Paneli</p>
            <h1 className="text-3xl font-black mb-2">{student.full_name}</h1>
            <p className="text-blue-200 font-medium flex items-center bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md">
              <GraduationCap className="w-4 h-4 mr-2" /> Sinf: {student.class_name}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 text-xs mb-1 font-bold uppercase">Balans (PP)</p>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.pp_balance || 0}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 text-xs mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1" /> {student.cp_score || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20"><Trophy className="w-32 h-32" /></div>
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm mb-1 uppercase tracking-wider font-bold flex items-center"><Award className="w-4 h-4 mr-2"/> Maktab Reytingi</p>
          <h1 className="text-2xl font-black mb-4">Sinfingiz hozir {mySchoolRank}-o'rinda! 🎉</h1>
          <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
            {schoolRanking.map((sClass, i) => (
              <div key={sClass.name} className={`min-w-[120px] p-4 rounded-2xl flex flex-col items-center justify-center border transition-all ${sClass.name === student.class_name ? 'bg-white text-emerald-700 border-white shadow-md transform scale-105 z-10' : 'bg-white/10 text-white border-white/20'}`}>
                <div className={`text-xl font-black mb-1 ${sClass.name === student.class_name ? 'text-emerald-600' : 'text-emerald-100'}`}>#{i+1} {sClass.name}</div>
                <div className={`text-xs font-bold ${sClass.name === student.class_name ? 'text-emerald-500' : 'text-emerald-200'}`}>{sClass.total_cp || 0} CP</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#17212b] rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0e1621] p-4 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center"><Medal className="w-5 h-5 mr-2 text-emerald-500"/> {ratingClass} Reytingi</h2>
          <div className="flex bg-white dark:bg-[#17212b] p-1 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-x-auto max-w-[200px] md:max-w-full">
            {allClassesNames.map(cls => (
              <button key={cls} onClick={() => handleTabChange(cls)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${ratingClass === cls ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {classRankings.map((st, i) => {
            const isMyClass = ratingClass === student.class_name;
            const isMe = st.id === student.id;
            const rank = i + 1;
            return (
              <div key={st.id} className={`flex items-center justify-between p-4 mb-2 rounded-2xl transition-all border ${isMe ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent border-b-gray-100 dark:border-b-slate-800/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : rank === 2 ? 'bg-slate-300 text-slate-700' : rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                    {rank === 1 ? <Trophy className="w-5 h-5"/> : rank === 2 ? <Medal className="w-5 h-5"/> : rank}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isMe ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {st.full_name} {isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-md ml-2 relative -top-0.5">Siz</span>}
                    </h3>
                  </div>
                </div>
                {isMyClass ? (
                  <div className="flex items-center font-black text-emerald-500 text-xl">{st.cp_score || 0} CP</div>
                ) : (
                  <div className="flex items-center bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl opacity-60"><Lock className="w-4 h-4 text-gray-400 mr-2"/><span className="font-bold text-gray-500 text-xs">Yashirin</span></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

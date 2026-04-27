"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Award, TrendingUp, BellRing, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [classRank, setClassRank] = useState(0);
  const [schoolRank, setSchoolRank] = useState(0);
  const [cpNeeded, setCpNeeded] = useState(0);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (studentId) {
      // O'quvchi ma'lumotlarini yuklash
      supabase.from('profiles').select('*').eq('id', studentId).single().then(({data}) => {
        setStudent(data);
        if (data) calculateRanks(data);
      });
      
      // Muhim e'lonlarni yuklash (so'nggi 3 tasi)
      supabase.from('notifications').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(3).then(({data}) => {
         setNotifications(data || []);
      });
    }
  }, []);

  const calculateRanks = async (me: any) => {
     // Sinf reytingi
     const {data: classmates} = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', me.class_name);
     if (classmates) {
        const sorted = [...classmates].sort((a,b) => (b.cp_score || 0) - (a.cp_score || 0));
        const rank = sorted.findIndex(c => c.id === me.id) + 1;
        setClassRank(rank);
        if (rank > 1) setCpNeeded(sorted[rank-2].cp_score - (me.cp_score || 0) + 1);
     }
     
     // Maktab reytingi
     const {data: classes} = await supabase.from('classes').select('*');
     if (classes) {
        const sortedC = [...classes].sort((a,b) => (b.total_cp || 0) - (a.total_cp || 0));
        const cRank = sortedC.findIndex(c => c.name === me.class_name) + 1;
        setSchoolRank(cRank);
     }
  };

  if (!student) return <div className="p-10 text-center text-slate-500 dark:text-slate-400">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* TEPADAGI KARTA */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-blue-500/20 w-full">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div>
            <p className="text-blue-200 text-sm mb-1 uppercase tracking-wider font-bold">Xush kelibsiz</p>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">{student.full_name}</h1>
            <p className="text-white font-bold flex items-center bg-black/20 w-fit px-4 py-2 rounded-xl backdrop-blur-md shadow-inner">
              <GraduationCap className="w-5 h-5 mr-2 text-amber-300" /> {student.class_name} sinf
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px] text-center shadow-inner">
              <p className="text-blue-200 text-[10px] mb-1 font-bold uppercase">Balans (PP)</p>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.pp_balance || 0}</div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px] text-center shadow-inner">
              <p className="text-blue-200 text-[10px] mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1" /> {student.cp_score || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* E'LONLAR */}
        <div className="lg:col-span-2 bg-white dark:bg-[#17212b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm">
           <h3 className="flex items-center text-slate-900 dark:text-blue-400 font-bold mb-4"><BellRing className="w-5 h-5 mr-2 text-blue-500"/> Muhim E'lonlar</h3>
           <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-1">Maktab do'koni yaqinda ochiladi!</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Yig'ilgan PP ballaringiz evaziga qimmatbaho sovg'alar va xizmatlarni xarid qilishingiz mumkin bo'ladi.</p>
           </div>
           
           <div className="mt-4 space-y-3">
             {notifications.length === 0 ? <p className="text-slate-500 text-sm">Hozircha xabarlar yo'q</p> : notifications.map(notif => (
               <div key={notif.id} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4">
                  <h4 className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-1">{notif.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{notif.message}</p>
               </div>
             ))}
           </div>
        </div>
        
        {/* REYTING */}
        <div className="bg-emerald-500 dark:bg-[#0f8b65] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center shadow-sm">
           <TrendingUp className="absolute -right-6 -bottom-6 w-40 h-40 text-black/10"/>
           <h3 className="flex items-center text-emerald-100 font-bold mb-2 relative z-10"><TrendingUp className="w-5 h-5 mr-2"/> O'zlashtirish</h3>
           <p className="text-emerald-100 text-xs mb-4 relative z-10">Sinfdagi umumiy o'rningiz</p>
           <div className="text-5xl font-black text-white relative z-10 mb-2">{classRank}-o'rin</div>
           {cpNeeded > 0 ? (
             <p className="text-emerald-100 text-sm relative z-10 font-medium">{classRank - 1}-o'ringa chiqish uchun <b className="text-white">{cpNeeded} CP</b> kerak.</p>
           ) : (
             <p className="text-emerald-100 text-sm relative z-10 font-medium">Siz peshqadamsiz! 🔥</p>
           )}
           
           <div className="mt-6 pt-6 border-t border-emerald-400/30 relative z-10">
              <p className="text-emerald-100 text-xs mb-2">Maktab bo'yicha sinfingiz o'rni:</p>
              <div className="flex items-center text-white font-bold"><Trophy className="w-4 h-4 mr-2"/> Maktabda {schoolRank}-o'rinda</div>
           </div>
        </div>
      </div>
    </div>
  );
}

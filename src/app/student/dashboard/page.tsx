"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Award, TrendingUp, BellRing } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (studentId) {
      supabase.from('profiles').select('*').eq('id', studentId).single().then(({data}) => setStudent(data));
      supabase.from('notifications').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(3).then(({data}) => setNotifications(data || []));
    }
  }, []);

  if (!student) return <div>Yuklanmoqda...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      {/* KARTA */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-blue-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div>
            <p className="text-blue-200 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchi Paneli</p>
            <h1 className="text-3xl font-black mb-2">{student.full_name}</h1>
            <p className="text-white font-bold flex items-center bg-black/20 w-fit px-4 py-2 rounded-xl backdrop-blur-md shadow-inner">
              <GraduationCap className="w-5 h-5 mr-2 text-amber-300" /> {student.class_name} sinf
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px] text-center shadow-inner">
              <p className="text-blue-200 text-xs mb-1 font-bold uppercase">Balans (PP)</p>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.pp_balance || 0}</div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[120px] text-center shadow-inner">
              <p className="text-blue-200 text-xs mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1" /> {student.cp_score || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MUHIM E'LONLAR */}
      <div className="bg-white dark:bg-[#17212b] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm">
         <h3 className="flex items-center text-slate-900 dark:text-blue-400 font-bold mb-4"><BellRing className="w-5 h-5 mr-2 text-blue-500"/> Muhim E'lonlar (Yangi)</h3>
         <div className="mt-4 space-y-3">
           {notifications.length === 0 ? <p className="text-slate-500">E'lonlar yo'q</p> : notifications.map(notif => (
             <div key={notif.id} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4">
                <h4 className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-1">{notif.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{notif.message}</p>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}

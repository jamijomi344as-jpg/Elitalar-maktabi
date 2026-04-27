"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BookOpen, CheckSquare, LayoutGrid, Square, User, Award, TrendingUp, CheckCircle2, Circle, Clock, FileText, GraduationCap } from "lucide-react";

export default function EducationPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"jadval" | "vazifa">("vazifa");

  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) { router.push('/'); return; }

    const loadData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if(profile) setStudent(profile);

      const { data: hw } = await supabase.from('homeworks').select('*').eq('class_name', profile.class_name).order('created_at', { ascending: false });
      if(hw) setHomeworks(hw);

      const { data: cTasks } = await supabase.from('completed_tasks').select('homework_id').eq('student_id', studentId);
      if(cTasks) setCompletedTasks(cTasks.map(t => t.homework_id));

      const { data: time } = await supabase.from('timetable').select('*').eq('class_name', profile.class_name);
      if(time) setTimetable(time);
    };
    loadData();
  }, [router]);

  const toggleTask = async (hwId: string) => {
    if (completedTasks.includes(hwId)) {
      await supabase.from('completed_tasks').delete().eq('student_id', student.id).eq('homework_id', hwId);
      setCompletedTasks(completedTasks.filter(id => id !== hwId));
    } else {
      await supabase.from('completed_tasks').insert([{ student_id: student.id, homework_id: hwId }]);
      setCompletedTasks([...completedTasks, hwId]);
    }
  };

  if (!student) return <div className="p-10 text-center text-slate-500">Yuklanmoqda...</div>;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 border border-transparent dark:border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div>
            <p className="text-blue-300 dark:text-blue-400 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchi Paneli</p>
            <h1 className="text-3xl font-black mb-2">{student.full_name}</h1>
            <p className="text-blue-200 bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md flex items-center font-medium"><GraduationCap className="w-4 h-4 mr-2"/> Sinf: {student.class_name}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]"><p className="text-xs mb-1 font-bold uppercase text-blue-200">Balans (PP)</p><div className="text-2xl font-black text-amber-400 flex justify-center items-center"><Award className="w-5 h-5 mr-1"/> {student.pp_balance || 0}</div></div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]"><p className="text-xs mb-1 font-bold uppercase text-blue-200">Reyting (CP)</p><div className="text-2xl font-black text-emerald-400 flex justify-center items-center"><TrendingUp className="w-5 h-5 mr-1"/> {student.cp_score || 0}</div></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#17212b] rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden w-full">
        <div className="border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0e1621] p-4 flex flex-wrap gap-2 w-full">
          <button onClick={() => setActiveTab("vazifa")} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center ${activeTab === 'vazifa' ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}><FileText className="w-4 h-4 mr-2" /> Uy vazifasi</button>
          <button onClick={() => setActiveTab("jadval")} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center ${activeTab === 'jadval' ? 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}><LayoutGrid className="w-4 h-4 mr-2" /> Dars jadvali</button>
        </div>

        <div className="p-6">
          {activeTab === "jadval" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Du", "Se", "Ch", "Pa", "Ju", "Sh"].map(day => {
                const dayLessons = timetable.filter(t => t.day_of_week === day).sort((a,b)=>a.lesson_number - b.lesson_number);
                if(dayLessons.length === 0) return null;
                return (
                  <div key={day} className="bg-slate-50 dark:bg-[#0e1621] border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
                     <h4 className="text-blue-600 dark:text-blue-400 font-black uppercase mb-3 border-b border-gray-200 dark:border-slate-800 pb-2">{day}shanba</h4>
                     <div className="space-y-2">
                       {dayLessons.map(l => (
                         <div key={l.id} className="flex gap-3 text-sm">
                           <span className="text-gray-500 font-bold">{l.lesson_number}.</span>
                           <span className="text-gray-800 dark:text-white font-medium">{l.subject}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === "vazifa" && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 mb-6">
                 <h3 className="text-blue-700 dark:text-blue-400 font-black text-lg mb-1"><FileText className="w-5 h-5 inline mr-2" /> Uy vazifalari (Checklist)</h3>
                 <p className="text-blue-600/80 dark:text-blue-300/70 text-sm">O'qituvchi tomonidan berilgan vazifalarni bajarib belgilab boring.</p>
              </div>

              {homeworks.length === 0 ? <p className="text-center py-10 text-gray-400">Vazifalar yo'q</p> : homeworks.map((hw) => {
                const isDone = completedTasks.includes(hw.id);
                return (
                  <div key={hw.id} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 w-full ${isDone ? 'bg-gray-50 dark:bg-[#0e1621] border-gray-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-[#17212b] border-blue-100 dark:border-slate-700 shadow-sm'}`}>
                    <button onClick={() => toggleTask(hw.id)} className={`mt-1 flex-shrink-0 transition-colors ${isDone ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500'}`}>
                      {isDone ? <CheckSquare className="w-7 h-7" /> : <Square className="w-7 h-7" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between mb-1 gap-2">
                        <h3 className={`font-bold text-lg ${isDone ? 'text-gray-500 line-through' : 'text-blue-900 dark:text-white'}`}>{hw.subject} <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md ml-2">{hw.date}</span></h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit border ${isDone ? 'bg-gray-100 dark:bg-slate-800 text-gray-500' : 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900'}`}>
                          <Clock className="w-3 h-3 inline mr-1" /> Muddat: {hw.deadline}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{hw.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Calendar, GraduationCap, Award, Loader2 } from "lucide-react";

export default function EducationPage() {
  const [student, setStudent] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"jadval" | "vazifa">("jadval");
  const [isLoading, setIsLoading] = useState(true);

  // Kunlar ro'yxati (xatosiz va tartibli chiqishi uchun)
  const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return window.location.replace('/');

        // O'quvchini olish
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (!profile) return;
        setStudent(profile);

        // Dars jadvalini olish va dars soati bo'yicha tartiblash
        const { data: schedule } = await supabase
          .from('timetable')
          .select('*')
          .eq('class_name', profile.class_name)
          .order('lesson_number', { ascending: true });
        
        if (schedule) setTimetable(schedule);

        // Uy vazifalarini olish
        const { data: hw } = await supabase
          .from('homeworks')
          .select('*')
          .eq('class_name', profile.class_name)
          .order('date', { ascending: false });
        
        if (hw) setHomeworks(hw);

      } catch (error) {
        console.error("Xatolik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin"/></div>;
  if (!student) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* YUQORI PROFIL KARTASI (Rasmdagidek) */}
      <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
         <div>
            <p className="text-blue-500 font-black text-xs uppercase tracking-widest mb-1">O'quvchi Paneli</p>
            <h1 className="text-3xl font-black text-white mb-3">{student.full_name}</h1>
            <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center w-fit border border-slate-700">
              <GraduationCap className="w-4 h-4 mr-2"/> Sinf: {student.class_name}
            </span>
         </div>
         <div className="flex gap-4">
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl text-center min-w-[120px]">
               <p className="text-slate-400 text-xs font-bold uppercase mb-1">Balans (PP)</p>
               <p className="text-2xl font-black text-amber-500 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.pp_balance || 0}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl text-center min-w-[120px]">
               <p className="text-slate-400 text-xs font-bold uppercase mb-1">Reyting (CP)</p>
               <p className="text-2xl font-black text-emerald-400 flex items-center justify-center">📈 {student.cp_score || 0}</p>
            </div>
         </div>
      </div>

      {/* ASOSIY KONTENT */}
      <div className="bg-[#131B2F] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg min-h-[500px]">
         
         {/* TABLAR */}
         <div className="flex border-b border-slate-800 mb-8">
            <button 
              onClick={() => setActiveTab('vazifa')}
              className={`flex items-center px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'vazifa' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
               <BookOpen className="w-5 h-5 mr-2"/> Uy vazifasi
            </button>
            <button 
              onClick={() => setActiveTab('jadval')}
              className={`flex items-center px-6 py-4 font-bold transition-all border-b-2 ${activeTab === 'jadval' ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
               <Calendar className="w-5 h-5 mr-2"/> Dars jadvali
            </button>
         </div>

         {/* DARS JADVALI KO'RINISHi */}
         {activeTab === 'jadval' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {DAYS.map(day => {
                 // Shu kunga tegishli darslarni ajratib olamiz
                 const dayLessons = timetable.filter(t => t.day_of_week?.toLowerCase() === day.toLowerCase());
                 
                 // Agar bu kunda dars bo'lmasa, uni ko'rsatmaymiz
                 if (dayLessons.length === 0) return null;

                 return (
                   <div key={day} className="bg-[#0B1121] rounded-2xl p-6 border border-slate-800/80 shadow-inner">
                     <h3 className="text-blue-500 font-black text-sm uppercase tracking-widest mb-4 border-b border-slate-800 pb-3">
                       {day}
                     </h3>
                     <ul className="space-y-4">
                        {dayLessons.map(lesson => (
                          <li key={lesson.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                                {lesson.lesson_number}
                              </span>
                              <span className="font-bold text-slate-200">{lesson.subject}</span>
                            </div>
                            {lesson.room && (
                              <span className="text-[10px] font-bold bg-slate-800/80 text-slate-500 px-2 py-1 rounded border border-slate-700">
                                {lesson.room} xona
                              </span>
                            )}
                          </li>
                        ))}
                     </ul>
                   </div>
                 );
               })}
               {timetable.length === 0 && (
                 <div className="col-span-full py-10 text-center text-slate-500 font-bold">
                   Dars jadvali hali tizimga kiritilmagan.
                 </div>
               )}
            </div>
         )}

         {/* UY VAZIFASI KO'RINISHi */}
         {activeTab === 'vazifa' && (
            <div className="space-y-4">
               {homeworks.length > 0 ? homeworks.map(hw => (
                 <div key={hw.id} className="bg-[#0B1121] p-6 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                       <h4 className="text-lg font-black text-white">{hw.subject}</h4>
                       <p className="text-slate-400 font-medium mt-1">{hw.topic}</p>
                       <p className="text-sm text-slate-500 mt-2 bg-slate-800/50 p-3 rounded-xl border border-slate-800/50"> Vazifa: {hw.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-bold mb-2">Muddat: {hw.deadline}</span>
                       <p className="text-xs text-slate-500 font-bold">Berilgan sana: {hw.date}</p>
                    </div>
                 </div>
               )) : (
                 <div className="py-10 text-center text-slate-500 font-bold">
                   Hozircha uy vazifalari yo'q.
                 </div>
               )}
            </div>
         )}

      </div>
    </div>
  );
}

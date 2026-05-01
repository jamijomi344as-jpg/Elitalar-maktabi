"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Star, Award, Clock, Loader2 } from "lucide-react";

export default function StudentDashboardPage() {
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // Eski va yangi kalitlarni ham tekshiradi (xavfsiz usul)
        const sId = localStorage.getItem('user_id') || localStorage.getItem('student_id');
        if (!sId) return;

        const { data } = await supabase.from('profiles').select('*').eq('id', sId).single();
        if (data) setCurrentStudent(data);
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!currentStudent) return null;

  const fullName = currentStudent.full_name || "O'quvchi";
  const firstName = fullName.split(" ")[0] || "O'quvchi";
  const className = currentStudent.class_name || "Sinf yo'q";
  const ppBalance = currentStudent.pp_balance || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {/* KATTA KO'K SALOMLASHISH KARTASI */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="w-48 h-48" /></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {firstName}! 🚀</h1>
          <div className="flex flex-wrap gap-4 mt-6">
            <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-300" /> {className} SINFI
            </span>
            <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner">
              <Star className="w-4 h-4 mr-2" /> BALANS: {ppBalance} PP
            </span>
          </div>
        </div>
      </div>

      {/* DARS JADVALI UCHUN BO'SH KARTA */}
      <div className="bg-white dark:bg-[#0B1121] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center transition-colors">
         <Clock className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4"/>
         <h3 className="text-xl font-bold text-slate-500 dark:text-slate-400">Tez orada bu yerda kunlik darslaringiz chiqadi!</h3>
      </div>
    </div>
  );
}

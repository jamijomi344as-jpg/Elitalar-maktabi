"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Calendar, Award, Star, BookOpen, 
  Clock, ShieldCheck, Key, CheckCircle, LogOut, Settings, Eye, EyeOff 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TeacherDashboard() {
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "timetable" | "grading" | "homeroom" | "settings">("boshqaruv");
  const [isLoading, setIsLoading] = useState(false);

  // LOGIN FORMA VA KO'ZCHA (PAROLNI KO'RSATISH)
  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // KO'ZCHA UCHUN STATE
  
  // BAZADAN KELADIGAN MA'LUMOTLAR
  const [myStudents, setMyStudents] = useState<any[]>([]); 
  const [myTimetable, setMyTimetable] = useState<any[]>([]); 
  const [allClasses, setAllClasses] = useState<any[]>([]); 
  
  // BAHOLASH UCHUN
  const [gradeForm, setGradeForm] = useState({ classId: "", studentId: "", grade: "" });
  const [studentsToGrade, setStudentsToGrade] = useState<any[]>([]);

  // SOZLAMALAR (Parol o'zgartirish)
  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  // ==========================================
  // 1. HAQIQIY LOGIN TEKSHIRUVI
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // BAZADAN QIDIRISH
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginForm.id)
      .eq('password', loginForm.password)
      .eq('role', 'teacher')
      .single();

    if (data) {
      setCurrentTeacher(data); // Topilsa, kiradi
    } else {
      // ESKI YOG'OCH ALERTNI O'CHIRDIK. YANGI, TOZA ALERT:
      alert("ID yoki Parol xato! Direktor bergan ma'lumotni to'g'ri kiriting.");
    }
    setIsLoading(false);
  };

  // ==========================================
  // 2. KIRYOTGANDA MA'LUMOTLARNI TORTISH
  // ==========================================
  useEffect(() => {
    if (currentTeacher) {
      loadTeacherData();
    }
  }, [currentTeacher]);

  const loadTeacherData = async () => {
    setIsLoading(true);
    try {
      if (currentTeacher.homeroom) {
        const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', currentTeacher.homeroom).order('full_name');
        setMyStudents(students || []);
      }
      const { data: schedule } = await supabase.from('timetable').select('*').eq('teacher_id', currentTeacher.id);
      setMyTimetable(schedule || []);

      const { data: classesData } = await supabase.from('classes').select('*').order('name');
      setAllClasses(classesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. BAHOLASH
  // ==========================================
  const handleSelectClassToGrade = async (className: string) => {
    setGradeForm({ ...gradeForm, classId: className, studentId: "" });
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsToGrade(data || []);
  };

  const handleGiveGrade = async () => {
    if(!gradeForm.studentId || !gradeForm.grade) return alert("O'quvchi va bahoni tanlang!");

    const student = studentsToGrade.find(s => s.id === gradeForm.studentId);
    if(!student) return;

    const numericGrade = parseInt(gradeForm.grade);
    let addedCP = 0; let addedPP = 0;

    if(numericGrade === 5) { addedCP = 10; addedPP = 100; }
    else if(numericGrade === 4) { addedCP = 5; addedPP = 50; }
    else if(numericGrade === 3) { addedCP = 0; addedPP = 10; }
    else if(numericGrade === 2) { addedCP = -5; addedPP = 0; }

    const newCP = (student.cp_score || 0) + addedCP;
    const newPP = (student.pp_balance || 0) + addedPP;

    const { error } = await supabase.from('profiles').update({ cp_score: newCP, pp_balance: newPP }).eq('id', student.id);

    if(error) {
      alert("Xatolik: " + error.message);
    } else {
      alert(`Baho qo'yildi! O'quvchi hamyoniga ${addedPP} PP o'tkazildi.`);
      setGradeForm({ ...gradeForm, studentId: "", grade: "" });
      handleSelectClassToGrade(gradeForm.classId); 
    }
  };

  // ==========================================
  // 4. PAROLNI O'ZGARTIRISH
  // ==========================================
  const handleChangePassword = async () => {
    if (newPassword.length < 4) return alert("Parol kamida 4 ta belgi bo'lishi kerak!");
    setIsChanging(true);
    
    const { error } = await supabase.from('profiles').update({ password: newPassword }).eq('id', currentTeacher.id);

    if (!error) {
      alert("Parol muvaffaqiyatli o'zgartirildi!");
      setCurrentTeacher({ ...currentTeacher, password: newPassword });
      setNewPassword("");
      setActiveMenu("boshqaruv");
    }
    setIsChanging(false);
  };

  // ==========================================
  // EKRANLAR
  // ==========================================

  // 1. LOGIN EKRANI
  if (!currentTeacher) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 font-sans p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-8 border-indigo-900 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10"/>
          </div>
          <h2 className="text-3xl font-black text-center mb-2 text-slate-900">USTOZ KIRISH</h2>
          <p className="text-center text-slate-500 font-bold text-xs uppercase mb-8">Elita Meta-Maktab tizimi</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Sizning ID (Masalan: T-1234)" 
              className="w-full p-5 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-black text-center text-lg uppercase"
              onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toUpperCase()})}
            />
            
            {/* KO'ZCHALI PAROL INPUTI */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Maxfiy Parol" 
                className="w-full p-5 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-black text-center text-lg pr-14"
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all text-lg disabled:opacity-50">
              {isLoading ? "TEKSHIRILMOQDA..." : "KIRISH"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. O'QITUVCHI KABINETI
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* YON PANEL (SIDEBAR) */}
      <aside className="w-72 bg-indigo-950 border-r border-indigo-900 flex flex-col h-screen flex-shrink-0 z-20 text-indigo-100 hidden md:flex p-6">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">E</div>
          <span className="text-2xl font-black text-white tracking-tighter italic">TEACHER</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy Panel
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'timetable' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3" /> Dars Jadvalim
          </button>
          <button onClick={() => setActiveMenu("grading")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'grading' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5 hover:text-white'}`}>
            <Award className="w-5 h-5 mr-3" /> Baholash
          </button>
          
          {currentTeacher.homeroom && (
            <button onClick={() => setActiveMenu("homeroom")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'homeroom' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'text-amber-300 hover:bg-white/5 hover:text-white'}`}>
              <Users className="w-5 h-5 mr-3" /> Mening Sinfim
            </button>
          )}

          <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-8 ${activeMenu === 'settings' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5 hover:text-white'}`}>
            <Settings className="w-5 h-5 mr-3" /> Sozlamalar
          </button>
        </nav>

        <button onClick={() => setCurrentTeacher(null)} className="w-full flex items-center justify-center p-4 rounded-2xl text-red-400 font-black hover:bg-red-500/10 transition-colors mt-auto">
          <LogOut className="w-5 h-5 mr-2" /> Chiqish
        </button>
      </aside>

      {/* ASOSIY KONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12">
        
        {/* HEADER */}
        <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-48 h-48" /></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {currentTeacher.full_name} 👋</h1>
            <div className="flex gap-4 mt-6">
              <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center">
                <Star className="w-4 h-4 mr-2 text-amber-300" /> {currentTeacher.bio} Fani
              </span>
              {currentTeacher.homeroom && (
                <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner">
                  <ShieldCheck className="w-4 h-4 mr-2" /> {currentTeacher.homeroom} Rahbari
                </span>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-indigo-600 font-black animate-pulse">BAZADAN YUKLANMOQDA...</div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. ASOSIY PANEL */}
            {activeMenu === "boshqaruv" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><Calendar className="w-8 h-8"/></div>
                  <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Haftalik Darslar</h3>
                  <p className="text-5xl font-black text-slate-900 mt-2">{myTimetable.length} <span className="text-2xl font-bold text-slate-300">soat</span></p>
                </div>
                {currentTeacher.homeroom && (
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6"><Users className="w-8 h-8"/></div>
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Sinfingiz O'quvchilari</h3>
                    <p className="text-5xl font-black text-slate-900 mt-2">{myStudents.length} <span className="text-2xl font-bold text-slate-300">nafar</span></p>
                  </div>
                )}
              </div>
            )}

            {/* 2. DARS JADVALIM */}
            {activeMenu === "timetable" && (
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center"><Clock className="w-6 h-6 mr-3 text-indigo-600"/> Dars Jadvalim</h2>
                {myTimetable.length === 0 ? (
                  <div className="text-center p-12 bg-slate-50 rounded-3xl text-slate-400 font-bold border-2 border-dashed border-slate-200">
                    Sizga hali hech qanday dars biriktirilmagan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {["Du", "Se", "Ch", "Pa", "Ju", "Sh"].map(day => {
                      const dayLessons = myTimetable.filter(t => t.day_of_week === day).sort((a, b) => a.lesson_number - b.lesson_number);
                      if(dayLessons.length === 0) return null;
                      
                      return (
                        <div key={day} className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm bg-slate-50">
                          <div className="bg-indigo-600 p-4 font-black text-white text-center uppercase tracking-widest text-sm">{day}shanba</div>
                          <div className="p-4 space-y-3">
                            {dayLessons.map(lesson => (
                              <div key={lesson.id} className="flex items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black mr-4 text-lg">{lesson.lesson_number}</div>
                                <div>
                                  <p className="font-black text-slate-900 text-lg">{lesson.class_name}</p>
                                  {lesson.room && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lesson.room} xona</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. BAHOLASH */}
            {activeMenu === "grading" && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center"><Award className="w-5 h-5 mr-2 text-indigo-600"/> Baholash Jurnali</h3>
                  <select value={gradeForm.classId} onChange={(e) => handleSelectClassToGrade(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold mb-6 text-slate-700 shadow-sm">
                    <option value="">Sinfni Tanlang</option>
                    {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>

                  {gradeForm.classId && (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {studentsToGrade.length === 0 ? (
                        <p className="text-center text-slate-400 font-bold mt-10">Bu sinfda o'quvchi yo'q</p>
                      ) : (
                        studentsToGrade.map(student => (
                          <button key={student.id} onClick={() => setGradeForm({...gradeForm, studentId: student.id})} className={`w-full text-left p-4 rounded-2xl text-sm font-bold transition-all ${gradeForm.studentId === student.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-100'}`}>
                            {student.full_name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 p-10 flex flex-col justify-center items-center relative">
                  {!gradeForm.studentId ? (
                    <div className="text-center text-slate-300">
                      <Star className="w-24 h-24 mx-auto mb-6 opacity-20" />
                      <p className="font-black text-xl italic tracking-tighter">Chap tomondan o'quvchini tanlang</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm animate-in zoom-in-95">
                      <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">{studentsToGrade.find(s=>s.id === gradeForm.studentId)?.full_name}</h2>
                        <p className="text-indigo-600 font-black uppercase text-xs tracking-widest">{gradeForm.classId} o'quvchisi</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {["5", "4", "3", "2"].map((grade) => (
                           <button key={grade} onClick={() => setGradeForm({...gradeForm, grade})} className={`p-6 rounded-[2rem] border-4 font-black text-4xl transition-all ${gradeForm.grade === grade ? (grade === "5" ? 'bg-emerald-500 border-emerald-600 text-white' : grade === "4" ? 'bg-blue-500 border-blue-600 text-white' : grade === "3" ? 'bg-amber-500 border-amber-600 text-white' : 'bg-red-500 border-red-600 text-white') + ' shadow-xl scale-105' : `bg-white border-slate-100 ${grade === "5" ? 'text-emerald-500 hover:border-emerald-200' : grade === "4" ? 'text-blue-500 hover:border-blue-200' : grade === "3" ? 'text-amber-500 hover:border-amber-200' : 'text-red-500 hover:border-red-200'}`}`}>
                             {grade} <span className="block text-[10px] font-black opacity-80 mt-2 uppercase tracking-widest">{grade === "5" ? "+100 PP | +10 CP" : grade === "4" ? "+50 PP | +5 CP" : grade === "3" ? "+10 PP | 0 CP" : "0 PP | -5 CP"}</span>
                           </button>
                        ))}
                      </div>
                      <button onClick={handleGiveGrade} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-lg tracking-wide">
                        <CheckCircle className="w-6 h-6 mr-3"/> TASDIQLASH
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. MENING SINFIM */}
            {activeMenu === "homeroom" && currentTeacher.homeroom && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-amber-900 flex items-center"><ShieldCheck className="w-6 h-6 mr-3 text-amber-600"/> Mening Sinfim ({currentTeacher.homeroom})</h2>
                  </div>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                        <th className="p-4">O'quvchi ID</th><th className="p-4">Maxfiy Parol</th><th className="p-4">F.I.SH</th><th className="p-4 text-right">Balans (PP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myStudents.length === 0 ? (
                        <tr><td colSpan={4} className="text-center p-12 text-slate-400 font-bold text-lg">Sinfingizda hali o'quvchi yo'q.</td></tr>
                      ) : (
                        myStudents.map(s => (
                          <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-4 font-black text-indigo-600">{s.id}</td>
                            <td className="p-4"><span className="text-xs font-mono font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-lg flex items-center w-fit"><Key className="w-3 h-3 mr-2"/> {s.password}</span></td>
                            <td className="p-4 font-bold text-slate-900">{s.full_name}</td>
                            <td className="p-4 text-right"><span className="font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">{s.pp_balance || 0} PP</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. SOZLAMALAR */}
            {activeMenu === "settings" && (
              <div className="max-w-xl bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mx-auto mt-10">
                <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6"><Settings className="w-8 h-8"/></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Xavfsizlik</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Shaxsiy parolingizni o'zgartiring</p>
                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yangi parol yozing..." className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-6 font-black text-lg outline-none text-center" />
                <button onClick={handleChangePassword} disabled={isChanging} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-lg disabled:opacity-50">
                  {isChanging ? "SAQLANMOQDA..." : "PAROLNI SAQLASH"}
                </button>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

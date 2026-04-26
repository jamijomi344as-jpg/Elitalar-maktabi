"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Calendar, Award, Star, BookOpen, Clock, ShieldCheck, Key, TrendingUp, CheckCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TeacherDashboard() {
  // ==========================================
  // LOGIN SIMULYATSIYASI (Test uchun)
  // ==========================================
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null); // "Kirgan" ustoz

  // ==========================================
  // ASOSIY STATE'LAR
  // ==========================================
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "homeroom" | "timetable" | "grading">("boshqaruv");
  const [isLoading, setIsLoading] = useState(true);

  // Bazadan keladigan ma'lumotlar
  const [myStudents, setMyStudents] = useState<any[]>([]); // Sinf rahbar bo'lsa
  const [myTimetable, setMyTimetable] = useState<any[]>([]); // Darslari
  const [allClasses, setAllClasses] = useState<any[]>([]); // Baholash uchun hamma sinflar
  
  // Baholash formasi
  const [gradeForm, setGradeForm] = useState({ classId: "", studentId: "", grade: "", note: "" });
  const [studentsToGrade, setStudentsToGrade] = useState<any[]>([]);

  // ==========================================
  // BOSHIDAN O'QITUVCHILARNI OLIB KELISH
  // ==========================================
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    const { data: teachers } = await supabase.from('profiles').select('*').eq('role', 'teacher');
    setAllTeachers(teachers || []);
    setIsLoading(false);
  };

  // ==========================================
  // USTOZ "KIRGANDA" UNING MA'LUMOTLARINI TORTISH
  // ==========================================
  useEffect(() => {
    if (currentTeacher) {
      loadTeacherData(currentTeacher);
    }
  }, [currentTeacher]);

  const loadTeacherData = async (teacher: any) => {
    setIsLoading(true);
    try {
      // 1. Sinf rahbarligi bo'yicha o'quvchilari (Parollari bilan)
      if (teacher.homeroom) {
        const { data: students } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', teacher.homeroom).order('full_name');
        setMyStudents(students || []);
      }

      // 2. O'qituvchining dars jadvali
      const { data: schedule } = await supabase.from('timetable').select('*').eq('teacher_id', teacher.id);
      setMyTimetable(schedule || []);

      // 3. Baholash uchun maktabdagi barcha sinflarni olib kelish
      const { data: classes } = await supabase.from('classes').select('*').order('name');
      setAllClasses(classes || []);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Baholash oynasida sinf tanlanganda shu sinf o'quvchilarini tortish
  const handleSelectClassToGrade = async (className: string) => {
    setGradeForm({ ...gradeForm, classId: className, studentId: "" });
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsToGrade(data || []);
  };

  // ==========================================
  // BAHOLASH VA PUL (PP) BERISH LOGIKASI
  // ==========================================
  const handleGiveGrade = async () => {
    if(!gradeForm.studentId || !gradeForm.grade) return alert("O'quvchi va bahoni tanlang!");

    const numericGrade = parseInt(gradeForm.grade);
    // Tizim iqtisodiyoti (Reyting = CP, Pul = PP)
    let addedCP = 0;
    let addedPP = 0;

    if(numericGrade === 5) { addedCP = 10; addedPP = 100; }
    else if(numericGrade === 4) { addedCP = 5; addedPP = 50; }
    else if(numericGrade === 3) { addedCP = 0; addedPP = 10; }
    else if(numericGrade === 2) { addedCP = -5; addedPP = 0; } // 2 baho uchun jarima

    // Bazadan o'quvchini topib, eskisi ustiga yangisini qo'shish
    const student = studentsToGrade.find(s => s.id === gradeForm.studentId);
    if(!student) return;

    const newCP = (student.cp_score || 0) + addedCP;
    const newPP = (student.pp_balance || 0) + addedPP;

    // Supabase'da yangilash (Update)
    const { error } = await supabase.from('profiles').update({
      cp_score: newCP,
      pp_balance: newPP
    }).eq('id', student.id);

    if(error) {
      alert("Xatolik: " + error.message);
    } else {
      alert(`Muvaffaqiyatli! O'quvchiga ${addedPP} PP berildi.`);
      setGradeForm({ ...gradeForm, studentId: "", grade: "", note: "" });
      // Jadvalni yangilash
      handleSelectClassToGrade(gradeForm.classId);
    }
  };

  // ==========================================
  // EKRANLAR
  // ==========================================

  // Agar login qilmagan bo'lsa
  if (!currentTeacher) {
    return (
      <div className="flex h-screen items-center justify-center bg-indigo-50 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8"/></div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Tizimga kirish</h2>
          <p className="text-gray-500 mb-6 text-sm">O'zingizni qaysi o'qituvchi sifatida sinab ko'rmoqchisiz?</p>
          
          {isLoading ? (
            <p className="text-indigo-500 font-bold animate-pulse">Ustozlar qidirilmoqda...</p>
          ) : allTeachers.length === 0 ? (
            <p className="text-red-500 font-bold bg-red-50 p-4 rounded-xl">Direktor hali ustoz qo'shmagan!</p>
          ) : (
            <div className="space-y-3">
              {allTeachers.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setCurrentTeacher(t)}
                  className="w-full p-4 border border-indigo-100 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50 rounded-2xl flex items-center justify-between transition-all group"
                >
                  <div className="text-left">
                    <p className="font-bold text-gray-800 group-hover:text-indigo-700">{t.full_name}</p>
                    <p className="text-xs text-gray-500">{t.bio} {t.homeroom ? `(${t.homeroom} rahbari)` : ''}</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOGINDAN O'TGAN HOLAT
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* ==================== YON PANEL ==================== */}
      <div className="w-64 bg-indigo-950 border-r border-indigo-900 flex flex-col h-screen flex-shrink-0 z-20 text-slate-300 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-indigo-900/50">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-amber-500/30">E</div>
          <span className="text-xl font-black tracking-widest text-white">ELITA <span className="text-[10px] text-amber-400 align-top uppercase">Teacher</span></span>
        </div>

        <div className="p-4 flex flex-col gap-2 mt-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-900/50 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy Panel
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'timetable' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-900/50 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3" /> Dars Jadvalim
          </button>
          <button onClick={() => setActiveMenu("grading")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'grading' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-900/50 hover:text-white'}`}>
            <Award className="w-5 h-5 mr-3" /> Baholash (PP Berish)
          </button>
          
          {/* Faqat Sinf rahbarlari ko'radi */}
          {currentTeacher.homeroom && (
            <button onClick={() => setActiveMenu("homeroom")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'homeroom' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-200 hover:bg-indigo-900/50 hover:text-white'}`}>
              <Users className="w-5 h-5 mr-3" /> Mening Sinfim
            </button>
          )}
        </div>

        <div className="p-4 border-t border-indigo-900/50">
          <button onClick={() => setCurrentTeacher(null)} className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-bold text-sm text-indigo-300 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Chiqish
          </button>
        </div>
      </div>

      {/* ==================== ASOSIY KONTENT ==================== */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
          
          {/* HEADER */}
          <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-32 h-32 text-white" /></div>
            <div className="relative z-10">
              <p className="text-indigo-200 text-sm mb-1 uppercase tracking-wider font-bold">O'qituvchi Paneli</p>
              <h1 className="text-3xl font-black mb-2">Salom, {currentTeacher.full_name} 👋</h1>
              <div className="flex gap-3 mt-4">
                <span className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-md flex items-center">
                  <Star className="w-4 h-4 mr-2 text-amber-300" /> Faningiz: {currentTeacher.bio}
                </span>
                {currentTeacher.homeroom && (
                  <span className="bg-amber-500/80 px-3 py-1.5 rounded-lg text-sm font-bold backdrop-blur-md flex items-center shadow-inner">
                    <ShieldCheck className="w-4 h-4 mr-2" /> {currentTeacher.homeroom} Rahbari
                  </span>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 text-indigo-600 font-bold animate-pulse">Yuklanmoqda...</div>
          ) : (
            <>
              {/* 1. ASOSIY PANEL */}
              {activeMenu === "boshqaruv" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Calendar className="w-6 h-6"/></div>
                    <h3 className="font-bold text-gray-500">Haftalik darslaringiz</h3>
                    <p className="text-3xl font-black text-gray-800 mt-1">{myTimetable.length} <span className="text-lg font-bold text-gray-400">soat</span></p>
                  </div>
                  {currentTeacher.homeroom && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-50">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Users className="w-6 h-6"/></div>
                      <h3 className="font-bold text-gray-500">Sinfingiz o'quvchilari</h3>
                      <p className="text-3xl font-black text-gray-800 mt-1">{myStudents.length} <span className="text-lg font-bold text-gray-400">nafar</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. DARS JADVALIM */}
              {activeMenu === "timetable" && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50 animate-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><Clock className="w-6 h-6 mr-2 text-indigo-600"/> Dars Jadvalim</h2>
                  {myTimetable.length === 0 ? (
                    <div className="text-center p-10 bg-slate-50 rounded-2xl text-gray-400 font-bold border-2 border-dashed border-gray-200">
                      Direktor sizga hali dars qo'ymagan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {["Du", "Se", "Ch", "Pa", "Ju", "Sh"].map(day => {
                        const dayLessons = myTimetable.filter(t => t.day_of_week === day).sort((a, b) => a.lesson_number - b.lesson_number);
                        if(dayLessons.length === 0) return null;
                        
                        return (
                          <div key={day} className="border border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-indigo-50 p-3 border-b border-indigo-100 font-black text-indigo-900 text-center">{day}shanba</div>
                            <div className="p-2 space-y-2">
                              {dayLessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center bg-white p-3 rounded-xl border border-gray-100">
                                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-black mr-3">{lesson.lesson_number}</div>
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{lesson.class_name}</p>
                                    {lesson.room && <p className="text-xs text-gray-500">{lesson.room} xona</p>}
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

              {/* 3. BAHOLASH (IQTISODIYOT) */}
              {activeMenu === "grading" && (
                <div className="bg-white rounded-3xl shadow-sm border border-indigo-50 overflow-hidden animate-in slide-in-from-bottom-4 flex flex-col md:flex-row h-[600px]">
                  
                  {/* Chap tomon: Sinf va O'quvchi tanlash */}
                  <div className="w-full md:w-1/3 bg-slate-50 border-r border-gray-100 p-6 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-indigo-600"/> Baholash</h3>
                    
                    <label className="text-xs font-bold text-gray-500 mb-1">Qaysi sinfga dars o'tdingiz?</label>
                    <select value={gradeForm.classId} onChange={(e) => handleSelectClassToGrade(e.target.value)} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 font-bold mb-4 shadow-sm">
                      <option value="">Sinfni tanlang</option>
                      {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>

                    {gradeForm.classId && (
                      <>
                        <label className="text-xs font-bold text-gray-500 mb-1">Kimga baho qo'yasiz?</label>
                        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-2 space-y-1 scrollbar-thin">
                          {studentsToGrade.length === 0 ? (
                            <p className="text-xs text-center text-gray-400 p-4">Bu sinfda o'quvchi yo'q</p>
                          ) : (
                            studentsToGrade.map(student => (
                              <button key={student.id} onClick={() => setGradeForm({...gradeForm, studentId: student.id})} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-colors ${gradeForm.studentId === student.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 text-gray-700'}`}>
                                {student.full_name}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* O'ng tomon: Baho qo'yish pulti */}
                  <div className="flex-1 p-8 flex flex-col justify-center items-center relative">
                    {!gradeForm.studentId ? (
                      <div className="text-center text-gray-400">
                        <Star className="w-16 h-16 mx-auto mb-4 text-indigo-100" />
                        <p className="font-bold">Chap tomondan o'quvchini tanlang</p>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm animate-in zoom-in-95">
                        <div className="text-center mb-8">
                          <h2 className="text-2xl font-black text-gray-900">{studentsToGrade.find(s=>s.id === gradeForm.studentId)?.full_name}</h2>
                          <p className="text-indigo-500 font-bold">{gradeForm.classId} o'quvchisi</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <button onClick={() => setGradeForm({...gradeForm, grade: "5"})} className={`p-4 rounded-2xl border-2 font-black text-2xl transition-all ${gradeForm.grade === "5" ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-105' : 'bg-white border-gray-200 text-emerald-600 hover:border-emerald-500'}`}>
                            5
                            <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">+100 PP | +10 CP</p>
                          </button>
                          <button onClick={() => setGradeForm({...gradeForm, grade: "4"})} className={`p-4 rounded-2xl border-2 font-black text-2xl transition-all ${gradeForm.grade === "4" ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105' : 'bg-white border-gray-200 text-blue-600 hover:border-blue-500'}`}>
                            4
                            <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">+50 PP | +5 CP</p>
                          </button>
                          <button onClick={() => setGradeForm({...gradeForm, grade: "3"})} className={`p-4 rounded-2xl border-2 font-black text-2xl transition-all ${gradeForm.grade === "3" ? 'bg-amber-500 border-amber-600 text-white shadow-lg scale-105' : 'bg-white border-gray-200 text-amber-600 hover:border-amber-500'}`}>
                            3
                            <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">+10 PP | 0 CP</p>
                          </button>
                          <button onClick={() => setGradeForm({...gradeForm, grade: "2"})} className={`p-4 rounded-2xl border-2 font-black text-2xl transition-all ${gradeForm.grade === "2" ? 'bg-red-500 border-red-600 text-white shadow-lg scale-105' : 'bg-white border-gray-200 text-red-600 hover:border-red-500'}`}>
                            2
                            <p className="text-[10px] font-bold opacity-80 mt-1 uppercase">0 PP | -5 CP</p>
                          </button>
                        </div>
                        <button onClick={handleGiveGrade} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-colors flex items-center justify-center text-lg">
                          <CheckCircle className="w-6 h-6 mr-2"/> Bahoni Tasdiqlash
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* 4. MENING SINFIM (Faqat rahbarlar uchun) */}
              {activeMenu === "homeroom" && currentTeacher.homeroom && (
                <div className="bg-white rounded-3xl shadow-sm border border-amber-100 overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center"><ShieldCheck className="w-6 h-6 mr-2 text-amber-500"/> Mening Sinfim ({currentTeacher.homeroom})</h2>
                      <p className="text-sm text-gray-500 mt-1">Bu yerdagi parollarni o'quvchilaringizga tarqating</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="p-4 text-sm font-bold text-gray-500">ID / Login</th>
                          <th className="p-4 text-sm font-bold text-gray-500">Parol</th>
                          <th className="p-4 text-sm font-bold text-gray-500">F.I.SH</th>
                          <th className="p-4 text-sm font-bold text-gray-500 text-right">Iqtisodiyoti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myStudents.length === 0 ? (
                          <tr><td colSpan={4} className="text-center p-8 text-gray-400 font-bold">Sinfingizda hali o'quvchi yo'q.</td></tr>
                        ) : (
                          myStudents.map(s => (
                            <tr key={s.id} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                              <td className="p-4 font-black text-indigo-600 text-sm">{s.id}</td>
                              <td className="p-4 text-sm font-mono font-black text-red-500 flex items-center bg-red-50/50 w-fit px-2 py-1 rounded"><Key className="w-3 h-3 mr-1"/> {s.password}</td>
                              <td className="p-4 text-sm font-bold text-gray-900">{s.full_name}</td>
                              <td className="p-4 text-right">
                                <div className="inline-flex flex-col items-end">
                                  <span className="font-bold text-amber-600 text-sm">{s.pp_balance || 0} PP</span>
                                  <span className="text-xs font-bold text-emerald-600 mt-0.5">{s.cp_score || 0} Reyting</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </div>
  );
}

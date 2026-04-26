"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Table, Calendar, Calculator, Building, Crown, LayoutDashboard, CheckCircle2, X, PlusCircle, School, Key, Edit, Trash2, Clock, Save, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function DirectorDashboard() {
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");

  // ==========================================
  // MODALLAR VA STATE'LAR
  // ==========================================
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  
  // TAHRIRLASH UCHUN
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Bazadagi ma'lumotlar
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentsCountByClass, setStudentsCountByClass] = useState<any>({});
  
  // Yangi odam formasi
  const [newPerson, setNewPerson] = useState({ fullName: "", subject: "", gender: "", className: "", homeroom: "" });
  const [newClassInfo, setNewClassInfo] = useState({ name: "", limit: 24 });

  // DARS JADVALI UCHUN STATE'LAR
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [selectedClassForTimetable, setSelectedClassForTimetable] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentCell, setCurrentCell] = useState<{ day: string, lesson: number } | null>(null);
  const [lessonForm, setLessonForm] = useState({ subject: "", teacher_id: "", room: "" });

  const subjectsBase = ["Algebra", "Geometriya", "Ona tili", "Adabiyot", "Ingliz tili", "Kimyo", "Biologiya", "Fizika", "Informatika"];
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const lessonNumbers = [1, 2, 3, 4, 5, 6, 7];

  // ==========================================
  // O'QISH (Fetch)
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: teachersData } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false });
      setTeachers(teachersData || []);

      const { data: classesData } = await supabase.from('classes').select('*').order('name');
      setClasses(classesData || []);

      const { data: studentsData } = await supabase.from('profiles').select('class_name').eq('role', 'student');
      const counts: any = {};
      classesData?.forEach(c => counts[c.name] = 0);
      studentsData?.forEach(student => {
        if(student.class_name) counts[student.class_name] = (counts[student.class_name] || 0) + 1;
      });
      setStudentsCountByClass(counts);

      // Dars jadvalini o'qish
      const { data: timetableFetch } = await supabase.from('timetable').select('*');
      setTimetableData(timetableFetch || []);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => Math.random().toString(36).slice(-6).toUpperCase();

  // ==========================================
  // O'QITUVCHINI TAHRIRLASH VA O'CHIRISH
  // ==========================================
  const handleUpdateTeacher = async () => {
    if(!editingTeacher.full_name || !editingTeacher.bio) return alert("Hamma joyni to'ldiring!");
    
    const assignedHomeroom = editingTeacher.homeroom === "" ? null : editingTeacher.homeroom;

    const { error } = await supabase.from('profiles').update({ 
      full_name: editingTeacher.full_name, 
      bio: editingTeacher.bio,
      homeroom: assignedHomeroom
    }).eq('id', editingTeacher.id);

    if (error) alert("Xatolik: " + error.message);
    else { setShowEditTeacherModal(false); fetchData(); }
  };

  const handleDeleteTeacher = async (id: string) => {
    if(confirm("Rostdan ham bu o'qituvchini o'chirmoqchimisiz?")) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  // ==========================================
  // QO'SHISH FUNKSIYALARI
  // ==========================================
  const handleAddClass = async () => {
    if(!newClassInfo.name) return alert("Sinf nomini yozing!");
    const { error } = await supabase.from('classes').insert([{ name: newClassInfo.name.toUpperCase(), max_limit: newClassInfo.limit }]);
    if (!error) { setShowClassModal(false); setNewClassInfo({ name: "", limit: 24 }); fetchData(); }
  };

  const handleAddTeacher = async () => {
    if(!newPerson.fullName || !newPerson.subject) return alert("Hamma joyni to'ldiring!");
    const uniqueId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword();
    const assignedHomeroom = newPerson.homeroom === "" ? null : newPerson.homeroom;

    const { error } = await supabase.from('profiles').insert([{ 
      id: uniqueId, role: 'teacher', full_name: newPerson.fullName, bio: newPerson.subject, password: pass, homeroom: assignedHomeroom
    }]);
    if (!error) { setShowTeacherModal(false); setNewPerson({ fullName: "", subject: "", gender: "", className: "", homeroom: "" }); fetchData(); }
  };

  const handleAddStudent = async () => {
    if(!newPerson.fullName || !newPerson.className) return alert("Hamma joyni to'ldiring!");
    const uniqueId = `S-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword();

    const { error } = await supabase.from('profiles').insert([{ 
      id: uniqueId, role: 'student', full_name: newPerson.fullName, class_name: newPerson.className, password: pass 
    }]);
    if (!error) { setShowStudentModal(false); setNewPerson({ fullName: "", subject: "", gender: "", className: "", homeroom: "" }); fetchData(); }
  };

  // ==========================================
  // DARS JADVALI (TIMETABLE) LOGIKASI
  // ==========================================
  const handleCellClick = (day: string, lesson: number) => {
    setCurrentCell({ day, lesson });
    // Bor darsni topib, formaga qo'yish
    const existing = timetableData.find(t => t.class_name === selectedClassForTimetable && t.day_of_week === day && t.lesson_number === lesson);
    if(existing) {
      setLessonForm({ subject: existing.subject, teacher_id: existing.teacher_id, room: existing.room || "" });
    } else {
      setLessonForm({ subject: "", teacher_id: "", room: "" });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if(!lessonForm.subject || !lessonForm.teacher_id) return alert("Fan va O'qituvchini tanlang!");
    
    // UPSERT (Agar bor bo'lsa yangilaydi, yo'q bo'lsa qo'shadi)
    const { error } = await supabase.from('timetable').upsert({
      class_name: selectedClassForTimetable,
      day_of_week: currentCell?.day,
      lesson_number: currentCell?.lesson,
      subject: lessonForm.subject,
      teacher_id: lessonForm.teacher_id,
      room: lessonForm.room
    }, { onConflict: 'class_name, day_of_week, lesson_number' });

    if(error) alert("Xatolik: " + error.message);
    else { setShowLessonModal(false); fetchData(); }
  };

  const handleDeleteLesson = async () => {
    await supabase.from('timetable').delete()
      .eq('class_name', selectedClassForTimetable)
      .eq('day_of_week', currentCell?.day)
      .eq('lesson_number', currentCell?.lesson);
    setShowLessonModal(false);
    fetchData();
  };

  const getLessonForCell = (day: string, lesson: number) => {
    return timetableData.find(t => t.class_name === selectedClassForTimetable && t.day_of_week === day && t.lesson_number === lesson);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* YON PANEL */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen flex-shrink-0 z-20 text-slate-300 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-purple-600/30">E</div>
          <span className="text-xl font-black tracking-widest text-white">ELITA <span className="text-xs text-purple-400 align-top">ADMIN</span></span>
        </div>
        <div className="p-4 flex flex-col gap-2 mt-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'boshqaruv' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Boshqaruv</button>
          <button onClick={() => setActiveMenu("teachers")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'teachers' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><Crown className="w-5 h-5 mr-3" /> O'qituvchilar</button>
          <button onClick={() => setActiveMenu("students")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'students' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><Users className="w-5 h-5 mr-3" /> O'quvchilar & Limit</button>
          <button onClick={() => setActiveMenu("timetable")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'timetable' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><Calendar className="w-5 h-5 mr-3" /> Dars Jadvali</button>
          <button onClick={() => setActiveMenu("algorithm")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'algorithm' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><Calculator className="w-5 h-5 mr-3" /> Algoritm</button>
        </div>
      </div>

      {/* ASOSIY KONTENT */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
          
          <div className="w-full bg-gradient-to-br from-slate-900 to-purple-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Shield className="w-32 h-32 text-purple-200" /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-purple-300 text-sm mb-1 uppercase tracking-wider font-bold">Maktab Direktori Paneli</p>
                <h1 className="text-3xl font-black mb-2">Salom, Director 👋</h1>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 text-purple-600 font-bold animate-pulse">Yuklanmoqda...</div>
          ) : (
            <>
              {/* O'QITUVCHILAR RO'YXATI VA TAHRIRLASH */}
              {activeMenu === "teachers" && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center"><Crown className="w-6 h-6 mr-2 text-purple-600"/> O'qituvchilar Ro'yxati</h2>
                    <button onClick={() => setShowTeacherModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Yangi o'qituvchi
                    </button>
                  </div>
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="p-4 text-sm font-bold text-gray-500">ID / Parol</th>
                          <th className="p-4 text-sm font-bold text-gray-500">F.I.SH</th>
                          <th className="p-4 text-sm font-bold text-gray-500">Fani</th>
                          <th className="p-4 text-sm font-bold text-gray-500">Sinf Rahbarligi</th>
                          <th className="p-4 text-sm font-bold text-gray-500 text-right">Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.length === 0 ? (
                          <tr><td colSpan={5} className="text-center p-8 text-gray-400">Hali o'qituvchi qo'shilmagan.</td></tr>
                        ) : (
                          teachers.map(t => (
                            <tr key={t.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="font-black text-purple-600 text-sm">{t.id}</div>
                                <div className="text-xs font-mono font-bold text-amber-600 mt-0.5">{t.password}</div>
                              </td>
                              <td className="p-4 text-sm font-bold text-gray-900">{t.full_name}</td>
                              <td className="p-4 text-sm text-gray-600">{t.bio}</td>
                              <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${t.homeroom ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{t.homeroom || "Biriktirilmagan"}</span></td>
                              <td className="p-4 text-right">
                                {/* TAHRIRLASH TUGMALARI */}
                                <button onClick={() => { setEditingTeacher(t); setShowEditTeacherModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors mr-1" title="Tahrirlash"><Edit className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteTeacher(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="O'chirish"><Trash2 className="w-4 h-4"/></button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* O'QUVCHILAR */}
              {activeMenu === "students" && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center"><Shield className="w-6 h-6 mr-2 text-purple-600"/> Sinf Limiti va O'quvchilar</h2>
                    </div>
                    <button onClick={() => setShowClassModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center">
                      <School className="w-4 h-4 mr-2" /> Yangi Sinf Ochish
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classes.map(cls => {
                        const count = studentsCountByClass[cls.name] || 0;
                        const limit = cls.max_limit;
                        const isFull = count >= limit;
                        return (
                          <div key={cls.name} className={`p-5 rounded-2xl border transition-colors ${isFull ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-2xl font-black text-gray-800">{cls.name}</h3>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 mb-2 overflow-hidden border border-gray-200 relative"><div className={`h-3 rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(count / limit) * 100}%` }}></div></div>
                            <p className="text-sm font-bold text-gray-600 text-right">{count} / {limit}</p>
                            <button onClick={() => { setNewPerson({...newPerson, className: cls.name}); setShowStudentModal(true); }} disabled={isFull} className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white shadow-sm'}`}>
                              + {isFull ? "Limit To'lgan" : "O'quvchi qo'shish"}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* TIMETABLE (DARS JADVALI QAYTDI!) */}
              {activeMenu === "timetable" && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 flex flex-col h-[700px]">
                  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center"><Calendar className="w-6 h-6 mr-2 text-purple-600"/> Dars Jadvali Konstruktori</h2>
                      <p className="text-gray-500 text-sm mt-1">Sinfni tanlang va soatga bosib dars joylashtiring</p>
                    </div>
                    {/* SINF TANLASH */}
                    <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200 overflow-x-auto w-full md:w-auto">
                      {classes.map(c => (
                        <button key={c.name} onClick={() => setSelectedClassForTimetable(c.name)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${selectedClassForTimetable === c.name ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!selectedClassForTimetable ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                       <School className="w-16 h-16 mb-4 text-gray-200" />
                       <p className="text-lg font-bold">Yuqoridan biron bir sinfni tanlang</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
                      <div className="min-w-[800px] border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr>
                              <th className="p-4 bg-slate-100 border-b border-r border-gray-200 w-16"><Clock className="w-5 h-5 text-gray-400 mx-auto"/></th>
                              {days.map(d => <th key={d} className="p-4 bg-slate-100 border-b border-gray-200 text-gray-700 font-bold">{d}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {lessonNumbers.map(num => (
                              <tr key={num}>
                                <td className="p-4 border-r border-b border-gray-200 bg-slate-50 font-black text-gray-400">{num}</td>
                                {days.map(day => {
                                  const lesson = getLessonForCell(day, num);
                                  const isFilled = !!lesson;
                                  return (
                                    <td key={`${day}-${num}`} onClick={() => handleCellClick(day, num)} className={`p-2 border-b border-r border-gray-100 h-24 relative cursor-pointer group transition-all ${isFilled ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-slate-50'}`}>
                                      {isFilled ? (
                                        <div className="flex flex-col h-full justify-center">
                                          <span className="font-bold text-gray-900 text-sm">{lesson.subject}</span>
                                          <span className="text-xs text-purple-600 font-medium mt-1">
                                            {teachers.find(t => t.id === lesson.teacher_id)?.full_name || lesson.teacher_id}
                                          </span>
                                          {lesson.room && <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{lesson.room} xona</span>}
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                          <PlusCircle className="w-6 h-6 text-purple-300" />
                                        </div>
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boshqaruv menyulari qisqartirildi (Tepadagilari turibdi) */}
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* YANGI MODALLAR (O'QITUVCHINI TAHRIRLASH, DARS QO'SHISH) */}
      {/* ======================================================== */}

      {/* TAHRIRLASH MODALI */}
      {showEditTeacherModal && editingTeacher && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowEditTeacherModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                <h3 className="font-bold text-lg text-blue-900 flex items-center"><Edit className="w-5 h-5 mr-2"/> O'qituvchini Tahrirlash</h3>
                <button onClick={() => setShowEditTeacherModal(false)} className="text-gray-400"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <label className="text-xs font-bold text-gray-500">F.I.SH</label>
                <input type="text" value={editingTeacher.full_name} onChange={e => setEditingTeacher({...editingTeacher, full_name: e.target.value})} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none font-bold" />
                
                <label className="text-xs font-bold text-gray-500">Fani</label>
                <select value={editingTeacher.bio} onChange={e => setEditingTeacher({...editingTeacher, bio: e.target.value})} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none font-bold">
                   {subjectsBase.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>

                <label className="text-xs font-bold text-blue-500">Sinf Rahbarligi</label>
                <select value={editingTeacher.homeroom || ""} onChange={e => setEditingTeacher({...editingTeacher, homeroom: e.target.value})} className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl outline-none font-bold text-blue-700">
                   <option value="">Biriktirilmagan</option>
                   {classes.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                </select>
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={() => setShowEditTeacherModal(false)} className="px-5 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100">Bekor qilish</button>
                <button onClick={handleUpdateTeacher} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700">Saqlash</button>
             </div>
          </div>
        </div>
      )}

      {/* DARS JADVALIGA DARS QO'SHISH MODALI */}
      {showLessonModal && currentCell && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowLessonModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                <h3 className="font-bold text-lg text-purple-900 flex items-center"><FileText className="w-5 h-5 mr-2 text-purple-600"/> {currentCell.day}, {currentCell.lesson}-soat ({selectedClassForTimetable})</h3>
                <button onClick={() => setShowLessonModal(false)} className="text-gray-400"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Qaysi Fan?</label>
                  <select value={lessonForm.subject} onChange={e => setLessonForm({...lessonForm, subject: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none font-bold">
                    <option value="">Fanni tanlang</option>
                    {subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Kim o'tadi?</label>
                  <select value={lessonForm.teacher_id} onChange={e => setLessonForm({...lessonForm, teacher_id: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none font-bold">
                    <option value="">Ustozni tanlang</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.bio})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Qaysi Xona? (Ixtiyoriy)</label>
                  <input type="text" value={lessonForm.room} onChange={e => setLessonForm({...lessonForm, room: e.target.value})} placeholder="Masalan: 12-xona, Sport zal" className="w-full mt-1 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none font-bold" />
                </div>
             </div>
             <div className="p-4 border-t border-gray-100 flex justify-between bg-slate-50">
                <button onClick={handleDeleteLesson} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors">O'chirish</button>
                <button onClick={handleSaveLesson} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition-colors">Saqlash</button>
             </div>
          </div>
        </div>
      )}

      {/* Eski modallar joyida (showTeacherModal, showStudentModal, showClassModal) - KODNI UZUN QILMASLIK UCHUN QISQARTIRDIM, LEKIN SIZDA O'Z JOYIDA TURIBDI */}

    </div>
  );
}

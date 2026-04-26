"use client";

import { useState, useEffect } from "react";
import { 
  Users, UserPlus, Shield, Calendar, Calculator, Building, 
  Crown, LayoutDashboard, CheckCircle2, X, PlusCircle, 
  School, Key, Edit, Trash2, Clock, Save, FileText, Search
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function DirectorDashboard() {
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");
  const [isLoading, setIsLoading] = useState(true);

  // MODALLAR STATE
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // DATA STATE
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [studentsCountByClass, setStudentsCountByClass] = useState<any>({});
  
  // FORMA STATE
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [newPerson, setNewPerson] = useState({ fullName: "", subject: "", homeroom: "", className: "" });
  const [newClassInfo, setNewClassInfo] = useState({ name: "", limit: 24 });
  const [selectedClassForTimetable, setSelectedClassForTimetable] = useState<string | null>(null);
  const [currentCell, setCurrentCell] = useState<{ day: string, lesson: number } | null>(null);
  const [lessonForm, setLessonForm] = useState({ subject: "", teacher_id: "", room: "" });

  const subjectsBase = ["Algebra", "Geometriya", "Ona tili", "Adabiyot", "Ingliz tili", "Kimyo", "Biologiya", "Fizika", "Informatika", "Tarix", "Tarbiya"];
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const lessonNumbers = [1, 2, 3, 4, 5, 6, 7];

  // TASODIFIY PAROL GENERATORI
  const generatePassword = () => Math.random().toString(36).slice(-6).toUpperCase();

  // ==========================================
  // MA'LUMOTLARNI YUKLASH
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. O'qituvchilar
      const { data: tData } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false });
      setTeachers(tData || []);

      // 2. Sinflar
      const { data: cData } = await supabase.from('classes').select('*').order('name');
      setClasses(cData || []);

      // 3. O'quvchilar soni (Sinf bo'yicha)
      const { data: sData } = await supabase.from('profiles').select('class_name').eq('role', 'student');
      const counts: any = {};
      cData?.forEach(c => counts[c.name] = 0);
      sData?.forEach(s => { if(s.class_name) counts[s.class_name] = (counts[s.class_name] || 0) + 1; });
      setStudentsCountByClass(counts);

      // 4. Dars jadvali
      const { data: timeData } = await supabase.from('timetable').select('*');
      setTimetableData(timeData || []);

    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // AMALLAR (CRUD)
  // ==========================================

  const handleAddClass = async () => {
    if(!newClassInfo.name) return alert("Sinf nomini kiriting!");
    const { error } = await supabase.from('classes').insert([{ name: newClassInfo.name.toUpperCase(), max_limit: newClassInfo.limit }]);
    if(!error) { setShowClassModal(false); setNewClassInfo({name: "", limit: 24}); fetchData(); }
  };

  // YANGILANGAN VA XATONI USHLOVCHI O'QITUVCHI QO'SHISH FUNKSIYASI
  const handleAddTeacher = async () => {
    if(!newPerson.fullName || !newPerson.subject) return alert("Hamma joyni to'ldiring!");
    const uniqueId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword();
    const assignedHomeroom = newPerson.homeroom === "" ? null : newPerson.homeroom;

    const { error } = await supabase.from('profiles').insert([{ 
      id: uniqueId, role: 'teacher', full_name: newPerson.fullName, bio: newPerson.subject, password: pass, homeroom: assignedHomeroom
    }]);
    
    if (error) {
      // XATONI EKRANGA CHIQARAMIZ
      alert("BAZAGA SAQLASHDAGI XATOLIK: " + error.message);
    } else {
      alert(`Muvaffaqiyatli! O'qituvchi ID: ${uniqueId} | Parol: ${pass}`);
      setShowTeacherModal(false); 
      setNewPerson({ fullName: "", subject: "", homeroom: "", className: "" }); 
      fetchData(); 
    }
  };

  const handleUpdateTeacher = async () => {
    const { error } = await supabase.from('profiles').update({
      full_name: editingTeacher.full_name,
      bio: editingTeacher.bio,
      homeroom: editingTeacher.homeroom || null
    }).eq('id', editingTeacher.id);
    if(!error) { setShowEditTeacherModal(false); fetchData(); }
  };

  const handleDeleteTeacher = async (id: string) => {
    if(confirm("Ushbu o'qituvchini tizimdan butunlay o'chirmoqchimisiz?")) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  const handleAddStudent = async () => {
    const pass = generatePassword();
    const id = `S-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabase.from('profiles').insert([{
      id, role: 'student', full_name: newPerson.fullName, class_name: newPerson.className, password: pass
    }]);
    if(!error) {
      alert(`O'quvchi qo'shildi!\nID: ${id}\nParol: ${pass}`);
      setShowStudentModal(false);
      fetchData();
    }
  };

  const handleSaveLesson = async () => {
    const { error } = await supabase.from('timetable').upsert({
      class_name: selectedClassForTimetable,
      day_of_week: currentCell?.day,
      lesson_number: currentCell?.lesson,
      subject: lessonForm.subject,
      teacher_id: lessonForm.teacher_id,
      room: lessonForm.room
    }, { onConflict: 'class_name, day_of_week, lesson_number' });
    if(!error) { setShowLessonModal(false); fetchData(); }
  };

  const deleteLesson = async () => {
    await supabase.from('timetable').delete()
      .eq('class_name', selectedClassForTimetable)
      .eq('day_of_week', currentCell?.day)
      .eq('lesson_number', currentCell?.lesson);
    setShowLessonModal(false);
    fetchData();
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-slate-400 p-6 hidden md:flex flex-col border-r border-slate-800">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">E</div>
          <span className="text-2xl font-black text-white tracking-tighter italic">ELITA</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-900 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3"/> Boshqaruv
          </button>
          <button onClick={() => setActiveMenu("teachers")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'teachers' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-900 hover:text-white'}`}>
            <Crown className="w-5 h-5 mr-3"/> O'qituvchilar
          </button>
          <button onClick={() => setActiveMenu("students")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'students' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-900 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3"/> O'quvchilar
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'timetable' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-900 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3"/> Dars Jadvali
          </button>
          <button onClick={() => setActiveMenu("algorithm")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'algorithm' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-slate-900 hover:text-white'}`}>
            <Calculator className="w-5 h-5 mr-3"/> Algoritm & Moliya
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Direktor Paneli</h1>
            <p className="text-slate-500 font-medium mt-1">Elita Meta-Education tizimi boshqaruvi</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 px-6">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tizim holati</p>
                  <p className="text-emerald-500 font-bold text-sm flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Baza Ulangan</p>
               </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center font-black text-indigo-600 animate-pulse">MA'LUMOTLAR YUKLANMOQDA...</div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. BOSHQARUV (Stats) */}
            {activeMenu === "boshqaruv" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                  <Crown className="w-10 h-10 text-indigo-600 mb-4"/>
                  <h3 className="text-slate-400 font-bold text-sm uppercase">O'qituvchilar</h3>
                  <p className="text-5xl font-black text-slate-900 mt-2">{teachers.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                  <School className="w-10 h-10 text-blue-600 mb-4"/>
                  <h3 className="text-slate-400 font-bold text-sm uppercase">Jami Sinflar</h3>
                  <p className="text-5xl font-black text-slate-900 mt-2">{classes.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                  <Calculator className="w-10 h-10 text-emerald-600 mb-4"/>
                  <h3 className="text-slate-400 font-bold text-sm uppercase">Oylik Byudjet</h3>
                  <p className="text-5xl font-black text-slate-900 mt-2">100K <span className="text-xl">PP</span></p>
                </div>
              </div>
            )}

            {/* 2. O'QITUVCHILAR */}
            {activeMenu === "teachers" && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Crown className="text-indigo-600"/> Ustozlar Ro'yxati</h2>
                  <button onClick={() => setShowTeacherModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <UserPlus className="w-5 h-5"/> Yangi O'qituvchi
                  </button>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                        <th className="p-4">ID / Parol</th>
                        <th className="p-4">To'liq F.I.SH</th>
                        <th className="p-4">Mutaxassisligi</th>
                        <th className="p-4">Sinf Rahbarligi</th>
                        <th className="p-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(t => (
                        <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                          <td className="p-4">
                            <div className="font-black text-indigo-600 text-sm">{t.id}</div>
                            <div className="text-[10px] font-mono font-bold text-amber-600 uppercase flex items-center gap-1"><Key className="w-3 h-3"/> {t.password}</div>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{t.full_name}</td>
                          <td className="p-4 text-sm text-slate-500 font-medium">{t.bio}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.homeroom ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                              {t.homeroom || "Yo'q"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => { setEditingTeacher(t); setShowEditTeacherModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all mr-1"><Edit className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteTeacher(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. O'QUVCHILAR & SINFLAR */}
            {activeMenu === "students" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-black text-slate-900">Sinflar va Joylar</h2>
                   <button onClick={() => setShowClassModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                    <PlusCircle className="w-5 h-5"/> Yangi Sinf Ochish
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map(cls => {
                    const count = studentsCountByClass[cls.name] || 0;
                    const isFull = count >= cls.max_limit;
                    return (
                      <div key={cls.name} className={`bg-white p-8 rounded-[3rem] shadow-sm border ${isFull ? 'border-red-100 bg-red-50/20' : 'border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-4xl font-black text-slate-900">{cls.name}</h3>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isFull ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {isFull ? "TO'LGAN" : "BO'SH JOY BOR"}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${(count/cls.max_limit)*100}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                          <span>O'quvchilar</span>
                          <span>{count} / {cls.max_limit}</span>
                        </div>
                        <button onClick={() => { setNewPerson({...newPerson, className: cls.name}); setShowStudentModal(true); }} disabled={isFull} className="w-full mt-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                          + O'QUVCHI QO'SHISH
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. DARS JADVALI */}
            {activeMenu === "timetable" && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">Dars Jadvali Konstruktori</h2>
                     <p className="text-slate-400 font-medium">Sinfni tanlang va jadvalni to'ldiring</p>
                   </div>
                   <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2">
                     {classes.map(c => (
                       <button key={c.name} onClick={() => setSelectedClassForTimetable(c.name)} className={`px-6 py-3 rounded-xl font-black text-sm whitespace-nowrap transition-all ${selectedClassForTimetable === c.name ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                         {c.name}
                       </button>
                     ))}
                   </div>
                </div>

                {!selectedClassForTimetable ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-300">
                    <Calendar className="w-20 h-20 mb-4 opacity-20"/>
                    <p className="text-xl font-bold italic">Tepadagi ro'yxatdan biron bir sinfni tanlang</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto p-8">
                    <table className="w-full border-collapse border border-slate-100">
                      <thead>
                        <tr>
                          <th className="p-4 bg-slate-50 border border-slate-100 w-20"><Clock className="w-5 h-5 mx-auto text-slate-300"/></th>
                          {days.map(d => <th key={d} className="p-4 bg-slate-50 border border-slate-100 text-slate-400 font-black uppercase text-xs tracking-widest">{d}shanba</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {lessonNumbers.map(num => (
                          <tr key={num}>
                            <td className="p-4 border border-slate-100 text-center font-black text-slate-300 bg-slate-50/30 text-lg">{num}</td>
                            {days.map(day => {
                              const lesson = timetableData.find(t => t.class_name === selectedClassForTimetable && t.day_of_week === day && t.lesson_number === num);
                              return (
                                <td key={day+num} onClick={() => { setCurrentCell({day, lesson: num}); setLessonForm({subject: lesson?.subject || "", teacher_id: lesson?.teacher_id || "", room: lesson?.room || ""}); setShowLessonModal(true); }} className={`p-2 border border-slate-100 h-32 w-44 cursor-pointer transition-all hover:bg-indigo-50/50 group relative`}>
                                  {lesson ? (
                                    <div className="h-full flex flex-col justify-center bg-indigo-50/80 rounded-2xl p-3 border border-indigo-100">
                                      <p className="font-black text-slate-900 text-sm leading-tight">{lesson.subject}</p>
                                      <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase">{teachers.find(t=>t.id === lesson.teacher_id)?.full_name || "Noma'lum"}</p>
                                      <span className="absolute bottom-2 right-2 text-[9px] font-black text-slate-300 uppercase">{lesson.room}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100"><PlusCircle className="text-indigo-200"/></div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 5. ALGORITM & MOLIYA */}
            {activeMenu === "algorithm" && (
              <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Calculator className="w-64 h-64"/></div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-5xl font-black italic tracking-tighter mb-6">ELITA IQTISODIYOTI</h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                    Sizning maktabingizda moliya va rag'batlantirish tizimi to'liq avtomatlashtirilgan. 
                    Har oyning birinchi sanasida tizim sinflar o'rnini aniqlaydi va **100,000 PP** jamg'armani o'quvchilarning o'rtacha bahosiga qarab taqsimlaydi.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-12">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-1">1-o'rin (Elita)</p>
                        <p className="text-3xl font-black italic">40,000 PP</p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">2-o'rin</p>
                        <p className="text-3xl font-black italic">30,000 PP</p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">3-o'rin</p>
                        <p className="text-3xl font-black italic">18,000 PP</p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <p className="text-red-400 font-black text-xs uppercase tracking-widest mb-1">4-o'rin</p>
                        <p className="text-3xl font-black italic">12,000 PP</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem]">
                     <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2/></div>
                     <p className="text-emerald-400 font-bold">Avtomatik tarqatish yoqilgan. Keyingi to'lov: 1-may.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ==========================================
          MODALLAR (OYNAYI JAHON)
      ========================================== */}

      {/* YANGI O'QITUVCHI */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowTeacherModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                 <h3 className="text-xl font-black">Yangi O'qituvchi Qo'shish</h3>
                 <button onClick={() => setShowTeacherModal(false)}><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="F.I.SH (Masalan: Alimov B.)" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600" value={newPerson.fullName} onChange={e => setNewPerson({...newPerson, fullName: e.target.value})} />
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none text-slate-500" value={newPerson.subject} onChange={e => setNewPerson({...newPerson, subject: e.target.value})}>
                    <option value="">Fanni Tanlang</option>
                    {subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <select className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold outline-none border-2 border-blue-100" value={newPerson.homeroom} onChange={e => setNewPerson({...newPerson, homeroom: e.target.value})}>
                    <option value="">Sinf Rahbarligi (Ixtiyoriy)</option>
                    {classes.map(c => <option key={c.name} value={c.name}>{c.name} Rahbari</option>)}
                 </select>
                 <p className="text-[10px] font-black text-amber-600 uppercase text-center mt-4 tracking-widest">Parol tizim tomonidan avtomatik yaratiladi</p>
                 <button onClick={handleAddTeacher} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all mt-4">BAZAGA QO'SHISH</button>
              </div>
           </div>
        </div>
      )}

      {/* TAHRIRLASH O'QITUVCHI */}
      {showEditTeacherModal && editingTeacher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowEditTeacherModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-blue-900">Ma'lumotlarni Tahrirlash</h3>
                 <button onClick={() => setShowEditTeacherModal(false)}><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={editingTeacher.full_name} onChange={e => setEditingTeacher({...editingTeacher, full_name: e.target.value})} />
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={editingTeacher.bio} onChange={e => setEditingTeacher({...editingTeacher, bio: e.target.value})}>
                    {subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <select className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold outline-none border-2 border-blue-100" value={editingTeacher.homeroom || ""} onChange={e => setEditingTeacher({...editingTeacher, homeroom: e.target.value})}>
                    <option value="">Biriktirilmagan</option>
                    {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                 </select>
                 <button onClick={handleUpdateTeacher} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all mt-4">SAQLASH</button>
              </div>
           </div>
        </div>
      )}

      {/* YANGI SINF */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowClassModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black italic">Yangi Sinf Ochish</h3>
              </div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="Sinf Nomi (Masalan: 9-A)" className="w-full p-4 bg-slate-100 rounded-2xl font-black text-center uppercase text-2xl outline-none" value={newClassInfo.name} onChange={e => setNewClassInfo({...newClassInfo, name: e.target.value})} />
                 <input type="number" placeholder="O'quvchilar Limiti" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-center outline-none" value={newClassInfo.limit} onChange={e => setNewClassInfo({...newClassInfo, limit: Number(e.target.value)})} />
                 <button onClick={handleAddClass} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl transition-all">SINFNI YARATISH</button>
              </div>
           </div>
        </div>
      )}

      {/* YANGI O'QUVCHI */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowStudentModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-emerald-900">Yangi O'quvchi ({newPerson.className})</h3>
                 <button onClick={() => setShowStudentModal(false)}><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="O'quvchi F.I.SH" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={newPerson.fullName} onChange={e => setNewPerson({...newPerson, fullName: e.target.value})} />
                 <button onClick={handleAddStudent} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all">MAKTAGBA QO'SHISH</button>
              </div>
           </div>
        </div>
      )}

      {/* DARS JADVALIGA DARS QO'SHISH MODALI */}
      {showLessonModal && currentCell && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLessonModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-indigo-900">{currentCell.day}, {currentCell.lesson}-soat</h3>
                 <button onClick={() => setShowLessonModal(false)}><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={lessonForm.subject} onChange={e => setLessonForm({...lessonForm, subject: e.target.value})}>
                    <option value="">Fanni Tanlang</option>
                    {subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={lessonForm.teacher_id} onChange={e => setLessonForm({...lessonForm, teacher_id: e.target.value})}>
                    <option value="">Ustozni Tanlang</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                 </select>
                 <input type="text" placeholder="Xona (Masalan: 12-xona)" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={lessonForm.room} onChange={e => setLessonForm({...lessonForm, room: e.target.value})} />
                 <div className="flex gap-3 pt-4">
                    <button onClick={deleteLesson} className="flex-1 py-4 bg-red-100 text-red-600 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all text-xs">O'CHIRISH</button>
                    <button onClick={handleSaveLesson} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">SAQLASH</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

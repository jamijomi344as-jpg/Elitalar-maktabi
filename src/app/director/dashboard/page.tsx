"use client";

import { useState, useEffect } from "react";
import { 
  Users, UserPlus, Shield, Calendar, Calculator, 
  Crown, LayoutDashboard, CheckCircle2, X, PlusCircle, 
  School, Edit, Trash2, Search, ArrowLeft, MessageSquare, Send, CheckCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function DirectorDashboard() {
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");
  const [isLoading, setIsLoading] = useState(true);

  // MODALLAR
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);

  // MUROJAAT JAVOBI UCHUN STATE
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // BAZA
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]); 
  const [feedbacks, setFeedbacks] = useState<any[]>([]); 
  
  const [selectedClassView, setSelectedClassView] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null); 
  const [newPerson, setNewPerson] = useState({ fullName: "", subject: "", homeroom: "", className: "" });
  const [newClassInfo, setNewClassInfo] = useState({ name: "", limit: 24 });

  const generatePassword = () => Math.random().toString(36).slice(-6).toUpperCase();

  // ==========================================
  // YUKLASH
  // ==========================================
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: tData } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false });
      setTeachers(tData || []);

      const { data: cData } = await supabase.from('classes').select('*').order('name');
      setClasses(cData || []);

      const { data: sData } = await supabase.from('profiles').select('*').eq('role', 'student').order('full_name');
      setAllStudents(sData || []);

      const { data: fData } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
      setFeedbacks(fData || []);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const getStudentsCount = (className: string) => allStudents.filter(s => s.class_name === className).length;

  // ==========================================
  // AMALLAR (CRUD)
  // ==========================================
  const handleAddClass = async () => {
    if(!newClassInfo.name) return alert("Sinf nomini kiriting!");
    const { error } = await supabase.from('classes').insert([{ name: newClassInfo.name.toUpperCase(), max_limit: newClassInfo.limit }]);
    if(!error) { setShowClassModal(false); setNewClassInfo({name: "", limit: 24}); fetchData(); }
  };

  const handleAddTeacher = async () => {
    if(!newPerson.fullName || !newPerson.subject) return alert("Hamma joyni to'ldiring!");
    const uniqueId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword();
    const assignedHomeroom = newPerson.homeroom === "" ? null : newPerson.homeroom;

    const { error } = await supabase.from('profiles').insert([{ id: uniqueId, role: 'teacher', full_name: newPerson.fullName, bio: newPerson.subject, password: pass, homeroom: assignedHomeroom }]);
    if (!error) {
      alert(`Muvaffaqiyatli! ID: ${uniqueId} | Parol: ${pass}`);
      setShowTeacherModal(false); setNewPerson({ fullName: "", subject: "", homeroom: "", className: "" }); fetchData(); 
    }
  };

  const handleAddStudent = async () => {
    const pass = generatePassword();
    const id = `S-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabase.from('profiles').insert([{ id, role: 'student', full_name: newPerson.fullName, class_name: newPerson.className, password: pass }]);
    if(!error) { alert(`O'quvchi qo'shildi!\nID: ${id}\nParol: ${pass}`); setShowStudentModal(false); fetchData(); }
  };

  const handleUpdateStudent = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: editingStudent.full_name, class_name: editingStudent.class_name }).eq('id', editingStudent.id);
    if(!error) { setShowEditStudentModal(false); fetchData(); }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if(confirm(`Diqqat! ${name} maktabdan butunlay o'chirib yuboriladi. Davom etasizmi?`)) { await supabase.from('profiles').delete().eq('id', id); fetchData(); }
  };

  const handleDeleteFeedback = async (id: string) => {
    if(confirm("Bu murojaatni o'chirib yuborasizmi?")) { await supabase.from('feedbacks').delete().eq('id', id); fetchData(); }
  };

  // ==========================================
  // JAVOB YUBORISH ALGORITMI
  // ==========================================
  const handleSendReply = async () => {
    if (!replyText.trim()) return alert("Javob matnini yozing!");
    setIsReplying(true);

    // 1. Murojaat jadvalidagi statusini "javob berildi" ga o'zgartirish va matnni saqlash
    const { error: fError } = await supabase.from('feedbacks')
      .update({ status: 'javob_berildi', answer: replyText })
      .eq('id', replyModal.id);

    // 2. Agar foydalanuvchi anonim bo'lmasa, unga Bildirishnoma (Notification) yuboramiz
    if (!fError && replyModal.sender_id) {
      await supabase.from('notifications').insert([{
        user_id: replyModal.sender_id,
        title: "Direktordan javob keldi",
        message: replyText
      }]);
    }

    alert("Javob foydalanuvchi paneliga yuborildi!");
    setReplyModal(null);
    setReplyText("");
    setIsReplying(false);
    fetchData(); // Ma'lumotlarni yangilash
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
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><LayoutDashboard className="w-5 h-5 mr-3"/> Boshqaruv</button>
          <button onClick={() => setActiveMenu("teachers")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'teachers' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><Crown className="w-5 h-5 mr-3"/> O'qituvchilar</button>
          <button onClick={() => setActiveMenu("students")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'students' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><Users className="w-5 h-5 mr-3"/> O'quvchilar</button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="flex justify-between items-center mb-10">
          <div><h1 className="text-4xl font-black text-slate-900 tracking-tight">Direktor Paneli</h1><p className="text-slate-500 font-medium mt-1">Elita Meta-Education tizimi</p></div>
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center font-black text-indigo-600 animate-pulse">MA'LUMOTLAR YUKLANMOQDA...</div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. BOSHQARUV (Stats + Murojaatlar) */}
            {activeMenu === "boshqaruv" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <Crown className="w-10 h-10 text-indigo-600 mb-4"/><h3 className="text-slate-400 font-bold text-sm uppercase">O'qituvchilar</h3><p className="text-5xl font-black text-slate-900 mt-2">{teachers.length}</p>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <School className="w-10 h-10 text-blue-600 mb-4"/><h3 className="text-slate-400 font-bold text-sm uppercase">Jami Sinflar</h3><p className="text-5xl font-black text-slate-900 mt-2">{classes.length}</p>
                  </div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                    <Calculator className="w-10 h-10 text-emerald-600 mb-4"/><h3 className="text-slate-400 font-bold text-sm uppercase">Oylik Byudjet</h3><p className="text-5xl font-black text-slate-900 mt-2">100K <span className="text-xl">PP</span></p>
                  </div>
                </div>

                {/* MUROJAATLAR RO'YXATI */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><MessageSquare className="text-indigo-600"/> Kelib tushgan Murojaatlar</h2>
                    <span className="bg-indigo-100 text-indigo-600 font-black px-3 py-1 rounded-full text-sm">{feedbacks.length} ta</span>
                  </div>
                  
                  <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                    {feedbacks.length === 0 ? (
                      <div className="text-center p-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">Hozircha murojaatlar yo'q.</div>
                    ) : (
                      feedbacks.map(f => (
                        <div 
                           key={f.id} 
                           onClick={() => setReplyModal(f)} 
                           className={`p-6 rounded-3xl border flex justify-between items-start gap-4 hover:shadow-md transition-shadow cursor-pointer ${f.status === 'javob_berildi' ? 'bg-white border-slate-200 opacity-60' : 'bg-slate-50 border-indigo-100'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`font-black text-sm px-3 py-1 rounded-lg ${f.is_anonymous ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                {f.is_anonymous ? 'Yashirin Murojaat' : f.sender_name}
                              </span>
                              {f.status === 'javob_berildi' && <span className="text-xs font-bold text-emerald-500 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Javob berilgan</span>}
                              <span className="text-xs font-bold text-slate-400 ml-auto">{new Date(f.created_at).toLocaleString('uz-UZ')}</span>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{f.message}</p>
                            
                            {/* Agar direktor avval javob yozgan bo'lsa, u pastda ko'rinib turadi */}
                            {f.answer && (
                              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm font-medium">
                                <span className="font-bold text-emerald-600 block mb-1">Sizning javobingiz:</span>
                                {f.answer}
                              </div>
                            )}
                          </div>
                          
                          {/* Murojaatni o'chirish tugmasi */}
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteFeedback(f.id); }} className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all flex-shrink-0">
                             <Trash2 className="w-5 h-5"/>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. O'QUVCHILAR & SINFLAR */}
            {activeMenu === "students" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {selectedClassView ? (
                  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedClassView(null)} className="p-3 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"><ArrowLeft className="w-5 h-5"/></button>
                        <h2 className="text-3xl font-black text-slate-900">{selectedClassView} Sinf O'quvchilari</h2>
                      </div>
                      <button onClick={() => { setNewPerson({...newPerson, className: selectedClassView}); setShowStudentModal(true); }} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                        <PlusCircle className="w-5 h-5"/> Yangi O'quvchi
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto p-4">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                            <th className="p-4">O'quvchi ID</th><th className="p-4">F.I.SH</th><th className="p-4 text-center">Balans (PP)</th><th className="p-4 text-right">Amallar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allStudents.filter(s => s.class_name === selectedClassView).length === 0 ? (
                            <tr><td colSpan={4} className="text-center p-12 text-slate-400 font-bold border-2 border-dashed border-slate-50 rounded-3xl m-4">Bu sinfda o'quvchilar yo'q.</td></tr>
                          ) : (
                            allStudents.filter(s => s.class_name === selectedClassView).map((student) => (
                              <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-black text-indigo-600 w-32">{student.id}</td>
                                <td className="p-4 font-bold text-slate-900">{student.full_name}</td>
                                <td className="p-4 text-center"><span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg font-black text-sm">{student.pp_balance || 0} PP</span></td>
                                <td className="p-4 text-right">
                                  <button onClick={() => { setEditingStudent(student); setShowEditStudentModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all mr-1" title="Tahrirlash"><Edit className="w-5 h-5"/></button>
                                  <button onClick={() => handleDeleteStudent(student.id, student.full_name)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Maktabdan haydash"><Trash2 className="w-5 h-5"/></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-black text-slate-900">Maktab Sinflari</h2>
                      <button onClick={() => setShowClassModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"><PlusCircle className="w-5 h-5"/> Yangi Sinf Ochish</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {classes.map(cls => {
                        const count = getStudentsCount(cls.name);
                        const isFull = count >= cls.max_limit;
                        return (
                          <div key={cls.name} className={`bg-white p-8 rounded-[3rem] shadow-sm border transition-all hover:shadow-md ${isFull ? 'border-red-100 bg-red-50/10' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-6 cursor-pointer group" onClick={() => setSelectedClassView(cls.name)}>
                              <h3 className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center">{cls.name} <Search className="w-6 h-6 ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400"/></h3>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isFull ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{isFull ? "TO'LGAN" : "BO'SH JOY BOR"}</div>
                            </div>
                            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-8"><span>O'quvchilar</span><span>{count} / {cls.max_limit}</span></div>
                            <button onClick={() => setSelectedClassView(cls.name)} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black hover:bg-indigo-600 hover:text-white transition-all">SINFNI KO'RISH</button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================= */}
      {/* JAVOB YUBORISH MODALI */}
      {/* ======================================= */}
      {replyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setReplyModal(null)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-indigo-900">Murojaatga Javob Yozish</h3>
                 <button onClick={() => setReplyModal(null)} className="text-indigo-400 hover:text-indigo-700"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 
                 {/* Murojaatning asil matni */}
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{replyModal.is_anonymous ? "Yashirin foydalanuvchi:" : replyModal.sender_name + ":"}</span>
                    <p className="text-sm font-medium text-slate-700">{replyModal.message}</p>
                 </div>
                 
                 {/* Javob yozish inputi */}
                 <textarea 
                    rows={4} 
                    placeholder="Sizning javobingiz..." 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-bold outline-none resize-none"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                 ></textarea>

                 <button onClick={handleSendReply} disabled={isReplying} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50">
                    {isReplying ? "YUBORILMOQDA..." : <><Send className="w-5 h-5 mr-2"/> JAVOBNI YUBORISH</>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* O'QUVCHINI TAHRIRLASH MODALI */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowEditStudentModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                 <h3 className="text-xl font-black text-blue-900">O'quvchini tahrirlash</h3>
                 <button onClick={() => setShowEditStudentModal(false)}><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">F.I.SH</label>
                 <input type="text" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={editingStudent.full_name} onChange={e => setEditingStudent({...editingStudent, full_name: e.target.value})} />
                 
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Sinfini o'zgartirish</label>
                 <select className="w-full p-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold outline-none border-2 border-indigo-100" value={editingStudent.class_name} onChange={e => setEditingStudent({...editingStudent, class_name: e.target.value})}>
                    {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                 </select>
                 <button onClick={handleUpdateStudent} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all mt-4">SAQLASH</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

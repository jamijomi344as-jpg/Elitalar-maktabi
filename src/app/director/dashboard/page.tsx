"use client";

import { useState, useEffect } from "react";
import { 
  Users, UserPlus, Shield, Calendar, Calculator, 
  Crown, LayoutDashboard, CheckCircle2, X, PlusCircle, 
  School, Edit, Trash2, Search, ArrowLeft, MessageSquare, 
  Send, CheckCircle, Key, Clock, Wand2, AlertTriangle, Settings2, FileText, Info
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import { generateTimetable } from "@/lib/timetableAlgorithm";

export default function DirectorDashboard() {
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // MAXSUS BILDIRISHNOMALAR (ALERT VA CONFIRM O'RNIGA)
  // ==========================================
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // 4 soniyadan keyin o'chadi
  };

  // ALGORITM VA YUKLAMALAR UCHUN STATE
  const [isGenerating, setIsGenerating] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [workloadForm, setWorkloadForm] = useState({ class_name: "", subject: "", teacher_id: "", hours: 2 });

  // MODALLAR
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [replyModal, setReplyModal] = useState<any>(null);

  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // BAZA
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]); 
  const [feedbacks, setFeedbacks] = useState<any[]>([]); 
  const [timetableData, setTimetableData] = useState<any[]>([]);
  
  const [selectedClassView, setSelectedClassView] = useState<string | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null); 
  const [newPerson, setNewPerson] = useState({ fullName: "", subject: "", homeroom: "", className: "" });
  const [newClassInfo, setNewClassInfo] = useState({ name: "", limit: 24 });

  // DARS JADVALI
  const [selectedClassForTimetable, setSelectedClassForTimetable] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState("1-chorak");
  const [termStartDate, setTermStartDate] = useState("02.09.2025");
  const [termEndDate, setTermEndDate] = useState("03.11.2025");

  const [currentCell, setCurrentCell] = useState<{ day: string, lesson: number } | null>(null);
  const [lessonForm, setLessonForm] = useState({ subject: "", teacher_id: "", room: "" });

  const subjectsBase = [
    "Algebra", "Geometriya", "Ona tili", "Adabiyot", "Ingliz tili", "Rus tili", 
    "Kimyo", "Biologiya", "Fizika", "Informatika", "O'zbekiston tarixi", "Jahon tarixi", 
    "Geografiya", "Tarbiya", "Davlat va huquq asoslari", "Iqtisodiyot", 
    "Jismoniy tarbiya", "Chizmachilik", "Texnologiya", "Sinf soati", "Kelajak soati"
  ].sort(); 

  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const lessonNumbers = [1, 2, 3, 4, 5, 6]; 

  const generatePassword = () => Math.random().toString(36).slice(-6).toUpperCase();

  useEffect(() => { 
    fetchData(); 
    const savedWorkloads = localStorage.getItem('elita_workloads');
    if (savedWorkloads) setWorkloads(JSON.parse(savedWorkloads));
  }, []);

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
      const { data: timeData } = await supabase.from('timetable').select('*');
      setTimetableData(timeData || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const getStudentsCount = (className: string) => allStudents.filter(s => s.class_name === className).length;

  useEffect(() => {
    if(selectedTerm === '1-chorak') { setTermStartDate("02.09.2025"); setTermEndDate("03.11.2025"); }
    else if(selectedTerm === '2-chorak') { setTermStartDate("10.11.2025"); setTermEndDate("27.12.2025"); }
    else if(selectedTerm === '3-chorak') { setTermStartDate("11.01.2026"); setTermEndDate("20.03.2026"); }
    else if(selectedTerm === '4-chorak') { setTermStartDate("28.03.2026"); setTermEndDate("25.05.2026"); }
  }, [selectedTerm]);

  // ==========================================
  // YUKLAMA (O'QUV REJA)
  // ==========================================
  const handleAddWorkload = () => {
    if (!workloadForm.class_name || !workloadForm.subject || !workloadForm.teacher_id || workloadForm.hours <= 0) {
      return showToast("Barcha maydonlarni to'g'ri to'ldiring!", "error");
    }
    const newW = { id: Date.now().toString(), ...workloadForm };
    const updated = [...workloads, newW];
    setWorkloads(updated);
    localStorage.setItem('elita_workloads', JSON.stringify(updated));
    setWorkloadForm({...workloadForm, teacher_id: "", subject: "", hours: 2}); 
    showToast("Yuklama muvaffaqiyatli qo'shildi!");
  };

  const handleDeleteWorkload = (id: string) => {
    const updated = workloads.filter(w => w.id !== id);
    setWorkloads(updated);
    localStorage.setItem('elita_workloads', JSON.stringify(updated));
    showToast("Yuklama o'chirildi!");
  };

  // ==========================================
  // AVTOMATIK DARS JADVALI YARATISH
  // ==========================================
  const handleAutoGenerate = async () => {
    if (workloads.length === 0) {
      showToast("Jadval tuzish uchun avval 'Dars Yuklamalari' bo'limidan o'qituvchilarga soatlarini bo'lib bering!", "error");
      setShowWorkloadModal(true);
      return;
    }

    setConfirmDialog({
      message: "Diqqat! Joriy chorakdagi eski jadvallar o'chirilib, yangi avtomatik jadval tuziladi. Davom etasizmi?",
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsGenerating(true);

        await supabase.from('timetable').delete().eq('term', selectedTerm);

        const requests = workloads.map(w => ({
           className: w.class_name, 
           subject: w.subject, 
           teacherId: w.teacher_id, 
           hoursPerWeek: w.hours 
        }));

        const newSchedule = generateTimetable(requests);

        const insertData = newSchedule.map(s => ({
           class_name: s.class_name, day_of_week: s.day_of_week, lesson_number: s.lesson_number,
           subject: s.subject, teacher_id: s.teacher_id, room: s.room, term: selectedTerm, start_date: termStartDate, end_date: termEndDate
        }));

        if(insertData.length > 0) {
          await supabase.from('timetable').insert(insertData);
          showToast("Algoritm jadvalni muvaffaqiyatli tuzdi!", "success");
        } else {
          showToast("Jadval tuza olmadim. Joy yetarli emas yoki xatolik yuz berdi.", "error");
        }
        
        setIsGenerating(false); 
        fetchData();
      }
    });
  };

  const handleSaveLesson = async () => {
    if(!lessonForm.subject || !lessonForm.teacher_id) {
      return showToast("Fan va Ustozni tanlang!", "error");
    }

    const isBusy = timetableData.find(t => 
      t.term === selectedTerm && 
      t.day_of_week === currentCell?.day && 
      t.lesson_number === currentCell?.lesson && 
      t.teacher_id === lessonForm.teacher_id && 
      t.class_name !== selectedClassForTimetable
    );

    if (isBusy) {
      const teacherName = teachers.find(t => t.id === lessonForm.teacher_id)?.full_name;
      setConflictWarning(`🔴 KONFLIKT: Ustoz ${teacherName} ayni shu vaqtda ${isBusy.class_name} sinfida dars o'tadi.`);
      return; 
    }

    setConflictWarning(null); 

    const existing = timetableData.find(t => t.class_name === selectedClassForTimetable && t.day_of_week === currentCell?.day && t.lesson_number === currentCell?.lesson && t.term === selectedTerm);

    if (existing) {
       await supabase.from('timetable').update({ subject: lessonForm.subject, teacher_id: lessonForm.teacher_id, room: lessonForm.room, start_date: termStartDate, end_date: termEndDate }).eq('id', existing.id);
    } else {
       await supabase.from('timetable').insert([{ 
         class_name: selectedClassForTimetable, day_of_week: currentCell?.day, lesson_number: currentCell?.lesson, 
         subject: lessonForm.subject, teacher_id: lessonForm.teacher_id, room: lessonForm.room, term: selectedTerm, start_date: termStartDate, end_date: termEndDate
       }]);
    }
    showToast("Dars muvaffaqiyatli saqlandi!");
    setShowLessonModal(false); 
    fetchData();
  };

  const deleteLesson = async () => {
    const existing = timetableData.find(t => t.class_name === selectedClassForTimetable && t.day_of_week === currentCell?.day && t.lesson_number === currentCell?.lesson && t.term === selectedTerm);
    if(existing) {
      await supabase.from('timetable').delete().eq('id', existing.id);
      showToast("Dars jadvaldan o'chirildi!");
    }
    setShowLessonModal(false); 
    fetchData();
  };

  // ==========================================
  // CRUD AMALLAR
  // ==========================================
  const handleAddClass = async () => {
    if(!newClassInfo.name) return showToast("Sinf nomini kiriting!", "error");
    const { error } = await supabase.from('classes').insert([{ name: newClassInfo.name.toUpperCase(), max_limit: newClassInfo.limit }]);
    if(!error) { 
      showToast("Sinf muvaffaqiyatli yaratildi!");
      setShowClassModal(false); 
      setNewClassInfo({name: "", limit: 24}); 
      fetchData(); 
    } else {
      showToast(error.message, "error");
    }
  };

  const handleAddTeacher = async () => {
    if(!newPerson.fullName || !newPerson.subject) return showToast("Barcha maydonlarni to'ldiring!", "error");
    const uniqueId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword();
    const assignedHomeroom = newPerson.homeroom === "" ? null : newPerson.homeroom;
    
    const { error } = await supabase.from('profiles').insert([{ id: uniqueId, role: 'teacher', full_name: newPerson.fullName, bio: newPerson.subject, password: pass, homeroom: assignedHomeroom }]);
    
    if (!error) { 
      showToast(`O'qituvchi qo'shildi! ID: ${uniqueId}`); 
      setShowTeacherModal(false); 
      setNewPerson({ fullName: "", subject: "", homeroom: "", className: "" }); 
      fetchData(); 
    } else {
      showToast(error.message, "error");
    }
  };

  const handleUpdateTeacher = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: editingTeacher.full_name, bio: editingTeacher.bio, homeroom: editingTeacher.homeroom || null }).eq('id', editingTeacher.id);
    if(!error) { 
      showToast("Ustoz ma'lumotlari saqlandi!");
      setShowEditTeacherModal(false); 
      fetchData(); 
    } else {
      showToast(error.message, "error");
    }
  };

  const handleDeleteTeacher = (id: string) => {
    setConfirmDialog({
      message: "Ushbu o'qituvchini tizimdan butunlay o'chirib yubormoqchimisiz?",
      onConfirm: async () => {
        setConfirmDialog(null);
        const { error } = await supabase.from('profiles').delete().eq('id', id); 
        if(!error) {
          showToast("O'qituvchi o'chirildi!");
          fetchData(); 
        } else {
          showToast("O'CHIRISH MUMKIN EMAS! Uning darslari yoki murojaatlari mavjud.", "error");
        }
      }
    });
  };

  const handleAddStudent = async () => {
    if(!newPerson.fullName || !newPerson.className) return showToast("Barcha maydonlarni to'ldiring!", "error");
    const pass = generatePassword();
    const id = `S-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabase.from('profiles').insert([{ id, role: 'student', full_name: newPerson.fullName, class_name: newPerson.className, password: pass }]);
    
    if(!error) { 
      showToast(`O'quvchi qo'shildi! ID: ${id}`); 
      setShowStudentModal(false); 
      setNewPerson({ fullName: "", subject: "", homeroom: "", className: "" }); 
      fetchData(); 
    } else {
      showToast(error.message, "error");
    }
  };

  const handleUpdateStudent = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: editingStudent.full_name, class_name: editingStudent.class_name }).eq('id', editingStudent.id);
    if(!error) { 
      showToast("O'quvchi ma'lumotlari yangilandi!");
      setShowEditStudentModal(false); 
      fetchData(); 
    } else {
      showToast(error.message, "error");
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setConfirmDialog({
      message: `Diqqat! O'quvchi ${name} maktabdan chetlashtiriladi. Davom etasizmi?`,
      onConfirm: async () => {
        setConfirmDialog(null);
        const { error } = await supabase.from('profiles').delete().eq('id', id); 
        if(!error) {
          showToast("O'quvchi o'chirildi!");
          fetchData();
        } else {
          showToast("Xatolik yuz berdi: " + error.message, "error");
        }
      }
    });
  };

  const handleDeleteFeedback = (id: string) => {
    setConfirmDialog({
      message: "Ushbu murojaatni butunlay o'chirib yuborasizmi?",
      onConfirm: async () => {
        setConfirmDialog(null);
        const { error } = await supabase.from('feedbacks').delete().eq('id', id); 
        if(!error) {
          showToast("Murojaat o'chirildi!");
          fetchData();
        } else {
          showToast("Xatolik yuz berdi: " + error.message, "error");
        }
      }
    });
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return showToast("Javob matnini yozing!", "error");
    setIsReplying(true);
    const { error: fError } = await supabase.from('feedbacks').update({ status: 'javob_berildi', answer: replyText }).eq('id', replyModal.id);
    
    if (!fError && replyModal.sender_id) {
      await supabase.from('notifications').insert([{ user_id: replyModal.sender_id, title: "Direktordan javob keldi", message: replyText }]);
    }
    
    if(!fError) { 
      showToast("Javob foydalanuvchiga yuborildi!"); 
      setReplyModal(null); 
      setReplyText(""); 
    } else {
      showToast("Xatolik: " + fError.message, "error");
    }
    setIsReplying(false); 
    fetchData(); 
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      
      {/* ========================================== */}
      {/* CUSTOM TOAST NOTIFICATION UI */}
      {/* ========================================== */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl font-bold text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}
          {toast.message}
        </div>
      )}

      {/* ========================================== */}
      {/* CUSTOM CONFIRM DIALOG UI */}
      {/* ========================================== */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10"/>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Tasdiqlang!</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Yo'q, qaytish</button>
              <button onClick={confirmDialog.onConfirm} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-colors">Ha, bajarilsin</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-slate-400 p-6 hidden md:flex flex-col border-r border-slate-800 relative z-10">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">E</div>
          <span className="text-2xl font-black text-white tracking-tighter italic">ELITA</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><LayoutDashboard className="w-5 h-5 mr-3"/> Boshqaruv</button>
          <button onClick={() => setActiveMenu("teachers")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'teachers' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><Crown className="w-5 h-5 mr-3"/> O'qituvchilar</button>
          <button onClick={() => setActiveMenu("students")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'students' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><Users className="w-5 h-5 mr-3"/> O'quvchilar</button>
          <button onClick={() => setActiveMenu("timetable")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'timetable' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><Calendar className="w-5 h-5 mr-3"/> Dars Jadvali</button>
          <button onClick={() => setActiveMenu("algorithm")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'algorithm' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-900 hover:text-white'}`}><Calculator className="w-5 h-5 mr-3"/> Algoritm & Moliya</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative z-0">
        <header className="flex justify-between items-center mb-10">
          <div><h1 className="text-4xl font-black text-slate-900 tracking-tight">Direktor Paneli</h1><p className="text-slate-500 font-medium mt-1">Elita Meta-Education tizimi boshqaruvi</p></div>
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center font-black text-indigo-600 animate-pulse">MA'LUMOTLAR YUKLANMOQDA...</div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {activeMenu === "boshqaruv" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"><Crown className="w-10 h-10 text-indigo-600 mb-4"/><h3 className="text-slate-400 font-bold text-sm uppercase">O'qituvchilar</h3><p className="text-5xl font-black text-slate-900 mt-2">{teachers.length}</p></div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"><School className="w-10 h-10 text-blue-600 mb-4"/><h3 className="text-slate-400 font-bold text-sm uppercase">Jami Sinflar</h3><p className="text-5xl font-black text-slate-900 mt-2">{classes.length}</p></div>
                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100"><Calculator className="w-10 h-10 text-emerald-600 mb-4"/><h3 className="text-slate-400 font-bold text-sm uppercase">Oylik Byudjet</h3><p className="text-5xl font-black text-slate-900 mt-2">100K <span className="text-xl">PP</span></p></div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><MessageSquare className="text-indigo-600"/> Kelib tushgan Murojaatlar</h2><span className="bg-indigo-100 text-indigo-600 font-black px-3 py-1 rounded-full text-sm">{feedbacks.length} ta</span></div>
                  <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                    {feedbacks.length === 0 ? (
                      <div className="text-center p-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">Hozircha murojaatlar yo'q.</div>
                    ) : (
                      feedbacks.map(f => (
                        <div key={f.id} onClick={() => setReplyModal(f)} className={`p-6 rounded-3xl border flex justify-between items-start gap-4 hover:shadow-md transition-shadow cursor-pointer ${f.status === 'javob_berildi' ? 'bg-white border-slate-200 opacity-60' : 'bg-slate-50 border-indigo-100'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2"><span className={`font-black text-sm px-3 py-1 rounded-lg ${f.is_anonymous ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'}`}>{f.is_anonymous ? 'Yashirin Murojaat' : f.sender_name}</span>{f.status === 'javob_berildi' && <span className="text-xs font-bold text-emerald-500 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Javob berilgan</span>}<span className="text-xs font-bold text-slate-400 ml-auto">{new Date(f.created_at).toLocaleString('uz-UZ')}</span></div>
                            <p className="text-slate-700 font-medium leading-relaxed">{f.message}</p>
                            {f.answer && <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm font-medium"><span className="font-bold text-emerald-600 block mb-1">Sizning javobingiz:</span>{f.answer}</div>}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteFeedback(f.id); }} className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all flex-shrink-0"><Trash2 className="w-5 h-5"/></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeMenu === "teachers" && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Crown className="text-indigo-600"/> Ustozlar Ro'yxati</h2><button onClick={() => setShowTeacherModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"><UserPlus className="w-5 h-5"/> Yangi O'qituvchi</button></div>
                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left">
                    <thead><tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50"><th className="p-4">ID / Parol</th><th className="p-4">F.I.SH</th><th className="p-4">Mutaxassisligi</th><th className="p-4">Sinf Rahbarligi</th><th className="p-4 text-right">Amallar</th></tr></thead>
                    <tbody>
                      {teachers.map(t => (
                        <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                          <td className="p-4"><div className="font-black text-indigo-600 text-sm">{t.id}</div><div className="text-[10px] font-mono font-bold text-amber-600 uppercase flex items-center gap-1"><Key className="w-3 h-3"/> {t.password}</div></td>
                          <td className="p-4 font-bold text-slate-900">{t.full_name}</td><td className="p-4 text-sm text-slate-500 font-medium">{t.bio}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.homeroom ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>{t.homeroom || "Yo'q"}</span></td>
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

            {activeMenu === "students" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                {selectedClassView ? (
                  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-4"><button onClick={() => setSelectedClassView(null)} className="p-3 bg-white shadow-sm border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"><ArrowLeft className="w-5 h-5"/></button><h2 className="text-3xl font-black text-slate-900">{selectedClassView} Sinf O'quvchilari</h2></div>
                      <button onClick={() => { setNewPerson({...newPerson, className: selectedClassView}); setShowStudentModal(true); }} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"><PlusCircle className="w-5 h-5"/> Yangi O'quvchi</button>
                    </div>
                    <div className="overflow-x-auto p-4">
                      <table className="w-full text-left">
                        <thead><tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50"><th className="p-4">O'quvchi ID / Parol</th><th className="p-4">F.I.SH</th><th className="p-4 text-center">Balans (PP)</th><th className="p-4 text-right">Amallar</th></tr></thead>
                        <tbody>
                          {allStudents.filter(s => s.class_name === selectedClassView).length === 0 ? (
                            <tr><td colSpan={4} className="text-center p-12 text-slate-400 font-bold border-2 border-dashed border-slate-50 rounded-3xl m-4">Bu sinfda o'quvchilar yo'q.</td></tr>
                          ) : (
                            allStudents.filter(s => s.class_name === selectedClassView).map((student) => (
                              <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="p-4"><div className="font-black text-indigo-600">{student.id}</div><div className="text-[10px] font-mono font-bold text-amber-600 uppercase flex items-center gap-1"><Key className="w-3 h-3"/> {student.password}</div></td>
                                <td className="p-4 font-bold text-slate-900">{student.full_name}</td><td className="p-4 text-center"><span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg font-black text-sm">{student.pp_balance || 0} PP</span></td>
                                <td className="p-4 text-right">
                                  <button onClick={() => { setEditingStudent(student); setShowEditStudentModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all mr-1"><Edit className="w-5 h-5"/></button>
                                  <button onClick={() => handleDeleteStudent(student.id, student.full_name)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
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
                    <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-slate-900">Maktab Sinflari</h2><button onClick={() => setShowClassModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"><PlusCircle className="w-5 h-5"/> Yangi Sinf Ochish</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {classes.map(cls => {
                        const count = getStudentsCount(cls.name);
                        const isFull = count >= cls.max_limit;
                        return (
                          <div key={cls.name} className={`bg-white p-8 rounded-[3rem] shadow-sm border transition-all hover:shadow-md ${isFull ? 'border-red-100 bg-red-50/10' : 'border-slate-100'}`}>
                            <div className="flex justify-between items-center mb-6 cursor-pointer group" onClick={() => setSelectedClassView(cls.name)}>
                              <h3 className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center">{cls.name} <Search className="w-6 h-6 ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400"/></h3><div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isFull ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>{isFull ? "TO'LGAN" : "BO'SH JOY BOR"}</div>
                            </div>
                            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-8"><span>O'quvchilar</span><span>{count} / {cls.max_limit}</span></div><button onClick={() => setSelectedClassView(cls.name)} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black hover:bg-indigo-600 hover:text-white transition-all">SINFNI KO'RISH</button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeMenu === "timetable" && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col animate-in fade-in">
                <div className="p-8 border-b border-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">Dars Jadvali Konstruktori</h2>
                     <p className="text-slate-400 font-medium">O'quv rejasi asosida jadval tuzing yoki tahrirlang.</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 items-center">
                     <button onClick={() => setShowWorkloadModal(true)} className="px-6 py-3 border border-indigo-100 text-indigo-700 bg-indigo-50 font-black rounded-2xl shadow-sm hover:bg-indigo-100 transition-all flex items-center gap-2">
                       <FileText className="w-5 h-5"/> Yuklamalarni Kiritish
                     </button>
                     <button onClick={handleAutoGenerate} disabled={isGenerating} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50">
                       <Wand2 className="w-5 h-5"/> {isGenerating ? "Jadval tuzilmoqda..." : "Avtomatik Tuzish"}
                     </button>
                     <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                       {classes.map(c => (
                         <button key={c.name} onClick={() => setSelectedClassForTimetable(c.name)} className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${selectedClassForTimetable === c.name ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                           {c.name}
                         </button>
                       ))}
                     </div>
                     <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-1.5 rounded-2xl">
                        <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="bg-white px-4 py-2.5 rounded-xl font-black text-sm outline-none text-indigo-700 shadow-sm cursor-pointer">
                           <option value="1-chorak">1-chorak</option><option value="2-chorak">2-chorak</option><option value="3-chorak">3-chorak</option><option value="4-chorak">4-chorak</option>
                        </select>
                        <div className="flex items-center gap-2 px-3">
                           <input type="text" value={termStartDate} onChange={e=>setTermStartDate(e.target.value)} className="w-24 text-xs font-bold text-center p-1.5 bg-white border border-indigo-100 rounded-md outline-none" title="Boshlanish sanasi"/>
                           <span className="text-indigo-300 font-black">-</span>
                           <input type="text" value={termEndDate} onChange={e=>setTermEndDate(e.target.value)} className="w-24 text-xs font-bold text-center p-1.5 bg-white border border-indigo-100 rounded-md outline-none" title="Tugash sanasi"/>
                        </div>
                     </div>
                   </div>
                </div>

                {!selectedClassForTimetable ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-300">
                    <Calendar className="w-20 h-20 mb-4 opacity-20"/>
                    <p className="text-xl font-bold italic">Tepadagi ro'yxatdan biron bir sinfni tanlang</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto p-8 bg-slate-50/50">
                    <table className="w-full border-collapse bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-100">
                      <thead>
                        <tr>
                          <th className="p-4 bg-slate-50 border-b border-r border-slate-100 w-20"><Clock className="w-5 h-5 mx-auto text-slate-300"/></th>
                          {days.map(d => <th key={d} className="p-4 bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-xs tracking-widest">{d}shanba</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {lessonNumbers.map(num => (
                          <tr key={num}>
                            <td className="p-4 border-b border-r border-slate-100 text-center font-black text-slate-400 bg-slate-50/30 text-lg">{num}</td>
                            {days.map(day => {
                              const lesson = timetableData.find(t => t.class_name === selectedClassForTimetable && t.day_of_week === day && t.lesson_number === num && t.term === selectedTerm);
                              return (
                                <td key={day+num} onClick={() => { setCurrentCell({day, lesson: num}); setLessonForm({subject: lesson?.subject || "", teacher_id: lesson?.teacher_id || "", room: lesson?.room || ""}); setConflictWarning(null); setShowLessonModal(true); }} className={`p-2 border-b border-slate-100 h-32 w-44 cursor-pointer transition-all hover:bg-indigo-50/50 group relative`}>
                                  {lesson ? (
                                    <div className="h-full flex flex-col justify-center bg-indigo-50/80 rounded-xl p-3 border border-indigo-100">
                                      <p className="font-black text-slate-900 text-sm leading-tight">{lesson.subject}</p>
                                      <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase line-clamp-1">{teachers.find(t=>t.id === lesson.teacher_id)?.full_name || "Noma'lum"}</p>
                                      <span className="absolute bottom-2 right-2 text-[9px] font-black text-slate-400 uppercase">{lesson.room}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100"><PlusCircle className="text-indigo-300 w-6 h-6"/></div>
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

            {activeMenu === "algorithm" && (
              <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Calculator className="w-64 h-64"/></div>
                <div className="relative z-10 max-w-2xl"><h2 className="text-5xl font-black italic tracking-tighter mb-6">ELITA IQTISODIYOTI</h2><p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">Sizning maktabingizda moliya va rag'batlantirish tizimi to'liq avtomatlashtirilgan. Har oyning birinchi sanasida tizim sinflar o'rnini aniqlaydi va **100,000 PP** jamg'armani o'quvchilarning o'rtacha bahosiga qarab taqsimlaydi.</p></div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* YUKLAMALAR MODALI */}
      {showWorkloadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowWorkloadModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                 <div><h3 className="text-2xl font-black text-indigo-900">O'quv Rejasi (Yuklamalar)</h3><p className="text-indigo-600 font-bold text-sm mt-1">Sinflarga o'qituvchilarni biriktiring. Algoritm shu reja asosida ishlaydi.</p></div>
                 <button onClick={() => setShowWorkloadModal(false)} className="bg-white p-2 rounded-full text-indigo-400 hover:text-indigo-600"><X/></button>
              </div>
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Qaysi Sinfga?</label><select className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold" value={workloadForm.class_name} onChange={e=>setWorkloadForm({...workloadForm, class_name: e.target.value})}><option value="">Sinf...</option>{classes.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Qaysi Fan?</label><select className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold" value={workloadForm.subject} onChange={e=>setWorkloadForm({...workloadForm, subject: e.target.value, teacher_id: ""})}><option value="">Fan...</option>{subjectsBase.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div className="flex-[2] min-w-[180px]"><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Kim Kiradi (Ustoz)?</label><select className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold" value={workloadForm.teacher_id} onChange={e=>setWorkloadForm({...workloadForm, teacher_id: e.target.value})}><option value="">O'qituvchi...</option>{teachers.filter(t => !workloadForm.subject || t.bio === workloadForm.subject).map(t=><option key={t.id} value={t.id}>{t.full_name} ({t.bio})</option>)}</select></div>
                <div className="w-32"><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Haftada Necha Soat?</label><input type="number" min="1" max="6" className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold text-center" value={workloadForm.hours} onChange={e=>setWorkloadForm({...workloadForm, hours: Number(e.target.value)})} /></div>
                <button onClick={handleAddWorkload} className="p-3 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md font-black flex items-center justify-center gap-2">QO'SHISH <PlusCircle className="w-5 h-5"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {workloads.length === 0 ? <div className="text-center p-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">Hali hech qanday dars yuklamasi kiritilmagan. Yuqoridan qo'shing.</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{workloads.map(w => <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl"><div className="flex items-center gap-4"><span className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black">{w.class_name}</span><div><p className="font-black text-slate-900">{w.subject} <span className="text-slate-400 font-medium text-sm ml-2">({teachers.find(t=>t.id===w.teacher_id)?.full_name})</span></p><p className="text-xs font-bold text-indigo-500 mt-1">Haftasiga {w.hours} soat dars o'tadi</p></div></div><button onClick={() => handleDeleteWorkload(w.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button></div>)}</div>}
              </div>
           </div>
        </div>
      )}

      {/* DARS JADVALIGA DARS QO'SHISH MODALI */}
      {showLessonModal && currentCell && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLessonModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center"><div><h3 className="text-xl font-black text-indigo-900">{currentCell.day}, {currentCell.lesson}-soat</h3><p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">{selectedTerm}</p></div><button onClick={() => setShowLessonModal(false)} className="bg-white p-2 rounded-full text-indigo-400 hover:text-indigo-600"><X/></button></div>
              <div className="p-8 space-y-4">
                 {conflictWarning && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 animate-in slide-in-from-top-2"><AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" /><div>{conflictWarning}</div></div>}
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500" value={lessonForm.subject} onChange={e => {setLessonForm({...lessonForm, subject: e.target.value, teacher_id: ""}); setConflictWarning(null);}}><option value="">Fanni Tanlang</option>{subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}</select>
                 <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500" value={lessonForm.teacher_id} onChange={e => {setLessonForm({...lessonForm, teacher_id: e.target.value}); setConflictWarning(null);}}>
                    <option value="">Ustozni Tanlang</option>
                    {teachers.filter(t => !lessonForm.subject || t.bio === lessonForm.subject).map(t => {
                        const isBusy = timetableData.find(time => time.term === selectedTerm && time.day_of_week === currentCell.day && time.lesson_number === currentCell.lesson && time.teacher_id === t.id && time.class_name !== selectedClassForTimetable);
                        return <option key={t.id} value={t.id} className={isBusy ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>{t.full_name} {isBusy ? `(🔴 Band: ${isBusy.class_name} da)` : `(🟢 Bo'sh)`}</option>;
                      })}
                 </select>
                 <input type="text" placeholder="Xona (Masalan: 12-xona)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500" value={lessonForm.room} onChange={e => setLessonForm({...lessonForm, room: e.target.value})} />
                 <div className="flex gap-3 pt-4"><button onClick={deleteLesson} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all text-sm">O'CHIRISH</button><button onClick={handleSaveLesson} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all text-sm">SAQLASH</button></div>
              </div>
           </div>
        </div>
      )}

      {/* MUROJAAT JAVOBI MODALI */}
      {replyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setReplyModal(null)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center"><h3 className="text-xl font-black text-indigo-900">Murojaatga Javob Yozish</h3><button onClick={() => setReplyModal(null)} className="text-indigo-400 hover:text-indigo-700"><X/></button></div>
              <div className="p-8 space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{replyModal.is_anonymous ? "Yashirin foydalanuvchi:" : replyModal.sender_name + ":"}</span><p className="text-sm font-medium text-slate-700">{replyModal.message}</p></div>
                 <textarea rows={4} placeholder="Sizning javobingiz..." className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-bold outline-none resize-none" value={replyText} onChange={e => setReplyText(e.target.value)}></textarea>
                 <button onClick={handleSendReply} disabled={isReplying} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50">{isReplying ? "YUBORILMOQDA..." : <><Send className="w-5 h-5 mr-2"/> JAVOBNI YUBORISH</>}</button>
              </div>
           </div>
        </div>
      )}

      {/* O'QITUVCHI QO'SHISH MODALI */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowTeacherModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center"><h3 className="text-xl font-black">Yangi O'qituvchi</h3><button onClick={() => setShowTeacherModal(false)}><X/></button></div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="F.I.SH (Masalan: Alimov B.)" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600" value={newPerson.fullName} onChange={e => setNewPerson({...newPerson, fullName: e.target.value})} />
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none text-slate-500" value={newPerson.subject} onChange={e => setNewPerson({...newPerson, subject: e.target.value})}><option value="">Fanni Tanlang</option>{subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}</select>
                 <select className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold outline-none border-2 border-blue-100" value={newPerson.homeroom} onChange={e => setNewPerson({...newPerson, homeroom: e.target.value})}><option value="">Sinf Rahbarligi (Ixtiyoriy)</option>{classes.map(c => <option key={c.name} value={c.name}>{c.name} Rahbari</option>)}</select>
                 <button onClick={handleAddTeacher} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all mt-4">BAZAGA QO'SHISH</button>
              </div>
           </div>
        </div>
      )}

      {/* SINF QO'SHISH MODALI */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowClassModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center"><h3 className="text-xl font-black italic">Yangi Sinf Ochish</h3><button onClick={() => setShowClassModal(false)} className="text-slate-500 hover:text-white"><X/></button></div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="Sinf Nomi (Masalan: 9-A)" className="w-full p-4 bg-slate-100 rounded-2xl font-black text-center uppercase text-2xl outline-none" value={newClassInfo.name} onChange={e => setNewClassInfo({...newClassInfo, name: e.target.value})} />
                 <input type="number" placeholder="O'quvchilar Limiti" className="w-full p-4 bg-slate-100 rounded-2xl font-bold text-center outline-none" value={newClassInfo.limit} onChange={e => setNewClassInfo({...newClassInfo, limit: Number(e.target.value)})} />
                 <button onClick={handleAddClass} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl transition-all">SINFNI YARATISH</button>
              </div>
           </div>
        </div>
      )}

      {/* O'QUVCHI QO'SHISH MODALI */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowStudentModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center"><h3 className="text-xl font-black text-emerald-900">Yangi O'quvchi ({newPerson.className})</h3><button onClick={() => setShowStudentModal(false)}><X/></button></div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="O'quvchi F.I.SH" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={newPerson.fullName} onChange={e => setNewPerson({...newPerson, fullName: e.target.value})} />
                 <button onClick={handleAddStudent} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all">MAKTABGA QO'SHISH</button>
              </div>
           </div>
        </div>
      )}

      {/* USTOZNI TAHRIRLASH MODALI */}
      {showEditTeacherModal && editingTeacher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowEditTeacherModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center"><h3 className="text-xl font-black text-blue-900">Ustozni Tahrirlash</h3><button onClick={() => setShowEditTeacherModal(false)}><X/></button></div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="F.I.SH (Masalan: Alimov B.)" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600" value={editingTeacher.full_name} onChange={e => setEditingTeacher({...editingTeacher, full_name: e.target.value})} />
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none text-slate-500" value={editingTeacher.bio} onChange={e => setEditingTeacher({...editingTeacher, bio: e.target.value})}><option value="">Fanni Tanlang</option>{subjectsBase.map(s => <option key={s} value={s}>{s}</option>)}</select>
                 <select className="w-full p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold outline-none border-2 border-blue-100" value={editingTeacher.homeroom || ""} onChange={e => setEditingTeacher({...editingTeacher, homeroom: e.target.value})}><option value="">Sinf Rahbarligi (Ixtiyoriy)</option><option value="">Yo'q (Sinf rahbari emas)</option>{classes.map(c => <option key={c.name} value={c.name}>{c.name} Rahbari</option>)}</select>
                 <button onClick={handleUpdateTeacher} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all mt-4">SAQLASH</button>
              </div>
           </div>
        </div>
      )}

      {/* O'QUVCHINI TAHRIRLASH MODALI */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowEditStudentModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center"><h3 className="text-xl font-black text-emerald-900">O'quvchini Tahrirlash</h3><button onClick={() => setShowEditStudentModal(false)}><X/></button></div>
              <div className="p-8 space-y-4">
                 <input type="text" placeholder="O'quvchi F.I.SH" className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none" value={editingStudent.full_name} onChange={e => setEditingStudent({...editingStudent, full_name: e.target.value})} />
                 <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none text-slate-500" value={editingStudent.class_name} onChange={e => setEditingStudent({...editingStudent, class_name: e.target.value})}><option value="">Sinfni Tanlang</option>{classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                 <button onClick={handleUpdateStudent} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all">SAQLASH</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

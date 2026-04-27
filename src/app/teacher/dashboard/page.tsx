"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Calendar, Award, Star, BookOpen, 
  Clock, ShieldCheck, Key, CheckCircle, LogOut, Settings, Eye, EyeOff, 
  TableProperties, Send, AlertCircle, FileText, X, PlusCircle, Video, Edit, MessageSquare
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TeacherDashboard() {
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "timetable" | "jurnal" | "ish_reja" | "homeroom" | "settings">("boshqaruv");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const [myStudents, setMyStudents] = useState<any[]>([]); 
  const [myTimetable, setMyTimetable] = useState<any[]>([]); 
  const [allClasses, setAllClasses] = useState<any[]>([]); 

  // SOZLAMALAR UCHUN
  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  // MUROJAAT (FEEDBACK)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ message: "", isAnonymous: false });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // ==========================================
  // ISH REJA
  // ==========================================
  const [selectedClassForPlan, setSelectedClassForPlan] = useState("");
  
  const [lessonPlans, setLessonPlans] = useState([
    { id: 1, date: "02.09.2025", topic: "Jismlarning zaryadlanishi", homework: "Mavzuni o'rganish", isSent: true },
    { id: 2, date: "04.09.2025", topic: "Elektr zaryad", homework: "2-mavzuni o'rganish, 1-mashq masalalari", isSent: true },
    { id: 3, date: "09.09.2025", topic: "Zaryadlarning o'zaro ta'siri. Kulon qonuni", homework: "", isSent: false },
    { id: 4, date: "11.09.2025", topic: "Masalalar yechish", homework: "", isSent: false },
    { id: 5, date: "16.09.2025", topic: "Elektr maydon", homework: "", isSent: false },
    { id: 6, date: "18.09.2025", topic: "O'tkazgichlarda elektr zaryadlarining taqsimlanishi", homework: "", isSent: false },
  ]);

  const [editingHomeworkId, setEditingHomeworkId] = useState<number | null>(null);
  const [tempHomeworkText, setTempHomeworkText] = useState("");

  // ==========================================
  // JURNAL VA BAHOLASH
  // ==========================================
  const [selectedClassToGrade, setSelectedClassToGrade] = useState("");
  const [studentsInJournal, setStudentsInJournal] = useState<any[]>([]);
  const [localGrades, setLocalGrades] = useState<any>({});
  
  // BAHOLASH MODALI
  const [gradeModal, setGradeModal] = useState<{ isOpen: boolean, type: 'today' | 'past' | 'bsb' | 'future', student: any, col: any } | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'keldi' | 'dq' | 'k'>('keldi');
  const [gradeInput, setGradeInput] = useState({ classwork: "", homework: "" });
  const [ppRequestType, setPpRequestType] = useState("+1"); // BSB uchun: +1 yoki +2
  const [isGrading, setIsGrading] = useState(false);

  // KUNLIK HISOB-KITOB UCHUN (Simulyatsiya: Hozir 18-sentabr chorshanba)
  const todayNameString = "Ch"; 

  // Jurnal Ustunlari (Simulyatsiya qilingan kunlar)
  const journalColumns = [
    { label: "04.09", sub: "Dj", type: "past" }, 
    { label: "11.09", sub: "Dj", type: "past" }, 
    { label: "18.09", sub: "bugun", isToday: true, type: "today" }, 
    { label: "25.09", sub: "Dj", type: "future" }, 
    { label: "BSB", sub: "Dj", type: "bsb" },
    { label: "CHSB", sub: "Dj", type: "bsb" }
  ];

  // ==========================================
  // LOGIN VA YUKLASH
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', loginForm.id).eq('password', loginForm.password).eq('role', 'teacher').single();
    if (data) setCurrentTeacher(data);
    else alert("ID yoki Parol xato! Tizimga kirish imkonsiz.");
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentTeacher) loadTeacherData();
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
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const todayClasses = myTimetable.filter(t => t.day_of_week === todayNameString).sort((a,b) => a.lesson_number - b.lesson_number);

  const goToJournal = async (className: string) => {
    setActiveMenu("jurnal");
    setSelectedClassToGrade(className);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsInJournal(data || []);
  };

  const handleSelectClassJournal = async (className: string) => {
    setSelectedClassToGrade(className);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsInJournal(data || []);
  };

  // ==========================================
  // ISH REJA
  // ==========================================
  const saveHomework = (id: number) => {
    setLessonPlans(plans => plans.map(p => p.id === id ? { ...p, homework: tempHomeworkText } : p));
    setEditingHomeworkId(null);
    setTempHomeworkText("");
  };

  const handleSendOnline = (id: number) => {
    const plan = lessonPlans.find(p => p.id === id);
    if(!plan?.homework) return alert("Avval uy vazifasi matnini kiriting!");
    setLessonPlans(plans => plans.map(p => p.id === id ? { ...p, isSent: true } : p));
    alert(`Muvaffaqiyatli!\n"${plan.topic}" darsi bo'yicha uy vazifasi o'quvchilarga onlayn yuborildi.`);
  };

  // ==========================================
  // JURNAL: KATAKNI BOSISH
  // ==========================================
  const handleCellClick = (student: any, col: any) => {
    if (col.type === "future") {
      return alert("Kelajakdagi darslarga oldindan baho qo'yib bo'lmaydi!");
    }
    setAttendanceStatus('keldi');
    setGradeInput({ classwork: "", homework: "" });
    setGradeModal({ isOpen: true, type: col.type, student, col });
  };

  // ==========================================
  // YANGILANGAN BAHOLASH ALGORITMI (CP)
  // ==========================================
  const submitTodayGrade = async () => {
    setIsGrading(true);
    const student = gradeModal?.student;
    
    let addedCP = 0;
    let finalVisualGrade = "";

    if (attendanceStatus === 'dq') {
      addedCP = -5; // Sababsiz kelmaganga qattiq jarima
      finalVisualGrade = "DQ";
    } else if (attendanceStatus === 'k') {
      addedCP = 0;  // Kasal bo'lsa tegilmaydi
      finalVisualGrade = "K";
    } else {
      if (!gradeInput.classwork && !gradeInput.homework) {
        setIsGrading(false);
        return alert("Baho kiriting (1 dan 10 gacha)!");
      }
      
      let total = 0; let count = 0;
      if (gradeInput.classwork) { total += parseInt(gradeInput.classwork); count++; }
      if (gradeInput.homework) { total += parseInt(gradeInput.homework); count++; }
      
      const avg = Math.round(total / count);
      finalVisualGrade = avg.toString();
      
      // SIZ AYTGAN ALGORITM (Filtr)
      if (avg >= 9.5) addedCP = 2;       // 10 ball = +2 CP
      else if (avg >= 8.5) addedCP = 1;  // 9 ball = +1 CP
      else if (avg >= 7.5) addedCP = 0;  // 8 ball = 0 CP
      else addedCP = -2;                 // 7 va past = -2 CP
    }

    const newCP = (student.cp_score || 0) + addedCP;

    // 1. O'quvchi profilini yangilash
    const { error: profileError } = await supabase.from('profiles').update({ cp_score: newCP }).eq('id', student.id);

    // 2. Sinfning umumiy CP sini hisoblash va yangilash (Sinf reytingi uchun)
    // Tizim barcha o'quvchilarning CP sini yig'ib, classes jadvaliga yozib qo'yadi.
    if (!profileError) {
       const { data: allClassStudents } = await supabase.from('profiles').select('cp_score').eq('role', 'student').eq('class_name', selectedClassToGrade);
       let classTotalCP = 0;
       if (allClassStudents) {
          allClassStudents.forEach(s => { classTotalCP += (s.cp_score || 0) });
       }
       await supabase.from('classes').update({ total_cp: classTotalCP }).eq('name', selectedClassToGrade);
    }

    if (!profileError) {
      const key = `${student.id}-${gradeModal?.col.label}`;
      setLocalGrades((prev: any) => ({ ...prev, [key]: finalVisualGrade }));
      alert(`Baho qo'yildi!\n${addedCP > 0 ? '+'+addedCP+' CP' : addedCP < 0 ? addedCP+' CP jarima' : 'CP o\'zgarmadi'}`);
      setGradeModal(null);
      handleSelectClassJournal(selectedClassToGrade);
    } else {
      alert("Xatolik yuz berdi!");
    }
    setIsGrading(false);
  };

  // ==========================================
  // PP SO'ROV YUBORISH (Eski baho to'g'irlash yoki BSB)
  // ==========================================
  const submitPPRequest = async () => {
    setIsGrading(true);
    const student = gradeModal?.student;
    
    // PROGRESSIV NARX LOGIKASI (Simulyatsiya, bazaga ulanganda dinamik bo'ladi)
    // Hozircha standart "Birinchi marta to'g'rilash: 500 PP" qilib qo'yildi.
    let amount = 0;
    let reason = "";

    if (gradeModal?.type === 'past') {
      amount = 500; // PROGRESSIV NARX (500, keyin 700, 1000)
      reason = `${gradeModal?.col.label} kunidagi bahoni to'g'rilash (Yangi Imkoniyat)`;
    } else {
      amount = ppRequestType === '+1' ? 10000 : 20000;
      reason = `${gradeModal?.col.label} dan ${ppRequestType} ball qo'shish`;
    }

    const { error } = await supabase.from('notifications').insert([{
      user_id: student.id,
      title: "Ustozdan To'lov So'rovi",
      message: `Ustoz ${currentTeacher.full_name} sizdan ${amount} PP miqdorida to'lov so'rayapti.\nSabab: ${reason}\n\nRozimisiz? (Jarayon administratorlar orqali tasdiqlanadi)`
    }]);

    if (!error) {
      alert(`So'rov o'quvchiga yuborildi!\nO'quvchi rozi bo'lsa, uning hisobidan ${amount} PP yechilib sizga xabar keladi.`);
      setGradeModal(null);
    } else {
      alert("Xatolik yuz berdi!");
    }
    setIsGrading(false);
  };

  // ==========================================
  // BOSHQA AMALLAR
  // ==========================================
  const handleSendFeedback = async () => {
    if (!feedbackForm.message) return alert("Xabar yozing!");
    setIsSendingFeedback(true);
    const { error } = await supabase.from('feedbacks').insert([{
      sender_id: currentTeacher.id, sender_name: currentTeacher.full_name, message: feedbackForm.message, is_anonymous: feedbackForm.isAnonymous
    }]);
    if (!error) { alert("Murojaatingiz Direktorga yuborildi!"); setShowFeedbackModal(false); setFeedbackForm({ message: "", isAnonymous: false }); }
    setIsSendingFeedback(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 4) return alert("Parol kamida 4 ta belgi bo'lishi kerak!");
    setIsChanging(true);
    const { error } = await supabase.from('profiles').update({ password: newPassword }).eq('id', currentTeacher.id);
    if (!error) { 
      alert("Parol muvaffaqiyatli o'zgartirildi! Direktor panelida ham yangilandi."); 
      setCurrentTeacher({ ...currentTeacher, password: newPassword }); 
      setNewPassword(""); 
    }
    setIsChanging(false);
  };

  // RANG BARDAGI DIZAYN
  const renderGradeBadge = (val: string) => {
    if (!val) return null;
    if (val === 'K' || val === 'DQ') return <div className="text-red-500 font-bold text-xs">{val}</div>;
    const num = parseInt(val);
    if (num >= 9) return <div className="w-5 h-5 bg-emerald-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
    if (num >= 7) return <div className="w-5 h-5 bg-amber-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
    return <div className="w-5 h-5 bg-red-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
  };

  if (!currentTeacher) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 font-sans p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-8 border-indigo-900 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-10 h-10"/></div>
          <h2 className="text-3xl font-black text-center mb-2 text-slate-900">USTOZ KIRISH</h2>
          <p className="text-center text-slate-500 font-bold text-xs uppercase mb-8">Elita Meta-Maktab tizimi</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Sizning ID (T-XXXX)" className="w-full p-5 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-black text-center text-lg uppercase" onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toUpperCase()})} />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Maxfiy Parol" className="w-full p-5 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-black text-center text-lg pr-14 uppercase" onChange={(e) => setLoginForm({...loginForm, password: e.target.value.toUpperCase()})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-2 cursor-pointer">
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all text-lg disabled:opacity-50">{isLoading ? "TEKSHIRILMOQDA..." : "KIRISH"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-indigo-950 border-r border-indigo-900 flex flex-col h-screen flex-shrink-0 z-20 text-indigo-100 hidden md:flex p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">E</div>
          <span className="text-2xl font-black text-white tracking-tighter italic">TEACHER</span>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy Panel</button>
          <button onClick={() => setActiveMenu("jurnal")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'jurnal' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><TableProperties className="w-5 h-5 mr-3" /> Jurnal & Baholash</button>
          <button onClick={() => setActiveMenu("ish_reja")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'ish_reja' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><FileText className="w-5 h-5 mr-3" /> Ish Reja</button>
          {currentTeacher.homeroom && <button onClick={() => setActiveMenu("homeroom")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-4 ${activeMenu === 'homeroom' ? 'bg-amber-500 text-white shadow-xl' : 'text-amber-300 hover:bg-white/5 hover:text-white'}`}><Users className="w-5 h-5 mr-3" /> Mening Sinfim</button>}
          
          <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-8 ${activeMenu === 'settings' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><Settings className="w-5 h-5 mr-3" /> Sozlamalar</button>
        </nav>
        <button onClick={() => setCurrentTeacher(null)} className="w-full flex items-center justify-center p-4 rounded-2xl text-red-400 font-black hover:bg-red-500/10 mt-4"><LogOut className="w-5 h-5 mr-2" /> Chiqish</button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12 relative pb-24">
        <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-48 h-48" /></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {currentTeacher.full_name} 👋</h1>
            <div className="flex gap-4 mt-6">
              <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center"><Star className="w-4 h-4 mr-2 text-amber-300" /> {currentTeacher.bio} Fani</span>
              {currentTeacher.homeroom && (
                <span className="bg-amber-500/90 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center shadow-inner"><ShieldCheck className="w-4 h-4 mr-2" /> {currentTeacher.homeroom} Rahbari</span>
              )}
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. ASOSIY PANEL (BUGUNGI DARSLAR) */}
          {activeMenu === "boshqaruv" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center"><Clock className="w-6 h-6 mr-3 text-indigo-500"/> Bugungi Darslaringiz ({todayNameString}shanba)</h2>
              
              {todayClasses.length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] shadow-sm border-2 border-dashed border-slate-200 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4"/>
                  <h3 className="text-xl font-bold text-slate-400">Bugun sizda hech qanday dars yo'q. Dam oling!</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {todayClasses.map(t => (
                    <div key={t.id} onClick={() => goToJournal(t.class_name)} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg hover:border-indigo-100 transition-all group">
                       <div className="flex justify-between items-center mb-6">
                         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xl">{t.lesson_number}</div>
                         <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">{t.room || "Xona yo'q"}</span>
                       </div>
                       <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{t.class_name}</h3>
                       <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Sinf jurnaliga kirish ➔</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. JURNAL */}
          {activeMenu === "jurnal" && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center"><TableProperties className="w-6 h-6 mr-3 text-blue-500"/> Jurnal va Baholash</h2>
                   <p className="text-slate-500 text-sm mt-1">10 ballik tizim. Baho qo'yish uchun katakni bosing.</p>
                 </div>
                 <select value={selectedClassToGrade} onChange={e => handleSelectClassJournal(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 shadow-sm min-w-[200px]">
                    <option value="">Sinfni tanlang</option>
                    {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                 </select>
              </div>

              {!selectedClassToGrade ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20">
                  <TableProperties className="w-24 h-24 mb-6 opacity-20" />
                  <h2 className="font-black text-2xl tracking-tight">Ko'rish uchun sinfni tanlang</h2>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
                  {studentsInJournal.length === 0 ? (
                    <div className="text-center p-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-3xl bg-white">Bu sinfda o'quvchi yo'q.</div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr>
                            <th className="p-4 bg-slate-50/80 border-b border-r border-slate-200 text-left w-64 text-slate-600 font-bold text-xs sticky left-0 z-10">To'liq Ism</th>
                            {journalColumns.map((col, idx) => (
                              <th key={idx} className={`p-2 bg-white border-b border-slate-200 font-medium text-xs text-blue-500 w-14 ${col.isToday ? 'bg-blue-50/50 border-x-blue-200 border-x' : ''}`}>
                                <div>{col.label}</div>
                                <div className={`text-[10px] ${col.isToday ? 'text-blue-400' : 'text-slate-400'} mt-0.5`}>{col.sub}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {studentsInJournal.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 border-b border-r border-slate-200 text-left sticky left-0 bg-white z-10 flex items-center gap-3">
                                <span className="text-slate-400 text-xs font-bold w-4 text-right">{idx + 1}</span>
                                <span className="font-medium text-slate-700 text-sm">{student.full_name}</span>
                              </td>
                              {journalColumns.map((col, cIdx) => {
                                const key = `${student.id}-${col.label}`;
                                const val = localGrades[key]; 
                                return (
                                  <td key={cIdx} onClick={() => handleCellClick(student, col)} className={`p-1 border-b border-slate-200 cursor-pointer transition-colors relative group h-10 ${col.isToday ? 'border-x-blue-200 border-x bg-blue-50/20' : 'hover:bg-slate-50'}`}>
                                    <div className="flex items-center justify-center w-full h-full">
                                      {val ? renderGradeBadge(val) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-blue-400">
                                          <PlusCircle className="w-4 h-4"/>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ISH REJA */}
          {activeMenu === "ish_reja" && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[700px]">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center"><FileText className="w-6 h-6 mr-3 text-indigo-600"/> Ish Reja va Uy vazifalari</h2>
                 </div>
                 <div className="flex gap-3">
                   <select value={selectedClassForPlan} onChange={e => setSelectedClassForPlan(e.target.value)} className="p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-black text-slate-700 shadow-sm min-w-[200px]">
                      <option value="">Sinfni tanlang</option>
                      {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                 </div>
              </div>

              {!selectedClassForPlan ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20">
                  <FileText className="w-24 h-24 mb-6 opacity-20" />
                  <h2 className="font-black text-2xl tracking-tight">Ko'rish uchun sinf tanlang</h2>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto p-8">
                  <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 text-slate-400 font-black text-xs w-12 text-center">№</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest border-l border-slate-200 w-32">Sana</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest border-l border-slate-200">Mavzu dars</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest border-l border-slate-200 w-[40%]">Keyingi darsga uy vazifa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessonPlans.map((plan, index) => (
                          <tr key={plan.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                            <td className="p-4 border-l border-slate-100">
                              <span className="text-blue-500 font-bold text-sm">{plan.date}</span>
                            </td>
                            <td className="p-4 border-l border-slate-100">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-700">{plan.topic}</span>
                                <span title="Video dars qo'shish"><Video className="w-4 h-4 text-slate-300 cursor-pointer hover:text-blue-500" /></span>
                              </div>
                            </td>
                            <td className="p-4 border-l border-slate-100">
                              {editingHomeworkId === plan.id ? (
                                <div className="flex gap-2">
                                  <input type="text" value={tempHomeworkText} onChange={e => setTempHomeworkText(e.target.value)} className="flex-1 p-2 border border-blue-200 rounded-lg outline-none focus:border-blue-500 text-sm font-medium" autoFocus placeholder="Vazifani yozing..."/>
                                  <button onClick={() => saveHomework(plan.id)} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-600">Saqlash</button>
                                  <button onClick={() => setEditingHomeworkId(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200">Bekor</button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {plan.homework ? (
                                    <div className="flex justify-between items-start">
                                      <span className="text-slate-600 text-sm">{plan.homework}</span>
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => {setEditingHomeworkId(plan.id); setTempHomeworkText(plan.homework);}} className="text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4"/></button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button onClick={() => {setEditingHomeworkId(plan.id); setTempHomeworkText("");}} className="text-blue-500 text-sm font-bold flex items-center hover:text-blue-700 w-fit">
                                      <PlusCircle className="w-4 h-4 mr-1"/> Keyingi darsga UV
                                    </button>
                                  )}
                                  
                                  <div className="flex justify-end mt-1">
                                    {plan.isSent ? (
                                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black border border-emerald-200 flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1"/> Yuborilgan
                                      </span>
                                    ) : (
                                      <button onClick={() => handleSendOnline(plan.id)} className="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-lg text-xs font-black hover:bg-blue-50 transition-colors">
                                        Onlayn berish
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. SOZLAMALAR */}
          {activeMenu === "settings" && (
            <div className="max-w-xl bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mx-auto mt-10">
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6"><Settings className="w-8 h-8"/></div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Sozlamalar</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Shaxsiy parolingizni o'zgartiring</p>
              
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-6">
                 <p className="text-sm font-bold text-blue-800 flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> Eslatma:</p>
                 <p className="text-xs text-blue-600 mt-1">Yangi parolni o'zgartirsangiz, u darhol Direktor panelida ham yangilanadi. Parolni eslab qoling.</p>
              </div>

              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yangi parol yozing..." className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-6 font-black text-lg outline-none text-center" />
              <button onClick={handleChangePassword} disabled={isChanging} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-lg disabled:opacity-50">
                {isChanging ? "SAQLANMOQDA..." : "PAROLNI SAQLASH"}
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ==========================================
          GEMINI USLUBIDAGI MUROJAAT TUGMASI 
      ========================================== */}
      <div className="fixed bottom-4 w-[90%] md:w-auto left-1/2 transform -translate-x-1/2 z-40">
        <button 
          onClick={() => setShowFeedbackModal(true)} 
          className="w-full md:w-auto bg-slate-900/90 backdrop-blur-md text-slate-300 text-[13px] font-medium px-6 py-2.5 rounded-full shadow-2xl hover:text-white flex items-center justify-center gap-2 border border-slate-700/50 transition-all hover:bg-slate-900"
        >
           <MessageSquare className="w-4 h-4 text-indigo-400"/>
           Tizim bo'yicha taklif yoki murojaat yo'llash
        </button>
      </div>

      {/* MUROJAAT MODALI */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-900 flex justify-between items-center">
                 <h3 className="text-xl font-black text-white flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-indigo-400"/> Murojaat yo'llash</h3>
                 <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <textarea rows={4} placeholder="Fikringizni shu yerga yozing..." className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl outline-none resize-none font-medium" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})}></textarea>
                 <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                   <input type="checkbox" className="w-5 h-5 accent-slate-900" checked={feedbackForm.isAnonymous} onChange={e => setFeedbackForm({...feedbackForm, isAnonymous: e.target.checked})} />
                   <div><p className="font-bold text-sm">Anonim yuborish</p><p className="text-xs text-slate-500">Ismingiz ko'rinmaydi</p></div>
                 </label>
                 <button onClick={handleSendFeedback} disabled={isSendingFeedback} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50">
                   {isSendingFeedback ? "YUBORILMOQDA..." : "YUBORISH"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ==========================================
          YANGI BAHOLASH MODALI (3 XIL REJIM)
      ========================================== */}
      {gradeModal && gradeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setGradeModal(null)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>
              
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-start">
                 <div>
                   <h3 className="text-2xl font-black text-blue-900">{gradeModal.student.full_name}</h3>
                   <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">Sana: {gradeModal.col.label}</p>
                 </div>
                 <button onClick={() => setGradeModal(null)} className="text-blue-300 hover:text-blue-600 bg-white rounded-full p-2"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-8 space-y-6">
                 
                 {/* REJIM 1: BUGUNGI DARS (Bepul) */}
                 {gradeModal.type === 'today' && (
                   <>
                     <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded-2xl">
                        <button onClick={() => setAttendanceStatus('keldi')} className={`py-3 rounded-xl font-black text-xs transition-all ${attendanceStatus === 'keldi' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Keldi</button>
                        <button onClick={() => setAttendanceStatus('dq')} className={`py-3 rounded-xl font-black text-xs transition-all ${attendanceStatus === 'dq' ? 'bg-red-500 shadow-sm text-white' : 'text-slate-400'}`}>Sababsiz(DQ)</button>
                        <button onClick={() => setAttendanceStatus('k')} className={`py-3 rounded-xl font-black text-xs transition-all ${attendanceStatus === 'k' ? 'bg-amber-500 shadow-sm text-white' : 'text-slate-400'}`}>Kasal(K)</button>
                     </div>

                     {attendanceStatus === 'keldi' ? (
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <label className="block text-slate-900 font-black text-sm mb-4">10 Ballik Baholash</label>
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold text-slate-600">Dars ishtiroki:</span>
                            <input type="number" min="1" max="10" placeholder="0" value={gradeInput.classwork} onChange={e => setGradeInput({...gradeInput, classwork: e.target.value})} className="w-20 p-3 text-center bg-white border-2 border-indigo-100 focus:border-indigo-500 rounded-xl font-black text-lg outline-none"/>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-600">Uy vazifasi:</span>
                            <input type="number" min="1" max="10" placeholder="0" value={gradeInput.homework} onChange={e => setGradeInput({...gradeInput, homework: e.target.value})} className="w-20 p-3 text-center bg-white border-2 border-indigo-100 focus:border-indigo-500 rounded-xl font-black text-lg outline-none"/>
                          </div>
                       </div>
                     ) : (
                       <div className={`p-6 rounded-3xl border ${attendanceStatus === 'dq' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                         <p className="font-black text-center mb-2 flex items-center justify-center"><AlertCircle className="w-5 h-5 mr-2"/> Diqqat!</p>
                         <p className="text-sm font-bold text-center">
                           {attendanceStatus === 'dq' ? "O'quvchi reytingidan -5 CP jarima yechiladi." : "Kasal bo'lgani uchun o'quvchi reytingiga ta'sir qilmaydi (0 CP)."}
                         </p>
                       </div>
                     )}

                     <button onClick={submitTodayGrade} disabled={isGrading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">
                       {isGrading ? "SAQLANMOQDA..." : "JURNALGA SAQLASH (BEPUL)"}
                     </button>
                   </>
                 )}

                 {/* REJIM 2: O'TIB KETGAN DARS (Eski bahoni to'g'irlash progressiv - masalan 500 PP) */}
                 {gradeModal.type === 'past' && (
                   <>
                     <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-center">
                        <Award className="w-12 h-12 mx-auto text-amber-500 mb-3"/>
                        <h4 className="font-black text-amber-900 text-lg mb-2">Eski bahoni to'g'rilash</h4>
                        <p className="text-amber-700 text-sm font-medium">O'tgan kunlardagi bahoni to'g'irlash yoki bo'sh joyni to'ldirish uchun o'quvchidan <b className="text-amber-900">500 PP</b> to'lov talab qilinadi. Narx oshib borishi mumkin.</p>
                     </div>
                     <button onClick={submitPPRequest} disabled={isGrading} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center">
                       {isGrading ? "YUBORILMOQDA..." : <><Send className="w-5 h-5 mr-2"/> 500 PP SO'ROV YUBORISH</>}
                     </button>
                   </>
                 )}

                 {/* REJIM 3: BSB/CHSB (+1 yoki +2 ball sotib olish) */}
                 {gradeModal.type === 'bsb' && (
                   <>
                     <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-200 text-center">
                        <Award className="w-12 h-12 mx-auto text-indigo-500 mb-3"/>
                        <h4 className="font-black text-indigo-900 text-lg mb-2">BSB/CHSB uchun ball qo'shish</h4>
                        <p className="text-indigo-700 text-sm font-medium mb-4">O'quvchi o'z PP si evaziga yozma ishdagi ballini ko'tarishi mumkin.</p>
                        
                        <select value={ppRequestType} onChange={(e) => setPpRequestType(e.target.value)} className="w-full p-4 bg-white border border-indigo-200 rounded-xl outline-none focus:border-indigo-500 font-black text-indigo-900 shadow-sm">
                           <option value="+1">+1 Ball (Narxi: 10,000 PP)</option>
                           <option value="+2">+2 Ball (Narxi: 20,000 PP)</option>
                        </select>
                     </div>
                     <button onClick={submitPPRequest} disabled={isGrading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center">
                       {isGrading ? "YUBORILMOQDA..." : <><Send className="w-5 h-5 mr-2"/> PP SO'ROV YUBORISH</>}
                     </button>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

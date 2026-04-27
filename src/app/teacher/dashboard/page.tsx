"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Calendar, Award, Star, BookOpen, 
  Clock, ShieldCheck, Key, CheckCircle, LogOut, Settings, Eye, EyeOff, 
  TableProperties, Send, AlertCircle, FileText, X, PlusCircle, Video, Edit, MessageSquare, ListTodo, DownloadCloud
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ==========================================
// 1. O'ZBEKISTON TA'LIM KALENDARI BAZASI (2025-2026)
// ==========================================
const HOLIDAYS = [
  "01.10.2025", "08.12.2025", "01.01.2026", "08.03.2026", "21.03.2026", "22.03.2026", "09.05.2026"
];

// Oylar sonini nomga o'girish (Sana formatlash uchun)
function formatDate(dateStr: string) {
  // Masalan, dateStr = "2025-09-02"
  const [y, m, d] = dateStr.split('-');
  return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`;
}

function getDayName(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  return days[d.getDay()];
}

// 2 sanasi oralig'idagi barcha kunlarni olish
function getDatesInRange(startDate: string, endDate: string) {
  const dates = [];
  let current = new Date(startDate.split('.').reverse().join('-'));
  const end = new Date(endDate.split('.').reverse().join('-'));

  while (current <= end) {
    const dStr = current.toISOString().split('T')[0];
    dates.push(dStr);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function TeacherDashboard() {
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "timetable" | "jurnal" | "ish_reja" | "settings">("boshqaruv");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const [myStudents, setMyStudents] = useState<any[]>([]); 
  const [myTimetable, setMyTimetable] = useState<any[]>([]); 
  const [allClasses, setAllClasses] = useState<any[]>([]); 

  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  // MUROJAAT (FEEDBACK)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ message: "", isAnonymous: false });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // ==========================================
  // ISH REJA (MO'JIZAVIY ALGORITM)
  // ==========================================
  const [selectedClassForPlan, setSelectedClassForPlan] = useState("");
  const [selectedTermPlan, setSelectedTermPlan] = useState("1-chorak");
  
  const [generatedDates, setGeneratedDates] = useState<any[]>([]);
  const [planForm, setPlanForm] = useState<{ [key: string]: { topic: string, homework: string, deadline: string } }>({});
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTopicsText, setBulkTopicsText] = useState("");

  const generateLessonDates = () => {
    if (!selectedClassForPlan) return;

    // 1. Shu sinf va shu chorak uchun dars jadvalini topamiz (Direktor tuzgani)
    const classSchedule = myTimetable.filter(t => t.class_name === selectedClassForPlan && t.term === selectedTermPlan);
    
    if (classSchedule.length === 0) {
      alert("Bu sinf va chorak uchun Direktor dars jadvalini shakllantirmagan!");
      setGeneratedDates([]);
      return;
    }

    // 2. Dars bo'ladigan hafta kunlarini olamiz (Masalan: "Du", "Ch")
    const lessonDays = Array.from(new Set(classSchedule.map(t => t.day_of_week)));
    
    // Boshlanish va tugash sanasi (Jadvaldan olamiz)
    const startDate = classSchedule[0].start_date; // Masalan: "02.09.2025"
    const endDate = classSchedule[0].end_date;

    if(!startDate || !endDate) return alert("Chorak sanalari belgilanmagan!");

    // 3. Kalendarni aylanamiz
    const allDates = getDatesInRange(startDate, endDate);
    const validLessonDates = [];

    for (let d of allDates) {
      const dayName = getDayName(d);
      const formattedD = formatDate(d);

      // Agar bugun bizning dars kunimiz bo'lsa VA bayram bo'lmasa, uni ro'yxatga qo'shamiz
      if (lessonDays.includes(dayName) && !HOLIDAYS.includes(formattedD)) {
        validLessonDates.push({ date: formattedD, dayName });
      }
    }

    setGeneratedDates(validLessonDates);
    
    // Eski saqlangan mavzularni (agar oldin yozgan bo'lsa) tozalaymiz
    setPlanForm({});
  };

  // Bulk (Ommaviy) mavzular qo'shish
  const handleBulkInsert = () => {
    const topics = bulkTopicsText.split('\n').filter(t => t.trim() !== "");
    const newPlanForm = { ...planForm };
    
    for (let i = 0; i < Math.min(topics.length, generatedDates.length); i++) {
      const dateKey = generatedDates[i].date;
      newPlanForm[dateKey] = {
        topic: topics[i],
        homework: "Mavzuni takrorlash", // Default
        deadline: "Keyingi darsgacha" // Default
      };
    }
    
    setPlanForm(newPlanForm);
    setShowBulkModal(false);
    setBulkTopicsText("");
  };

  const handlePlanChange = (date: string, field: string, value: string) => {
    setPlanForm({
      ...planForm,
      [date]: {
        ...planForm[date],
        [field]: value
      }
    });
  };

  const handleSaveFullPlan = async () => {
    setIsLoading(true);
    let insertedCount = 0;

    for (let gDate of generatedDates) {
      const plan = planForm[gDate.date];
      if (plan && plan.topic) {
        // Bazaga jo'natamiz
        await supabase.from('homeworks').insert([{
          class_name: selectedClassForPlan,
          subject: currentTeacher.bio,
          topic: plan.topic,
          description: plan.homework || "",
          deadline: plan.deadline || "Keyingi darsgacha",
          created_at: gDate.date // Dars kuni kiritilyapti
        }]);
        insertedCount++;
      }
    }

    alert(`${insertedCount} ta dars rejasi o'quvchilarga onlayn tarzda muvaffaqiyatli yuborildi!`);
    setIsLoading(false);
  };

  // ==========================================
  // JURNAL LOGIKASI (OLDINGIDEK)
  // ==========================================
  const [selectedClassToGrade, setSelectedClassToGrade] = useState("");
  const [studentsInJournal, setStudentsInJournal] = useState<any[]>([]);
  const [localGrades, setLocalGrades] = useState<any>({});
  
  const [gradeModal, setGradeModal] = useState<{ isOpen: boolean, type: 'today' | 'past' | 'bsb' | 'future', student: any, col: any } | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'keldi' | 'dq' | 'k'>('keldi');
  const [gradeInput, setGradeInput] = useState({ classwork: "", homework: "" });
  const [ppRequestType, setPpRequestType] = useState("+1"); 
  const [isGrading, setIsGrading] = useState(false);

  const todayNameString = "Ch"; 
  const journalColumns = [
    { label: "04.09", sub: "Dj", type: "past" }, 
    { label: "11.09", sub: "Dj", type: "past" }, 
    { label: "18.09", sub: "bugun", isToday: true, type: "today" }, 
    { label: "25.09", sub: "Dj", type: "future" }, 
    { label: "BSB", sub: "Dj", type: "bsb" },
    { label: "CHSB", sub: "Dj", type: "bsb" }
  ];

  // ... (Login va LoadData qismlari avvalgidek turaveradi)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', loginForm.id).eq('password', loginForm.password).eq('role', 'teacher').single();
    if (data) setCurrentTeacher(data); else alert("ID yoki Parol xato!");
    setIsLoading(false);
  };

  useEffect(() => { if (currentTeacher) loadTeacherData(); }, [currentTeacher]);

  const loadTeacherData = async () => {
    setIsLoading(true);
    try {
      const { data: schedule } = await supabase.from('timetable').select('*').eq('teacher_id', currentTeacher.id);
      setMyTimetable(schedule || []);
      const { data: classesData } = await supabase.from('classes').select('*').order('name');
      setAllClasses(classesData || []);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const todayClasses = myTimetable.filter(t => t.day_of_week === todayNameString).sort((a,b) => a.lesson_number - b.lesson_number);

  const goToJournal = async (className: string) => {
    setActiveMenu("jurnal");
    handleSelectClassJournal(className);
  };

  const handleSelectClassJournal = async (className: string) => {
    setSelectedClassToGrade(className);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsInJournal(data || []);
  };

  const handleCellClick = (student: any, col: any) => {
    if (col.type === "future") return alert("Kelajakdagi darslarga oldindan baho qo'yib bo'lmaydi!");
    setAttendanceStatus('keldi'); setGradeInput({ classwork: "", homework: "" });
    setGradeModal({ isOpen: true, type: col.type, student, col });
  };

  const submitTodayGrade = async () => {
    setIsGrading(true);
    const student = gradeModal?.student;
    let addedCP = 0; let finalVisualGrade = "";

    if (attendanceStatus === 'dq') { addedCP = -5; finalVisualGrade = "DQ"; } 
    else if (attendanceStatus === 'k') { addedCP = 0; finalVisualGrade = "K"; } 
    else {
      if (!gradeInput.classwork && !gradeInput.homework) { setIsGrading(false); return alert("Baho kiriting (1 dan 10 gacha)!"); }
      let total = 0; let count = 0;
      if (gradeInput.classwork) { total += parseInt(gradeInput.classwork); count++; }
      if (gradeInput.homework) { total += parseInt(gradeInput.homework); count++; }
      const avg = Math.round(total / count); finalVisualGrade = avg.toString();
      if (avg >= 9.5) addedCP = 2; else if (avg >= 8.5) addedCP = 1; else if (avg >= 7.5) addedCP = 0; else addedCP = -2;
    }

    const newCP = (student.cp_score || 0) + addedCP;
    const { error: profileError } = await supabase.from('profiles').update({ cp_score: newCP }).eq('id', student.id);

    if (!profileError) {
       const { data: allClassStudents } = await supabase.from('profiles').select('cp_score').eq('role', 'student').eq('class_name', selectedClassToGrade);
       let classTotalCP = 0;
       if (allClassStudents) { allClassStudents.forEach(s => { classTotalCP += (s.cp_score || 0) }); }
       await supabase.from('classes').update({ total_cp: classTotalCP }).eq('name', selectedClassToGrade);
    }

    if (!profileError) {
      const key = `${student.id}-${gradeModal?.col.label}`;
      setLocalGrades((prev: any) => ({ ...prev, [key]: finalVisualGrade }));
      alert(`Baho qo'yildi!\n${addedCP > 0 ? '+'+addedCP+' CP' : addedCP < 0 ? addedCP+' CP jarima' : 'CP o\'zgarmadi'}`);
      setGradeModal(null);
    } else { alert("Xatolik yuz berdi!"); }
    setIsGrading(false);
  };

  const submitPPRequest = async () => {
    setIsGrading(true);
    const student = gradeModal?.student;
    let amount = 0; let reason = "";
    if (gradeModal?.type === 'past') { amount = 500; reason = `${gradeModal?.col.label} kunidagi bahoni to'g'rilash (Yangi Imkoniyat)`; } 
    else { amount = ppRequestType === '+1' ? 10000 : 20000; reason = `${gradeModal?.col.label} dan ${ppRequestType} ball qo'shish`; }

    const { error } = await supabase.from('notifications').insert([{
      user_id: student.id, title: "Ustozdan To'lov So'rovi", message: `Ustoz sizdan ${amount} PP to'lov so'rayapti.\nSabab: ${reason}\n\nRozimisiz?`
    }]);

    if (!error) { alert(`So'rov o'quvchiga yuborildi!`); setGradeModal(null); } 
    else { alert("Xatolik yuz berdi!"); }
    setIsGrading(false);
  };

  const handleSendFeedback = async () => {
    if (!feedbackForm.message) return alert("Xabar yozing!");
    setIsSendingFeedback(true);
    await supabase.from('feedbacks').insert([{ sender_id: currentTeacher.id, sender_name: currentTeacher.full_name, message: feedbackForm.message, is_anonymous: feedbackForm.isAnonymous }]);
    alert("Murojaatingiz jo'natildi!"); setShowFeedbackModal(false); setFeedbackForm({ message: "", isAnonymous: false });
    setIsSendingFeedback(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 4) return alert("Parol kamida 4 ta belgi!");
    setIsChanging(true);
    await supabase.from('profiles').update({ password: newPassword }).eq('id', currentTeacher.id);
    alert("Parol yangilandi!"); setCurrentTeacher({ ...currentTeacher, password: newPassword }); setNewPassword(""); 
    setIsChanging(false);
  };

  const renderGradeBadge = (val: string) => {
    if (!val) return null;
    if (val === 'K' || val === 'DQ') return <div className="text-red-500 font-bold text-xs">{val}</div>;
    const num = parseInt(val);
    if (num >= 9) return <div className="w-5 h-5 bg-emerald-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
    if (num >= 7) return <div className="w-5 h-5 bg-amber-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
    return <div className="w-5 h-5 bg-red-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
  };

  // ... (LOGIN UI)
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-2 cursor-pointer">{showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}</button>
            </div>
            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all text-lg disabled:opacity-50">{isLoading ? "KIRILMOQDA..." : "KIRISH"}</button>
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
          
          {/* Boshqaruv */}
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

          {/* ISH REJA (YANGI MO'JIZAVIY ALGORITM) */}
          {activeMenu === "ish_reja" && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[700px]">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center"><ListTodo className="w-6 h-6 mr-3 text-indigo-600"/> Avtomatik Ish Reja</h2>
                   <p className="text-slate-500 text-sm mt-1">Sinf va chorakni tanlab, <b>"Sanalarni kiritish"</b> tugmasini bosing.</p>
                 </div>
                 
                 <div className="flex flex-wrap gap-3">
                   <select value={selectedClassForPlan} onChange={e => setSelectedClassForPlan(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 shadow-sm">
                      <option value="">Sinfni tanlang</option>
                      {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                   <select value={selectedTermPlan} onChange={e => setSelectedTermPlan(e.target.value)} className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:border-indigo-500 font-black text-indigo-700 shadow-sm">
                      <option value="1-chorak">1-chorak</option>
                      <option value="2-chorak">2-chorak</option>
                      <option value="3-chorak">3-chorak</option>
                      <option value="4-chorak">4-chorak</option>
                   </select>
                   <button onClick={generateLessonDates} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors flex items-center shadow-md">
                      SANALARNI KIRITISH
                   </button>
                 </div>
              </div>

              {!selectedClassForPlan || generatedDates.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 bg-slate-50/50">
                  <Calendar className="w-24 h-24 mb-6 opacity-20 text-indigo-500" />
                  <h2 className="font-black text-2xl tracking-tight text-center max-w-md">Yuqoridan sinfni tanlang va tugmani bosing.</h2>
                  <p className="text-sm font-medium mt-4 text-center max-w-md leading-relaxed text-slate-400">Tizim maktab dars jadvali hamda bayramlarni avtomat hisoblab, sizga tayyor sanalarni chiqarib beradi.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto p-8 bg-slate-50/50">
                  
                  {/* TEZKOR QO'SHISH TUGMASI */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-indigo-100 text-indigo-700 font-black px-4 py-2 rounded-xl text-sm">
                      Jami darslar soni: {generatedDates.length} ta
                    </div>
                    <button onClick={() => setShowBulkModal(true)} className="px-5 py-2.5 bg-white border-2 border-indigo-200 text-indigo-600 font-black rounded-xl hover:bg-indigo-50 flex items-center shadow-sm">
                      <DownloadCloud className="w-4 h-4 mr-2"/> Ommaviy kiritish (Mavzularni tashlash)
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 text-slate-400 font-black text-xs w-16 text-center">№</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest w-40">Sana</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest">Mavzu</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest w-64">Uy vazifasi</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest w-48">Muddat (Deadline)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedDates.map((gDate, index) => {
                          const dateKey = gDate.date;
                          const pData = planForm[dateKey] || { topic: "", homework: "", deadline: "Keyingi darsgacha" };
                          
                          return (
                            <tr key={dateKey} className="border-b border-slate-100 hover:bg-slate-50 focus-within:bg-indigo-50/30 transition-colors">
                              <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                              <td className="p-4 border-l border-slate-100">
                                <span className="text-indigo-600 font-black text-base">{gDate.date}</span>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{gDate.dayName}shanba</span>
                              </td>
                              <td className="p-2 border-l border-slate-100">
                                <input type="text" placeholder="Mavzu matni..." className="w-full p-3 bg-transparent outline-none font-medium text-slate-800 placeholder-slate-300" value={pData.topic} onChange={(e) => handlePlanChange(dateKey, 'topic', e.target.value)} />
                              </td>
                              <td className="p-2 border-l border-slate-100">
                                <input type="text" placeholder="Vazifa..." className="w-full p-3 bg-transparent outline-none text-sm text-slate-600 placeholder-slate-300" value={pData.homework} onChange={(e) => handlePlanChange(dateKey, 'homework', e.target.value)} />
                              </td>
                              <td className="p-2 border-l border-slate-100">
                                <select className="w-full p-3 bg-transparent outline-none text-xs font-bold text-slate-500" value={pData.deadline} onChange={(e) => handlePlanChange(dateKey, 'deadline', e.target.value)}>
                                  <option value="Keyingi darsgacha">Keyingi darsgacha</option>
                                  <option value="Ertaga 08:00">Ertaga 08:00</option>
                                  <option value="Juma kunigacha">Juma kunigacha</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveFullPlan} disabled={isLoading} className="px-10 py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center">
                      {isLoading ? "SAQLANMOQDA..." : <><CheckCircle className="w-6 h-6 mr-3"/> O'QUVCHILARGA YUBORISH (SAQLASH)</>}
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* JURNAL VA BOSHQA BO'LIMLAR... (Tegilmagan) */}
          {activeMenu === "jurnal" && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center"><TableProperties className="w-6 h-6 mr-3 text-blue-500"/> Jurnal</h2>
                   <p className="text-slate-500 text-sm mt-1">Sinf va o'quvchini tanlab baho qo'ying.</p>
                 </div>
                 <div className="flex gap-4">
                   <select value={selectedClassToGrade} onChange={e => handleSelectClassJournal(e.target.value)} className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 shadow-sm min-w-[150px]">
                      <option value="">Sinfni tanlang</option>
                      {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                   </select>
                 </div>
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

          {/* SOZLAMALAR */}
          {activeMenu === "settings" && (
            <div className="max-w-xl bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mx-auto mt-10">
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6"><Settings className="w-8 h-8"/></div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Sozlamalar</h2>
              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yangi parol yozing..." className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-6 font-black text-lg outline-none text-center" />
              <button onClick={handleChangePassword} disabled={isChanging} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-lg disabled:opacity-50">
                {isChanging ? "SAQLANMOQDA..." : "PAROLNI SAQLASH"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ==========================================
          BULK (OMMAVIY) KISITISH MODALI
      ========================================== */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowBulkModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 flex justify-between items-center border-b border-indigo-100">
                 <h3 className="text-xl font-black text-indigo-900 flex items-center"><DownloadCloud className="w-6 h-6 mr-3"/> Ommaviy Kiritish</h3>
                 <button onClick={() => setShowBulkModal(false)} className="text-indigo-400 hover:text-indigo-700"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <p className="text-sm font-bold text-slate-600 mb-2">Mavzularni har birini yangi qatordan (Enter tashlab) shu yerga joylang (Paste). Tizim ularni sanalarga o'zi biriktiradi!</p>
                 <textarea 
                    rows={10} 
                    placeholder="1. Kirish&#10;2. Algebraik kasrlar&#10;3. Masalalar yechish..." 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-medium outline-none resize-none leading-relaxed"
                    value={bulkTopicsText}
                    onChange={e => setBulkTopicsText(e.target.value)}
                 ></textarea>
                 
                 <button onClick={handleBulkInsert} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all mt-4">
                   TIZIMGA JOYLASHTIRISH
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* GEMINI USLUBIDAGI MUROJAAT TUGMASI */}
      <div className="fixed bottom-4 w-[90%] md:w-auto left-1/2 transform -translate-x-1/2 z-40">
        <button onClick={() => setShowFeedbackModal(true)} className="w-full md:w-auto bg-slate-900/90 backdrop-blur-md text-slate-300 text-[13px] font-medium px-6 py-2.5 rounded-full shadow-2xl hover:text-white flex items-center justify-center gap-2 transition-all hover:bg-slate-900">
           <MessageSquare className="w-4 h-4 text-indigo-400"/> Tizim bo'yicha murojaat yo'llash
        </button>
      </div>

      {/* QOLGAN MODALLAR (Feedback, Grade) Eski qisqartirilmagan holida o'zgarishsiz qoldi */}
      {/* Murojaat Modali */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-900 flex justify-between items-center"><h3 className="text-xl font-black text-white flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-indigo-400"/> Murojaat yo'llash</h3><button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white"><X/></button></div>
              <div className="p-8 space-y-4">
                 <textarea rows={4} placeholder="Fikringizni yozing..." className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-medium outline-none resize-none" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})}></textarea>
                 <button onClick={handleSendFeedback} disabled={isSendingFeedback} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50">{isSendingFeedback ? "YUBORILMOQDA..." : "YUBORISH"}</button>
              </div>
           </div>
        </div>
      )}

      {/* Baholash Modali */}
      {gradeModal && gradeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setGradeModal(null)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-start">
                 <div><h3 className="text-2xl font-black text-blue-900">{gradeModal.student.full_name}</h3><p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">Sana: {gradeModal.col.label}</p></div>
                 <button onClick={() => setGradeModal(null)} className="text-blue-300 hover:text-blue-600 bg-white rounded-full p-2"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-8 space-y-6">
                 {gradeModal.type === 'today' && (
                   <>
                     <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded-2xl">
                        <button onClick={() => setAttendanceStatus('keldi')} className={`py-3 rounded-xl font-black text-xs ${attendanceStatus === 'keldi' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>Keldi</button>
                        <button onClick={() => setAttendanceStatus('dq')} className={`py-3 rounded-xl font-black text-xs ${attendanceStatus === 'dq' ? 'bg-red-500 text-white' : 'text-slate-400'}`}>Sababsiz(DQ)</button>
                        <button onClick={() => setAttendanceStatus('k')} className={`py-3 rounded-xl font-black text-xs ${attendanceStatus === 'k' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>Kasal(K)</button>
                     </div>
                     {attendanceStatus === 'keldi' ? (
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <label className="block text-slate-900 font-black text-sm mb-4">10 Ballik Baholash</label>
                          <div className="flex items-center justify-between mb-4"><span className="font-bold text-slate-600">Dars ishtiroki:</span><input type="number" min="1" max="10" placeholder="0" value={gradeInput.classwork} onChange={e => setGradeInput({...gradeInput, classwork: e.target.value})} className="w-20 p-3 text-center bg-white border-2 border-indigo-100 focus:border-indigo-500 rounded-xl font-black text-lg outline-none"/></div>
                          <div className="flex items-center justify-between"><span className="font-bold text-slate-600">Uy vazifasi:</span><input type="number" min="1" max="10" placeholder="0" value={gradeInput.homework} onChange={e => setGradeInput({...gradeInput, homework: e.target.value})} className="w-20 p-3 text-center bg-white border-2 border-indigo-100 focus:border-indigo-500 rounded-xl font-black text-lg outline-none"/></div>
                       </div>
                     ) : (
                       <div className={`p-6 rounded-3xl border ${attendanceStatus === 'dq' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}><p className="text-sm font-bold text-center">{attendanceStatus === 'dq' ? "-5 CP jarima." : "0 CP."}</p></div>
                     )}
                     <button onClick={submitTodayGrade} disabled={isGrading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700">{isGrading ? "SAQLANMOQDA..." : "JURNALGA SAQLASH (BEPUL)"}</button>
                   </>
                 )}
                 {gradeModal.type === 'past' && (
                   <button onClick={submitPPRequest} disabled={isGrading} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black shadow-xl hover:bg-amber-600">{isGrading ? "YUBORILMOQDA..." : "500 PP SO'ROV YUBORISH"}</button>
                 )}
                 {gradeModal.type === 'bsb' && (
                   <button onClick={submitPPRequest} disabled={isGrading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700">{isGrading ? "YUBORILMOQDA..." : "PP SO'ROV YUBORISH"}</button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Calendar, Award, Star, BookOpen, 
  Clock, ShieldCheck, Key, CheckCircle, LogOut, Settings, Eye, EyeOff, 
  TableProperties, Send, AlertCircle, FileText, X, PlusCircle, Video, Edit, MessageSquare, ListTodo, DownloadCloud, MessageCircle, MoreVertical, Search, BellOff, Trash2, Ban, Copy, ChevronDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Kalendar yordamchi funksiyalari (Ish reja uchun)
const HOLIDAYS = ["01.10.2025", "08.12.2025", "01.01.2026", "08.03.2026", "21.03.2026", "22.03.2026", "09.05.2026"];
function formatDate(dateStr: string) { 
  const [y, m, d] = dateStr.split('-'); 
  return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${y}`; 
}
function getDayName(dateStr: string) { 
  const days = ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]; 
  return days[new Date(dateStr).getDay()]; 
}
function getDatesInRange(startDate: string, endDate: string) {
  const dates = []; 
  let current = new Date(startDate.split('.').reverse().join('-')); 
  const end = new Date(endDate.split('.').reverse().join('-'));
  while (current <= end) { 
    dates.push(current.toISOString().split('T')[0]); 
    current.setDate(current.getDate() + 1); 
  }
  return dates;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "timetable" | "jurnal" | "ish_reja" | "homeroom" | "settings" | "messenger">("boshqaruv");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const [myStudents, setMyStudents] = useState<any[]>([]); 
  const [myTimetable, setMyTimetable] = useState<any[]>([]); 
  const [allClasses, setAllClasses] = useState<any[]>([]); 
  const [myClasses, setMyClasses] = useState<string[]>([]);

  // SOZLAMALAR
  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  // MUROJAAT (FEEDBACK)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ message: "", isAnonymous: false });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // MESSENGER
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ id: "", name: "" });
  const [showChatMenu, setShowChatMenu] = useState(false);

  // CHORAK VA JADVAL STATE'LARI
  const [selectedTerm, setSelectedTerm] = useState("1-chorak"); 
  const [selectedTermPlan, setSelectedTermPlan] = useState("1-chorak"); 

  // ISH REJA
  const [selectedClassForPlan, setSelectedClassForPlan] = useState("");
  const [generatedDates, setGeneratedDates] = useState<any[]>([]);
  const [planForm, setPlanForm] = useState<{ [key: string]: { topic: string, homework: string, deadline: string } }>({});
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTopicsText, setBulkTopicsText] = useState("");

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [targetClassForSync, setTargetClassForSync] = useState("");

  // JURNAL
  const [selectedClassToGrade, setSelectedClassToGrade] = useState("");
  const [studentsInJournal, setStudentsInJournal] = useState<any[]>([]);
  const [localGrades, setLocalGrades] = useState<any>({});
  const [pastFixCounts, setPastFixCounts] = useState<any>({}); 
  
  const [gradeModal, setGradeModal] = useState<{ isOpen: boolean, type: 'today' | 'past' | 'bsb' | 'future', student: any, col: any } | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'keldi' | 'dq' | 'k'>('keldi');
  const [gradeInput, setGradeInput] = useState({ classwork: "", homework: "" });
  const [ppRequestType, setPpRequestType] = useState("+1"); 
  const [isGrading, setIsGrading] = useState(false);

  // ✅ MOVED INSIDE COMPONENT: These arrays are now accessible everywhere in the JSX
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const lessonNumbers = [1, 2, 3, 4, 5, 6];
  const groupTypes = ["Barchasi", "1-guruh", "2-guruh", "O'g'il bolalar", "Qizlar"];
  const subjectsBase = [
    "Algebra", "Geometriya", "Ona tili", "Adabiyot", "Ingliz tili", "Rus tili", 
    "Kimyo", "Biologiya", "Fizika", "Informatika", "O'zbekiston tarixi", "Jahon tarixi", 
    "Geografiya", "Tarbiya", "Davlat va huquq asoslari", "Iqtisodiyot", 
    "Jismoniy tarbiya", "Chizmachilik", "Texnologiya"
  ].sort(); 

  const todayNameString = "Ch"; 
  const journalColumns = [
    { label: "04.09", sub: "Dj", type: "past" }, 
    { label: "11.09", sub: "Dj", type: "past" }, 
    { label: "18.09", sub: "bugun", isToday: true, type: "today" }, 
    { label: "25.09", sub: "Dj", type: "future" }, 
    { label: "BSB", sub: "Dj", type: "bsb" }, 
    { label: "CHSB", sub: "Dj", type: "bsb" }
  ];

  // LOGIN & LOAD
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', loginForm.id).eq('password', loginForm.password).eq('role', 'teacher').single();
    if (data) setCurrentTeacher(data); 
    else alert("ID yoki Parol xato!");
    setIsLoading(false);
  };

  useEffect(() => { 
    if (currentTeacher) { 
      loadTeacherData(); 
      loadContacts(); 
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
      
      if (schedule) {
        const uniqueClasses = Array.from(new Set(schedule.map((s: any) => s.class_name))).sort() as string[];
        setMyClasses(uniqueClasses);
      }

      const { data: classesData } = await supabase.from('classes').select('*').order('name');
      setAllClasses(classesData || []);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const todayClasses = myTimetable.filter(t => t.day_of_week === todayNameString).sort((a,b) => a.lesson_number - b.lesson_number);

  const goToJournal = async (className: string) => {
    setActiveMenu("jurnal"); 
    handleSelectClassJournal(className);
  };

  // MESSENGER
  const loadContacts = async () => {
    const { data } = await supabase.from('contacts').select('*').eq('owner_id', currentTeacher?.id);
    setContacts(data || []);
  };
  const loadMessages = async (contact_id: string) => {
    const { data } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${currentTeacher.id},receiver_id.eq.${contact_id}),and(sender_id.eq.${contact_id},receiver_id.eq.${currentTeacher.id})`).order('created_at', { ascending: true });
    setMessages(data || []);
  };
  const handleAddContact = async () => {
    if(!contactForm.id || !contactForm.name) return alert("To'ldiring!");
    await supabase.from('contacts').insert([{ owner_id: currentTeacher.id, contact_id: contactForm.id.toUpperCase(), contact_name: contactForm.name }]);
    setShowAddContact(false); 
    setContactForm({id: "", name: ""}); 
    loadContacts();
  };
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if(!msgInput.trim() || !activeChat) return;
    const newMsg = { id: Date.now(), sender_id: currentTeacher.id, text: msgInput, created_at: new Date().toISOString() };
    setMessages([...messages, newMsg]); 
    setMsgInput("");
    await supabase.from('messages').insert([{ sender_id: currentTeacher.id, receiver_id: activeChat.contact_id, text: newMsg.text }]);
  };
  const handleClearHistory = async () => {
    if(confirm("Tarixni butunlay o'chirib yuborasizmi?")) {
      await supabase.from('messages').delete().or(`and(sender_id.eq.${currentTeacher.id},receiver_id.eq.${activeChat.contact_id}),and(sender_id.eq.${activeChat.contact_id},receiver_id.eq.${currentTeacher.id})`);
      setMessages([]); 
      setShowChatMenu(false);
    }
  };

  // ISH REJA ALGORITMI
  const generateLessonDates = () => {
    if (!selectedClassForPlan) return;
    const classSchedule = myTimetable.filter(t => t.class_name === selectedClassForPlan && t.term === selectedTermPlan);
    if (classSchedule.length === 0) return alert("Bu sinf va chorak uchun dars jadvali tuzilmagan!");
    
    const lessonDays = Array.from(new Set(classSchedule.map(t => t.day_of_week)));
    const startDate = classSchedule[0].start_date; 
    const endDate = classSchedule[0].end_date;
    if(!startDate || !endDate) return alert("Chorak sanalari belgilanmagan!");

    const allDates = getDatesInRange(startDate, endDate);
    const validLessonDates = [];
    for (let d of allDates) {
      const dayName = getDayName(d);
      const formattedD = formatDate(d);
      if (lessonDays.includes(dayName) && !HOLIDAYS.includes(formattedD)) {
        validLessonDates.push({ date: formattedD, dayName });
      }
    }
    setGeneratedDates(validLessonDates); 
    setPlanForm({});
  };

  const handleBulkInsert = () => {
    const topics = bulkTopicsText.split('\n').filter(t => t.trim() !== "");
    const newPlanForm = { ...planForm };
    for (let i = 0; i < Math.min(topics.length, generatedDates.length); i++) {
      newPlanForm[generatedDates[i].date] = { topic: topics[i], homework: "Mavzuni o'qish", deadline: "Keyingi darsgacha" };
    }
    setPlanForm(newPlanForm); 
    setShowBulkModal(false); 
    setBulkTopicsText("");
  };

  const handlePlanChange = (date: string, field: string, value: string) => {
    setPlanForm({ ...planForm, [date]: { ...planForm[date], [field]: value } });
  };

  const handleSaveFullPlan = async () => {
    setIsLoading(true); 
    let inserted = 0;
    await supabase.from('homeworks').delete().eq('class_name', selectedClassForPlan).eq('subject', currentTeacher.bio);

    for (let gDate of generatedDates) {
      const plan = planForm[gDate.date];
      if (plan && plan.topic) {
        await supabase.from('homeworks').insert([{ 
          class_name: selectedClassForPlan, 
          subject: currentTeacher.bio, 
          topic: plan.topic, 
          description: plan.homework || "", 
          deadline: plan.deadline || "Keyingi darsgacha", 
          date: gDate.date 
        }]);
        inserted++;
      }
    }
    alert(`${inserted} ta dars rejasi saqlandi va o'quvchilarga yuborildi!`);
    setIsLoading(false);
  };

  const handleSyncToClass = async () => {
    if(!targetClassForSync) return alert("Sinfni tanlang!");
    if(targetClassForSync === selectedClassForPlan) return alert("Boshqa sinfni tanlang!");
    setIsLoading(true);

    const targetSchedule = myTimetable.filter(t => t.class_name === targetClassForSync && t.term === selectedTermPlan);
    if(targetSchedule.length === 0) { 
      setIsLoading(false); 
      return alert("Ushbu sinf uchun dars jadvali yo'q!"); 
    }
    
    const lessonDays = Array.from(new Set(targetSchedule.map(t => t.day_of_week)));
    const startDate = targetSchedule[0].start_date; 
    const endDate = targetSchedule[0].end_date;
    
    const allDates = getDatesInRange(startDate, endDate);
    const targetValidDates = [];
    for (let d of allDates) {
      const dayName = getDayName(d);
      const formattedD = formatDate(d);
      if (lessonDays.includes(dayName) && !HOLIDAYS.includes(formattedD)) {
        targetValidDates.push(formattedD);
      }
    }

    const currentTopics = Object.values(planForm).filter(p => p.topic !== "");
    if(currentTopics.length === 0) { 
      setIsLoading(false); 
      return alert("Sinxronlash uchun avval mavzularni kiriting!"); 
    }

    await supabase.from('homeworks').delete().eq('class_name', targetClassForSync).eq('subject', currentTeacher.bio);

    let inserted = 0;
    for (let i = 0; i < Math.min(currentTopics.length, targetValidDates.length); i++) {
      const targetDate = targetValidDates[i];
      const topicData = currentTopics[i];
      await supabase.from('homeworks').insert([{ 
        class_name: targetClassForSync, 
        subject: currentTeacher.bio, 
        topic: topicData.topic, 
        description: topicData.homework || "Mavzuni takrorlash", 
        deadline: topicData.deadline || "Keyingi darsgacha", 
        date: targetDate 
      }]);
      inserted++;
    }

    alert(`Muvaffaqiyatli! ${inserted} ta mavzu ${targetClassForSync} sinfining ${selectedTermPlan} dars kunlariga moslab ko'chirildi!`);
    setShowSyncModal(false);
    setIsLoading(false);
  };

  // JURNAL LOGIKASI
  const handleSelectClassJournal = async (className: string) => {
    setSelectedClassToGrade(className);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsInJournal(data || []);
  };

  const handleCellClick = (student: any, col: any) => {
    if (col.type === "future") return alert("Kelajakdagi darslarga baho qo'yish taqiqlangan!");
    setAttendanceStatus('keldi'); 
    setGradeInput({ classwork: "", homework: "" }); 
    setGradeModal({ isOpen: true, type: col.type, student, col });
  };

  const submitTodayGrade = async () => {
    setIsGrading(true); 
    const student = gradeModal?.student; 
    let addedCP = 0; 
    let finalVisualGrade = "";
    
    if (attendanceStatus === 'dq') { 
      addedCP = -5; finalVisualGrade = "DQ"; 
    } 
    else if (attendanceStatus === 'k') { 
      addedCP = 0;  finalVisualGrade = "K"; 
    } 
    else {
      if (!gradeInput.classwork && !gradeInput.homework) { 
        setIsGrading(false); 
        return alert("Baho kiriting (1 dan 10 gacha)!"); 
      }
      let total = 0; let count = 0;
      if (gradeInput.classwork) { total += parseInt(gradeInput.classwork); count++; }
      if (gradeInput.homework) { total += parseInt(gradeInput.homework); count++; }
      const avg = Math.round(total / count); 
      finalVisualGrade = avg.toString();
      
      if (avg >= 9.5) addedCP = 2; 
      else if (avg >= 8.5) addedCP = 1; 
      else if (avg >= 7.5) addedCP = 0; 
      else addedCP = -2;
    }
    
    const newCP = (student.cp_score || 0) + addedCP;
    const { error: profileError } = await supabase.from('profiles').update({ cp_score: newCP }).eq('id', student.id);
    
    if (!profileError) {
       const { data: allClassStudents } = await supabase.from('profiles').select('cp_score').eq('role', 'student').eq('class_name', selectedClassToGrade);
       let classTotalCP = 0; 
       if (allClassStudents) { 
         allClassStudents.forEach(s => { classTotalCP += (s.cp_score || 0) }); 
       }
       await supabase.from('classes').update({ total_cp: classTotalCP }).eq('name', selectedClassToGrade);
       
       const key = `${student.id}-${gradeModal?.col.label}`; 
       setLocalGrades((prev: any) => ({ ...prev, [key]: finalVisualGrade }));
       alert(`Baho saqlandi!\nNatija: ${addedCP > 0 ? '+'+addedCP+' CP' : addedCP < 0 ? addedCP+' CP (Jarima)' : '0 CP'}`); 
       setGradeModal(null);
    } else { 
      alert("Xatolik yuz berdi!"); 
    }
    setIsGrading(false);
  };

  const submitPPRequest = async () => {
    setIsGrading(true); 
    const student = gradeModal?.student; 
    let amount = 0; 
    let reason = "";
    
    if (gradeModal?.type === 'past') { 
      const currentCount = pastFixCounts[student.id] || 0;
      if (currentCount === 0) amount = 500; 
      else if (currentCount === 1) amount = 700; 
      else amount = 1000;
      reason = `${gradeModal?.col.label} sanasidagi bahoni to'g'rilash`;
    } else { 
      amount = ppRequestType === '+1' ? 10000 : 20000; 
      reason = `Yozma ishdan ${ppRequestType} ball qo'shish`; 
    }
    
    const { error } = await supabase.from('notifications').insert([{ 
      user_id: student.id, 
      title: "Ustozdan To'lov So'rovi", 
      message: `Ustoz sizdan ${amount} PP to'lov so'rayapti.\nSabab: ${reason}\n\nRozimisiz?` 
    }]);
    
    if (!error) { 
      alert(`So'rov o'quvchiga yuborildi!\nRozilik bersa sizga xabar keladi.`);
      if (gradeModal?.type === 'past') {
        setPastFixCounts({...pastFixCounts, [student.id]: (pastFixCounts[student.id] || 0) + 1});
      }
      setGradeModal(null); 
    } else alert("Xatolik!");
    
    setIsGrading(false);
  };

  const handleSendFeedback = async () => {
    if (!feedbackForm.message) return alert("Xabar yozing!");
    setIsSendingFeedback(true);
    await supabase.from('feedbacks').insert([{ 
      sender_id: currentTeacher.id, 
      sender_name: currentTeacher.full_name, 
      message: feedbackForm.message, 
      is_anonymous: feedbackForm.isAnonymous 
    }]);
    alert("Murojaat ketdi!"); 
    setShowFeedbackModal(false); 
    setFeedbackForm({ message: "", isAnonymous: false });
    setIsSendingFeedback(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 4) return alert("Parol qisqa!");
    setIsChanging(true);
    await supabase.from('profiles').update({ password: newPassword }).eq('id', currentTeacher.id);
    alert("Parol yangilandi! Direktor panelida ham darhol o'zgardi."); 
    setCurrentTeacher({ ...currentTeacher, password: newPassword }); 
    setNewPassword(""); 
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

  // UI RENDERING
  if (!currentTeacher) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 font-sans p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-8 border-indigo-900 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10"/>
          </div>
          <h2 className="text-3xl font-black text-center mb-2 text-slate-900">USTOZ KIRISH</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Sizning ID (T-XXXX)" className="w-full p-5 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-black text-center text-lg uppercase" onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toUpperCase()})} />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Maxfiy Parol" className="w-full p-5 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-black text-center text-lg pr-14 uppercase" onChange={(e) => setLoginForm({...loginForm, password: e.target.value.toUpperCase()})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-2 cursor-pointer">
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all text-lg disabled:opacity-50">
              {isLoading ? "KIRILMOQDA..." : "KIRISH"}
            </button>
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
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">
            {currentTeacher.full_name?.charAt(0) || "T"}
          </div>
          <div>
            <h2 className="text-xl font-black text-white truncate w-40">{currentTeacher.full_name}</h2>
            <p className="text-xs font-bold text-indigo-400">{currentTeacher.bio} fani o'qituvchisi</p>
          </div>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy Panel
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'timetable' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3" /> Dars Jadvalim
          </button>
          <button onClick={() => setActiveMenu("jurnal")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'jurnal' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <TableProperties className="w-5 h-5 mr-3" /> Jurnal & Baholash
          </button>
          <button onClick={() => setActiveMenu("ish_reja")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'ish_reja' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <ListTodo className="w-5 h-5 mr-3" /> Ish Reja
          </button>
          <button onClick={() => setActiveMenu("messenger")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'messenger' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <MessageCircle className="w-5 h-5 mr-3" /> Messenger
          </button>
          {currentTeacher.homeroom && (
            <button onClick={() => setActiveMenu("homeroom")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-4 ${activeMenu === 'homeroom' ? 'bg-amber-500 text-white' : 'text-amber-300 hover:bg-white/5 hover:text-white'}`}>
              <Users className="w-5 h-5 mr-3" /> Mening Sinfim
            </button>
          )}
          <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-8 ${activeMenu === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
            <Settings className="w-5 h-5 mr-3" /> Sozlamalar
          </button>
        </nav>
        <button onClick={() => setCurrentTeacher(null)} className="w-full flex items-center justify-center p-4 rounded-2xl text-red-400 font-black hover:bg-red-500/10 mt-4">
          <LogOut className="w-5 h-5 mr-2" /> Chiqish
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12 relative pb-24">
        
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

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ASOSIY PANEL */}
          {activeMenu === "boshqaruv" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-indigo-500"/> Bugungi Darslaringiz ({todayNameString}shanba)
              </h2>
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
                       {t.group_type && t.group_type !== 'Barchasi' && (
                         <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">{t.group_type}</span>
                       )}
                       <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest flex items-center">Sinf jurnaliga kirish <span className="ml-2">➔</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SINF RAHBARI: MENING SINFIM */}
          {activeMenu === "homeroom" && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[700px]">
              <div className="p-8 border-b border-slate-100 bg-white">
                 <h2 className="text-2xl font-black text-slate-900 flex items-center"><Users className="w-6 h-6 mr-3 text-amber-500"/> Mening Sinfim: {currentTeacher.homeroom}</h2>
                 <p className="text-slate-500 text-sm mt-1">Sinfingizdagi o'quvchilar ro'yxati, ID va parollari</p>
              </div>
              <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
                {myStudents.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-3xl bg-white">Sinfingizda hozircha o'quvchilar yo'q.</div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="p-4 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs">№</th>
                          <th className="p-4 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs">F.I.SH</th>
                          <th className="p-4 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs text-center">ID Raqami</th>
                          <th className="p-4 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs text-center">Parol</th>
                          <th className="p-4 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs text-center">Reyting (CP)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myStudents.map((s, i) => (
                          <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-400">{i + 1}</td>
                            <td className="p-4 font-bold text-slate-800">{s.full_name}</td>
                            <td className="p-4 font-black text-indigo-600 text-center">{s.id}</td>
                            <td className="p-4 text-center"><span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono font-bold rounded-lg tracking-widest">{s.password}</span></td>
                            <td className="p-4 font-black text-emerald-500 text-center">{s.cp_score || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ISH REJA */}
          {activeMenu === "ish_reja" && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[700px]">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center"><ListTodo className="w-6 h-6 mr-3 text-indigo-600"/> Avtomatik Ish Reja</h2>
                 </div>
                 <div className="flex flex-wrap gap-3">
                   <select value={selectedClassForPlan} onChange={e => setSelectedClassForPlan(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 shadow-sm">
                      <option value="">Sinfni tanlang</option>
                      {myClasses.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   <select value={selectedTermPlan} onChange={e => setSelectedTermPlan(e.target.value)} className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:border-indigo-500 font-black text-indigo-700 shadow-sm">
                      <option value="1-chorak">1-chorak</option>
                      <option value="2-chorak">2-chorak</option>
                      <option value="3-chorak">3-chorak</option>
                      <option value="4-chorak">4-chorak</option>
                   </select>
                   <button onClick={generateLessonDates} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-md">SANALARNI KIRITISH</button>
                 </div>
              </div>

              {!selectedClassForPlan || generatedDates.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 bg-slate-50/50">
                  <Calendar className="w-24 h-24 mb-6 opacity-20 text-indigo-500" />
                  <h2 className="font-black text-2xl tracking-tight text-center max-w-md">Yuqoridan sinfni tanlang va tugmani bosing.</h2>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto p-8 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-indigo-100 text-indigo-700 font-black px-4 py-2 rounded-xl text-sm">Jami darslar: {generatedDates.length} ta</div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowSyncModal(true)} className="px-5 py-2.5 bg-white border-2 border-emerald-200 text-emerald-600 font-black rounded-xl hover:bg-emerald-50 shadow-sm flex items-center">
                        <Copy className="w-4 h-4 mr-2"/> Boshqa sinfga nusxalash
                      </button>
                      <button onClick={() => setShowBulkModal(true)} className="px-5 py-2.5 bg-white border-2 border-indigo-200 text-indigo-600 font-black rounded-xl hover:bg-indigo-50 shadow-sm flex items-center">
                        <DownloadCloud className="w-4 h-4 mr-2"/> Ommaviy kiritish (Paste)
                      </button>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 text-slate-400 font-black text-xs w-16 text-center">№</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest w-40">Sana</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest">Mavzu</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest w-64">Uy vazifasi</th>
                          <th className="p-4 text-slate-500 font-black uppercase text-xs tracking-widest w-48">Muddat</th>
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
                                <input type="text" placeholder="Mavzu..." className="w-full p-3 bg-transparent outline-none font-medium text-slate-800" value={pData.topic} onChange={(e) => handlePlanChange(dateKey, 'topic', e.target.value)} />
                              </td>
                              <td className="p-2 border-l border-slate-100">
                                <input type="text" placeholder="Vazifa..." className="w-full p-3 bg-transparent outline-none text-sm text-slate-600" value={pData.homework} onChange={(e) => handlePlanChange(dateKey, 'homework', e.target.value)} />
                              </td>
                              <td className="p-2 border-l border-slate-100">
                                <select className="w-full p-3 bg-transparent outline-none text-xs font-bold text-slate-500" value={pData.deadline} onChange={(e) => handlePlanChange(dateKey, 'deadline', e.target.value)}>
                                  <option value="Keyingi darsgacha">Keyingi darsgacha</option>
                                  <option value="Ertaga 08:00">Ertaga 08:00</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveFullPlan} disabled={isLoading} className="px-10 py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center">
                      {isLoading ? "SAQLANMOQDA..." : <><CheckCircle className="w-6 h-6 mr-3"/> O'QUVCHILARGA YUBORISH</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DARS JADVALIM (TO'LIQ) */}
          {activeMenu === "timetable" && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col animate-in fade-in">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center">
                     <Calendar className="text-indigo-600 mr-3"/> Shaxsiy Dars Jadvalingiz
                   </h2>
                   <p className="text-slate-500 font-medium mt-1">Faqat sizning darslaringiz ko'rsatilgan.</p>
                 </div>
                 <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="bg-white px-4 py-3 rounded-xl font-black text-sm outline-none text-indigo-700 shadow-sm cursor-pointer border border-slate-200">
                    <option value="1-chorak">1-chorak</option>
                    <option value="2-chorak">2-chorak</option>
                    <option value="3-chorak">3-chorak</option>
                    <option value="4-chorak">4-chorak</option>
                 </select>
              </div>
              
              <div className="flex-1 overflow-x-auto p-8">
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
                          const cellLessons = myTimetable.filter(t => t.day_of_week === day && t.lesson_number === num && t.term === selectedTerm);
                          return (
                            <td key={day+num} className={`p-2 border-b border-slate-100 h-32 w-44 transition-all align-top ${cellLessons.length > 0 ? 'bg-indigo-50/30' : ''}`}>
                              {cellLessons.length > 0 ? (
                                <div className="flex flex-col gap-2 h-full">
                                  {cellLessons.map(lesson => (
                                    <div key={lesson.id} className="h-full flex flex-col justify-center bg-indigo-600 rounded-xl p-3 shadow-md text-white">
                                      <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-black text-lg">{lesson.class_name}</h3>
                                        {lesson.group_type && lesson.group_type !== 'Barchasi' && (
                                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase">{lesson.group_type}</span>
                                        )}
                                      </div>
                                      <p className="text-xs font-medium text-indigo-200">{lesson.subject}</p>
                                      {lesson.room && <p className="text-[10px] font-bold text-indigo-300 mt-2">{lesson.room}</p>}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-slate-200 text-xs font-bold uppercase">Bo'sh</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* JURNAL / BAHOLASH */}
          {activeMenu === "jurnal" && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col animate-in fade-in">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center">
                     <TableProperties className="text-indigo-600 mr-3"/> Baholash Jurnali
                   </h2>
                   <p className="text-slate-500 font-medium mt-1">Sizga biriktirilgan sinflarni baholang.</p>
                 </div>
                 
                 <div className="flex gap-4">
                   <div className="bg-white p-1.5 rounded-2xl flex border border-slate-200 shadow-sm">
                     {myClasses.length === 0 ? (
                       <div className="px-5 py-2.5 text-sm font-bold text-slate-400">Sizga hech qanday sinf biriktirilmagan</div>
                     ) : (
                       <select 
                         value={selectedClassToGrade} 
                         onChange={(e) => handleSelectClassJournal(e.target.value)}
                         className="px-4 py-2 font-black text-indigo-700 outline-none bg-transparent cursor-pointer"
                       >
                         <option value="">Sinfni tanlang...</option>
                         {myClasses.map(cls => (
                           <option key={cls} value={cls}>{cls} - sinf</option>
                         ))}
                       </select>
                     )}
                   </div>
                 </div>
              </div>

              <div className="flex-1 p-8">
                {!selectedClassToGrade ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <Users className="w-20 h-20 mb-4 opacity-20"/>
                    <p className="text-xl font-bold italic">Tepadan o'zingizning sinfingizni tanlang</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-black text-slate-800">{selectedClassToGrade} o'quvchilari ro'yxati</h3>
                      <p className="text-sm font-bold text-slate-400">Jami: {studentsInJournal.length} ta o'quvchi</p>
                    </div>
                    
                    {studentsInJournal.length === 0 ? (
                      <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold">
                        Bu sinfda hozircha o'quvchilar yo'q.
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-100 text-slate-400 uppercase text-xs font-black tracking-widest">
                            <th className="p-4 w-16 text-center">№</th>
                            <th className="p-4">O'quvchi F.I.SH</th>
                            <th className="p-4 text-center">Joriy Baho (PP)</th>
                            <th className="p-4 text-right">Baholash</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsInJournal.map((student, index) => (
                            <tr key={student.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                              <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                              <td className="p-4 font-bold text-slate-900">{student.full_name}</td>
                              <td className="p-4 text-center">
                                <span className="bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-lg">
                                  {student.pp_balance || 0} PP
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                  <button className="w-10 h-10 rounded-xl bg-red-100 text-red-600 font-black hover:bg-red-500 hover:text-white transition-colors">-</button>
                                  <button className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-black hover:bg-emerald-500 hover:text-white transition-colors">+</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MESSENGER */}
          {activeMenu === "messenger" && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex overflow-hidden">
              <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div className="relative flex-1 mr-2">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Qidiruv..." className="w-full bg-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <button onClick={() => setShowAddContact(true)} className="p-2.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {contacts.map(c => (
                    <div key={c.id} onClick={() => { setActiveChat(c); loadMessages(c.contact_id); setShowChatMenu(false); }} className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-50 transition-all ${activeChat?.id === c.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-100'}`}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                        {c.contact_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${activeChat?.id === c.id ? 'text-indigo-900' : 'text-slate-800'}`}>{c.contact_name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{c.contact_id}</p>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && <p className="text-center text-slate-400 text-sm mt-10 p-4">Kontakt qo'shing.</p>}
                </div>
              </div>
              <div className="flex-1 flex flex-col bg-[#f0f2f5] relative">
                {activeChat ? (
                  <>
                    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black">
                          {activeChat.contact_name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="font-bold text-slate-800">{activeChat.contact_name}</h2>
                          <p className="text-[11px] text-slate-500 uppercase tracking-widest">O'quvchi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 relative">
                        <button onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full">
                          <MoreVertical className="w-5 h-5"/>
                        </button>
                        {showChatMenu && (
                          <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in zoom-in-95">
                            <button onClick={handleClearHistory} className="w-full flex items-center px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-50">
                              <Trash2 className="w-4 h-4 mr-3"/> Tarixni tozalash
                            </button>
                            <button className="w-full flex items-center px-4 py-3 text-sm text-slate-700 font-bold hover:bg-slate-50">
                              <BellOff className="w-4 h-4 mr-3 text-slate-400"/> Ovozsiz (Mute)
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button className="w-full flex items-center px-4 py-3 text-sm text-slate-700 font-bold hover:bg-slate-50">
                              <Ban className="w-4 h-4 mr-3 text-slate-400"/> Bloklash
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map(msg => {
                        const isMe = msg.sender_id === currentTeacher.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-[15px] ${isMe ? 'bg-[#e3ffc2] text-slate-800 rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm'}`}>
                              <p>{msg.text}</p>
                              <div className={`text-[10px] text-right mt-1 ${isMe ? 'text-green-700' : 'text-slate-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {isMe && '✓✓'}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
                      <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Xabar yozing..." className="flex-1 bg-slate-100 rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                      <button type="submit" className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 shadow-md transition-transform active:scale-95">
                        <Send className="w-5 h-5 ml-1"/>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <MessageCircle className="w-20 h-20 mb-4 opacity-20"/>
                    <p className="font-bold text-lg">Yozishish uchun chapdan chatni tanlang</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOZLAMALAR */}
          {activeMenu === "settings" && (
            <div className="max-w-xl bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mx-auto mt-10">
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6">
                <Settings className="w-8 h-8"/>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Sozlamalar</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Shaxsiy parolingizni o'zgartiring</p>
              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yangi parol yozing..." className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl mb-6 font-black text-lg outline-none text-center" />
              <button onClick={handleChangePassword} disabled={isChanging} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center text-lg disabled:opacity-50">
                {isChanging ? "SAQLANMOQDA..." : "PAROLNI SAQLASH"}
              </button>
            </div>
          )}

        </div>
      </main>

      {/* FLOAT MUROJAAT TUGMASI */}
      <div className="fixed bottom-4 w-[90%] md:w-auto left-1/2 transform -translate-x-1/2 z-40">
        <button onClick={() => setShowFeedbackModal(true)} className="w-full md:w-auto bg-slate-900/90 backdrop-blur-md text-slate-300 text-[13px] font-medium px-6 py-2.5 rounded-full shadow-2xl hover:text-white flex items-center justify-center gap-2 transition-all hover:bg-slate-900">
          <MessageSquare className="w-4 h-4 text-indigo-400"/> Tizim bo'yicha murojaat yo'llash
        </button>
      </div>

      {/* MODALLAR */}

      {/* MUROJAAT MODALI */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-900 flex justify-between items-center">
                <h3 className="text-xl font-black text-white flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-indigo-400"/> Murojaat yo'llash</h3>
                <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <textarea rows={4} placeholder="Fikringizni yozing..." className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-medium outline-none resize-none" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})}></textarea>
                 <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                   <input type="checkbox" className="w-5 h-5 accent-slate-900" checked={feedbackForm.isAnonymous} onChange={e => setFeedbackForm({...feedbackForm, isAnonymous: e.target.checked})} />
                   <div>
                     <p className="font-bold text-sm">Anonim yuborish</p>
                     <p className="text-xs text-slate-500">Ismingiz ko'rinmaydi</p>
                   </div>
                 </label>
                 <button onClick={handleSendFeedback} disabled={isSendingFeedback} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50">
                   {isSendingFeedback ? "YUBORILMOQDA..." : "YUBORISH"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* BAHOLASH MODALI */}
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
                         <p className="text-sm font-bold text-center">{attendanceStatus === 'dq' ? "-5 CP jarima yechiladi." : "Kasal bo'lgani uchun 0 CP."}</p>
                       </div>
                     )}
                     <button onClick={submitTodayGrade} disabled={isGrading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all">
                       {isGrading ? "SAQLANMOQDA..." : "JURNALGA SAQLASH (BEPUL)"}
                     </button>
                   </>
                 )}
                 {gradeModal.type === 'past' && (
                   <>
                     <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-center">
                        <Award className="w-12 h-12 mx-auto text-amber-500 mb-3"/>
                        <h4 className="font-black text-amber-900 text-lg mb-2">Eski bahoni to'g'rilash</h4>
                        <p className="text-amber-700 text-sm font-medium">To'lov narxi: <b className="text-amber-900 ml-1">{(!pastFixCounts[gradeModal.student.id] || pastFixCounts[gradeModal.student.id] === 0) ? '500 PP' : pastFixCounts[gradeModal.student.id] === 1 ? '700 PP' : '1000 PP'}</b></p>
                     </div>
                     <button onClick={submitPPRequest} disabled={isGrading} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center">
                       {isGrading ? "YUBORILMOQDA..." : <><Send className="w-5 h-5 mr-2"/> SO'ROV YUBORISH</>}
                     </button>
                   </>
                 )}
                 {gradeModal.type === 'bsb' && (
                   <>
                     <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-200 text-center">
                        <Award className="w-12 h-12 mx-auto text-indigo-500 mb-3"/>
                        <h4 className="font-black text-indigo-900 text-lg mb-2">BSB/CHSB uchun ball qo'shish</h4>
                        <select value={ppRequestType} onChange={(e) => setPpRequestType(e.target.value)} className="w-full p-4 bg-white border border-indigo-200 rounded-xl outline-none focus:border-indigo-500 font-black text-indigo-900 shadow-sm mt-2">
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

      {/* KONTAKT QO'SHISH MODALI */}
      {showAddContact && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAddContact(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()}>
             <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center"><h3 className="font-black text-indigo-900">Yangi Kontakt</h3></div>
             <div className="p-6 space-y-4">
               <input type="text" placeholder="ID (S-8392 yoki T-1122)" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-mono uppercase" value={contactForm.id} onChange={e=>setContactForm({...contactForm, id: e.target.value})} />
               <input type="text" placeholder="Ism qo'ying" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={contactForm.name} onChange={e=>setContactForm({...contactForm, name: e.target.value})} />
               <button onClick={handleAddContact} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700">SAQLASH</button>
             </div>
          </div>
        </div>
      )}

      {/* BULK KISITISH MODALI */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowBulkModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-indigo-50 flex justify-between items-center border-b border-indigo-100">
                <h3 className="text-xl font-black text-indigo-900 flex items-center"><DownloadCloud className="w-6 h-6 mr-3"/> Ommaviy Kiritish</h3>
                <button onClick={() => setShowBulkModal(false)} className="text-indigo-400 hover:text-indigo-700"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <textarea rows={10} className="w-full p-5 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-medium outline-none resize-none leading-relaxed" placeholder="1. Mavzu&#10;2. Keyingi mavzu" value={bulkTopicsText} onChange={e => setBulkTopicsText(e.target.value)}></textarea>
                 <button onClick={handleBulkInsert} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 mt-4">TIZIMGA JOYLASHTIRISH</button>
              </div>
           </div>
        </div>
      )}

      {/* SINXRONLASH MODALI */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowSyncModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-emerald-50 flex justify-between items-center border-b border-emerald-100">
                <h3 className="text-xl font-black text-emerald-900 flex items-center"><Copy className="w-5 h-5 mr-3"/> Sinxronlash</h3>
                <button onClick={() => setShowSyncModal(false)} className="text-emerald-400 hover:text-emerald-700"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <p className="text-sm font-bold text-slate-600 mb-2">Qaysi parallel sinfga dars mavzularini ko'chirmoqchisiz?</p>
                 <select value={targetClassForSync} onChange={e => setTargetClassForSync(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700 shadow-sm">
                    <option value="">Sinfni tanlang</option>
                    {allClasses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                 </select>
                 <button onClick={handleSyncToClass} disabled={isLoading} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 disabled:opacity-50 mt-4">
                   {isLoading ? "KO'CHIRILMOQDA..." : "NUSXA OLISH"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

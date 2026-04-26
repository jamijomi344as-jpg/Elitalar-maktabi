"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Calendar, Award, Star, BookOpen, 
  Clock, ShieldCheck, Key, CheckCircle, LogOut, Settings, Eye, EyeOff, 
  TableProperties, Send, AlertCircle, FileText, X, PlusCircle, Video
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
  // JURNAL
  // ==========================================
  const [selectedClassToGrade, setSelectedClassToGrade] = useState("");
  const [studentsInJournal, setStudentsInJournal] = useState<any[]>([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeCell, setActiveCell] = useState<{studentId: string, studentName: string, dateOrType: string} | null>(null);
  
  const [gradeInput, setGradeInput] = useState({ classwork: "", homework: "", status: "" });
  const [isGrading, setIsGrading] = useState(false);

  // Ekranda ko'rinishi uchun baholarni vaqtincha saqlaydigan xotira
  const [localGrades, setLocalGrades] = useState<any>({});

  // Rasmdagi kabi sanalar
  const journalColumns = [
    { label: "04.09", sub: "Dj" }, { label: "09.09", sub: "Dj" }, { label: "11.09", sub: "Dj" }, 
    { label: "16.09", sub: "Dj" }, { label: "18.09", sub: "bugun", isToday: true }, 
    { label: "23.09", sub: "Dj" }, { label: "25.09", sub: "Dj" }, { label: "30.09", sub: "Dj" }
  ];

  // ==========================================
  // LOGIN VA YUKLASH
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', loginForm.id).eq('password', loginForm.password).eq('role', 'teacher').single();
    if (data) setCurrentTeacher(data);
    else alert("ID yoki Parol xato! Direktor bergan ma'lumotni to'g'ri kiriting.");
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

  // ==========================================
  // ISH REJA LOGIKASI
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
  // JURNAL LOGIKASI
  // ==========================================
  const handleSelectClassJournal = async (className: string) => {
    setSelectedClassToGrade(className);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', className).order('full_name');
    setStudentsInJournal(data || []);
  };

  const openGradeModal = (studentId: string, studentName: string, col: string) => {
    setActiveCell({ studentId, studentName, dateOrType: col });
    setGradeInput({ classwork: "", homework: "", status: "" });
    setShowGradeModal(true);
  };

  const submitGrade = async () => {
    if (!gradeInput.classwork && !gradeInput.homework && !gradeInput.status) return alert("Baholash uchun biror narsa kiriting!");
    setIsGrading(true);
    const student = studentsInJournal.find(s => s.id === activeCell?.studentId);
    
    if (student) {
      let addedCP = 0; let totalGrade = 0; let count = 0;
      let finalVisualGrade = gradeInput.status || "";

      if (gradeInput.classwork) { totalGrade += parseInt(gradeInput.classwork); count++; }
      if (gradeInput.homework) { totalGrade += parseInt(gradeInput.homework); count++; }

      if (count > 0) {
        const avgGrade = Math.round(totalGrade / count);
        finalVisualGrade = avgGrade.toString(); // Ekranda ko'rsatish uchun
        if (avgGrade >= 9.5) addedCP = 2; else if (avgGrade >= 8.5) addedCP = 1; else if (avgGrade >= 7.5) addedCP = 0; else addedCP = -2;
      }
      if (gradeInput.status === 'DQ') addedCP = -5; else if (gradeInput.status === 'K') addedCP = 0;

      const newCP = (student.cp_score || 0) + addedCP;
      const { error } = await supabase.from('profiles').update({ cp_score: newCP }).eq('id', student.id);

      if (!error) {
        // Ekranda darhol ko'rinishi uchun saqlaymiz
        const key = `${student.id}-${activeCell?.dateOrType}`;
        setLocalGrades((prev: any) => ({ ...prev, [key]: finalVisualGrade }));

        const cpMessage = addedCP > 0 ? `+${addedCP} CP qo'shildi! 🚀` : addedCP < 0 ? `${addedCP} CP yechildi 📉` : `CP o'zgarmadi ⚖️`;
        alert(`Jurnalga saqlandi!\n\n${cpMessage}`);
        setShowGradeModal(false);
      } else { alert("Xatolik: " + error.message); }
    }
    setIsGrading(false);
  };

  const sendPPRequest = () => {
    alert(`So'rov yuborildi!\nO'quvchi ${activeCell?.studentName} qabul qilsa, uning hamyonidan PP yechiladi va o'zlashtirishi to'g'irlanadi.`);
    setShowGradeModal(false);
  };

  // ==========================================
  // SOZLAMALAR
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

  // Rangli baho katakchasini chizish funksiyasi
  const renderGradeBadge = (val: string) => {
    if (!val) return null;
    if (val === 'K' || val === 'DQ') return <div className="text-red-500 font-bold text-xs">{val}</div>;
    const num = parseInt(val);
    if (num >= 8) return <div className="w-5 h-5 bg-emerald-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
    if (num >= 6) return <div className="w-5 h-5 bg-amber-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
    return <div className="w-5 h-5 bg-red-500 text-white rounded-[4px] flex items-center justify-center font-bold text-[11px] shadow-sm">{num}</div>;
  };

  // ==========================================
  // LOGIN EKRANI
  // ==========================================
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-2">{showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}</button>
            </div>
            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all text-lg disabled:opacity-50">{isLoading ? "TEKSHIRILMOQDA..." : "KIRISH"}</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // ASOSIY KABINET
  // ==========================================
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
          <button onClick={() => setActiveMenu("timetable")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'timetable' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><Calendar className="w-5 h-5 mr-3" /> Dars Jadvalim</button>
          <button onClick={() => setActiveMenu("ish_reja")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'ish_reja' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><FileText className="w-5 h-5 mr-3" /> Ish Reja</button>
          <button onClick={() => setActiveMenu("jurnal")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'jurnal' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><TableProperties className="w-5 h-5 mr-3" /> Baholash (Jurnal)</button>
          {currentTeacher.homeroom && <button onClick={() => setActiveMenu("homeroom")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-4 ${activeMenu === 'homeroom' ? 'bg-amber-500 text-white shadow-xl' : 'text-amber-300 hover:bg-white/5 hover:text-white'}`}><Users className="w-5 h-5 mr-3" /> Mening Sinfim</button>}
          
          {/* SOZLAMALAR TUGMASI SHU YERDA */}
          <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all mt-8 ${activeMenu === 'settings' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}><Settings className="w-5 h-5 mr-3" /> Sozlamalar</button>
        </nav>
        <button onClick={() => setCurrentTeacher(null)} className="w-full flex items-center justify-center p-4 rounded-2xl text-red-400 font-black hover:bg-red-500/10 mt-4"><LogOut className="w-5 h-5 mr-2" /> Chiqish</button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-8 lg:p-12 relative">
        <div className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-48 h-48" /></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">Salom, {currentTeacher.full_name} 👋</h1>
            <div className="flex gap-4 mt-6">
              <span className="bg-white/20 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest backdrop-blur-md flex items-center"><Star className="w-4 h-4 mr-2 text-amber-300" /> {currentTeacher.bio} Fani</span>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Boshqaruv */}
          {activeMenu === "boshqaruv" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><Calendar className="w-8 h-8"/></div>
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Haftalik Darslar</h3>
                <p className="text-5xl font-black text-slate-900 mt-2">{myTimetable.length} <span className="text-2xl font-bold text-slate-300">soat</span></p>
              </div>
            </div>
          )}

          {/* ISH REJA */}
          {activeMenu === "ish_reja" && (
             <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[700px]">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center"><FileText className="w-6 h-6 mr-3 text-indigo-600"/> Ish Reja va Uy vazifalari</h2>
                   <div className="flex gap-2 mt-4">
                     <span className="px-4 py-1.5 bg-white border border-indigo-100 rounded-lg text-indigo-600 font-bold text-sm shadow-sm cursor-pointer hover:bg-indigo-50">1-chorak</span>
                     <span className="px-4 py-1.5 bg-transparent border border-slate-200 text-slate-500 rounded-lg font-bold text-sm cursor-pointer hover:bg-slate-50">2</span>
                     <span className="px-4 py-1.5 bg-transparent border border-slate-200 text-slate-500 rounded-lg font-bold text-sm cursor-pointer hover:bg-slate-50">3</span>
                     <span className="px-4 py-1.5 bg-transparent border border-slate-200 text-slate-500 rounded-lg font-bold text-sm cursor-pointer hover:bg-slate-50">4</span>
                   </div>
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
                  <h2 className="font-black text-2xl tracking-tight">Ko'rish uchun tepadagi ro'yxatdan sinf tanlang</h2>
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
                                <Video className="w-4 h-4 text-slate-300 cursor-pointer hover:text-blue-500" title="Video dars qo'shish"/>
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

          {/* 3. JURNAL (YANGI RASMDAGI DIZAYN) */}
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
                   <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 shadow-sm text-sm">
                     import
                   </button>
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
                                const val = localGrades[key]; // Qo'yilgan bahoni o'qish
                                return (
                                  <td key={cIdx} onClick={() => openGradeModal(student.id, student.full_name, col.label)} className={`p-1 border-b border-slate-200 cursor-pointer transition-colors relative group h-10 ${col.isToday ? 'border-x-blue-200 border-x bg-blue-50/20' : 'hover:bg-slate-50'}`}>
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

          {/* SOZLAMALAR (QAYTARILDI!) */}
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
      </main>

      {/* BAHOLASH MODALI (SHUNDAY QOLDI, PP HAM BOR) */}
      {showGradeModal && activeCell && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowGradeModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-blue-50 border-b border-blue-100 flex justify-between items-start">
                 <div>
                   <h3 className="text-2xl font-black text-blue-900">{activeCell.studentName}</h3>
                   <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">{activeCell.dateOrType} sanasiga baholash</p>
                 </div>
                 <button onClick={() => setShowGradeModal(false)} className="text-blue-300 hover:text-blue-600 bg-white rounded-full p-2"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-8 space-y-6">
                 <div>
                    <label className="block text-slate-400 font-black text-xs mb-3 uppercase tracking-widest">Davomat</label>
                    <div className="flex gap-2">
                       <button onClick={() => setGradeInput({...gradeInput, status: 'K'})} className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all border-2 ${gradeInput.status === 'K' ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-white border-slate-200 text-slate-500'}`}>Kasal (K)</button>
                       <button onClick={() => setGradeInput({...gradeInput, status: 'DQ'})} className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all border-2 ${gradeInput.status === 'DQ' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-white border-slate-200 text-slate-500'}`}>Sababsiz (DQ)</button>
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <label className="block text-slate-900 font-black text-sm mb-4">10 Ballik Baholash</label>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-slate-600">Dars ishtiroki:</span>
                      <input type="number" min="1" max="10" placeholder="1-10" value={gradeInput.classwork} onChange={e => setGradeInput({...gradeInput, classwork: e.target.value})} className="w-20 p-3 text-center bg-white border-2 border-blue-100 focus:border-blue-500 rounded-xl font-black text-lg outline-none"/>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600">Uy vazifasi:</span>
                      <input type="number" min="1" max="10" placeholder="1-10" value={gradeInput.homework} onChange={e => setGradeInput({...gradeInput, homework: e.target.value})} className="w-20 p-3 text-center bg-white border-2 border-blue-100 focus:border-blue-500 rounded-xl font-black text-lg outline-none"/>
                    </div>
                 </div>

                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200 relative overflow-hidden">
                    <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500 opacity-10" />
                    <p className="text-amber-800 font-bold text-sm mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> Bahoni to'g'rilash</p>
                    <p className="text-amber-700/70 text-xs font-medium mb-4 leading-relaxed">O'quvchi hisobidan PP yechib olish evaziga bahosini ko'tarish so'rovini yuborishingiz mumkin.</p>
                    <button onClick={sendPPRequest} className="w-full py-3 bg-amber-500 text-white rounded-xl font-black shadow-md hover:bg-amber-600 transition-all text-sm">
                      + PP SO'ROV YUBORISH
                    </button>
                 </div>

                 <button onClick={submitGrade} disabled={isGrading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center text-lg disabled:opacity-50">
                   {isGrading ? "SAQLANMOQDA..." : <><CheckCircle className="w-6 h-6 mr-2"/> JURNALGA SAQLASH</>}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

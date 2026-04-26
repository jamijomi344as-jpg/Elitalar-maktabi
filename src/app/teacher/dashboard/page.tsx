"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, X, Calendar, Clock, MapPin, History, Check, UserMinus, Stethoscope, ArrowLeft, BookOpen, Edit3, AlertCircle, FileText, Download, UploadCloud, Eye, Paperclip, ChevronRight, Lock, AlertTriangle, TrendingUp } from "lucide-react";

// ==========================================
// TYPESCRIPT PASPORTLARI
// ==========================================
export type DailyGrade = {
  id: number;
  val: number | null;
  hwVal: number | null;
  attendance: string;
  date: string;
};

export type Student = {
  id: string;
  class: string;
  name: string;
  balancePP: number; // O'quvchining puli qo'shildi
  bsb1: number | null;
  bsb2: number | null;
  chsb: number | null;
  daily: DailyGrade[];
};

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");
  const TODAY_DATE = "18.09"; 
  const lessonDates = ["02.09", "04.09", "09.09", "11.09", "16.09", "18.09", "23.09", "25.09", "30.09"];

  const checkIsLastFiveDays = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return currentDay > (lastDayOfMonth - 5);
  };
  const isEndOfMonth = checkIsLastFiveDays();

  const [activeView, setActiveView] = useState<"dashboard" | "journal" | "plan">("dashboard");

  // 1. ISH REJA BAZASI
  const [lessonPlan, setLessonPlan] = useState([
    { id: 1, date: "02.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "Jismlarning zaryadlanishi", homework: "Mavzuni o'rganish", type: "lesson" },
    { id: 2, date: "04.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "Elektr zaryad", homework: "2-mavzuni o'rganish, 1-mashq", type: "lesson" },
    { id: 3, date: "09.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "Zaryadlarning o'zaro ta'siri. Kulon qonuni", homework: "+ Keyingi darsga UV", type: "lesson" },
    { id: 4, date: "11.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "Masalalar yechish", homework: "+ Keyingi darsga UV", type: "lesson" },
    { id: 5, date: "16.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "Elektr maydon", homework: "+ Keyingi darsga UV", type: "lesson" },
    { id: 6, date: "18.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "O'tkazgichlarda elektr zaryadlarining taqsimlanishi", homework: "+ Keyingi darsga UV", type: "lesson" },
    { id: 7, date: "23.09", time: "08:00 - 08:45", className: "10-A", subject: "Fizika", room: "302-xona", topic: "BSB-1: Elektr maydon kuchlanganligi", homework: "Takrorlash", type: "bsb1" },
  ]);

  const todaysSchedule = lessonPlan.filter(s => s.date === TODAY_DATE);
  const [planClassFilter, setPlanClassFilter] = useState("10-A");
  const filteredLessonPlan = lessonPlan.filter(plan => plan.className === planClassFilter);

  // 2. O'QUVCHILAR BAZASI (PP balans bilan)
  const [allStudents, setAllStudents] = useState<Student[]>([
    { id: "S-8392", class: "10-A", name: "Asadova Parizod", balancePP: 12000, daily: [{ id: 1, val: 8, hwVal: 9, attendance: "present", date: "04.09" }], bsb1: 22, bsb2: null, chsb: null },
    { id: "S-8393", class: "10-A", name: "Azimov Kamron", balancePP: 450, daily: [{ id: 3, val: 7, hwVal: null, attendance: "present", date: "04.09" }], bsb1: 18, bsb2: null, chsb: null },
    { id: "S-1001", class: "10-A", name: "Baxtiyorov Sherjahon", balancePP: 5000, daily: [{ id: 4, val: null, hwVal: null, attendance: "absent", date: "04.09" }], bsb1: 15, bsb2: null, chsb: null },
    { id: "S-1002", class: "10-A", name: "Baxshilloyev Akbar", balancePP: 800, daily: [], bsb1: 25, bsb2: null, chsb: null },
    { id: "S-1003", class: "10-A", name: "Botirova Bonu", balancePP: 3000, daily: [{ id: 5, val: null, hwVal: null, attendance: "sick", date: "04.09" }], bsb1: 20, bsb2: null, chsb: null },
  ]);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentLogs, setRecentLogs] = useState([{ id: 1, text: "Tizimga muvaffaqiyatli kirdingiz", time: "Hozirgina", type: "system" }]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | "editGrade" | "retroGrade" | "boostExam" | "bulkPP" | "addPlan" | "assignHW" | null>(null);
  
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Yangi xatolik ko'rsatkich

  const [activeDate, setActiveDate] = useState(TODAY_DATE);
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "absent" | "sick">("present");
  const [lessonGrade, setLessonGrade] = useState("");
  const [homeworkGrade, setHomeworkGrade] = useState("");
  const [gradeCategory, setGradeCategory] = useState<"daily" | "bsb1" | "bsb2" | "chsb">("daily");
  
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [homeworkText, setHomeworkText] = useState("");
  const [newPlan, setNewPlan] = useState({ date: TODAY_DATE, className: "10-A", topic: "", homework: "+ Keyingi darsga UV", type: "lesson" });
  const [selectedGradeObj, setSelectedGradeObj] = useState<DailyGrade | null>(null);
  const [reason, setReason] = useState("");

  const activeClassStudents = allStudents.filter(s => selectedClass ? s.class === selectedClass.className : true);
  const filteredStudents = activeClassStudents.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getDailyAverage = (daily: DailyGrade[]) => {
    const allGrades = daily.flatMap(d => [d.val, d.hwVal].filter(g => g !== null && g !== undefined));
    if (allGrades.length === 0) return 0;
    return allGrades.reduce((a, b) => a + Number(b), 0) / allGrades.length;
  };
  const getTotalQuarterScore = (student: Student) => Math.round(getDailyAverage(student.daily)) + (student.bsb1 || 0) + (student.bsb2 || 0) + (student.chsb || 0);

  // PP QO'SHISH VA TARQATISH
  const handleAddPP = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(`Muvaffaqiyatli amalga oshirildi!`);
      if (actionType === "bulkPP") {
        setAllStudents(prev => prev.map(s => s.class === selectedClass.className ? { ...s, balancePP: s.balancePP + Number(amount) } : s));
        setRecentLogs(prev => [{ id: Date.now(), text: `Sinfga ${amount} PP tarqatildi`, time: "Hozirgina", type: "pp" }, ...prev].slice(0, 10));
      } else if (actionType === "pp" && selectedStudent) {
        setAllStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, balancePP: s.balancePP + Number(amount) } : s));
        setRecentLogs(prev => [{ id: Date.now(), text: `${selectedStudent.name} ga ${amount} PP berildi`, time: "Hozirgina", type: "pp" }, ...prev].slice(0, 10));
      }
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  // NORMAL VA RETRO (PULLIK) BAHOLASH
  const handleSaveGradeAndAttendance = (e: React.FormEvent, isRetro: boolean = false) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    // O'tib ketgan kun uchun pul yetishmasligi tekshiruvi
    const RETRO_COST = 500;
    if (isRetro) {
      if (selectedStudent.balancePP < RETRO_COST) {
        setErrorMessage(`O'quvchi balansida yetarli PP yo'q! (Kerak: ${RETRO_COST} PP, Balans: ${selectedStudent.balancePP} PP)`);
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        
        let newBalance = s.balancePP;
        if (isRetro) newBalance -= RETRO_COST; // Pulni yechib olish
        
        if (gradeCategory !== "daily") {
          return { ...s, [gradeCategory]: Number(lessonGrade), balancePP: newBalance };
        }

        const existingDailyIndex = s.daily.findIndex(d => d.date === activeDate);
        const newDailyEntry: DailyGrade = {
          id: existingDailyIndex >= 0 ? s.daily[existingDailyIndex].id : Date.now(),
          date: activeDate,
          attendance: attendanceStatus,
          val: attendanceStatus === "present" && lessonGrade ? Number(lessonGrade) : null,
          hwVal: attendanceStatus === "present" && homeworkGrade ? Number(homeworkGrade) : null
        };

        let newDailyArray = [...s.daily];
        if (existingDailyIndex >= 0) newDailyArray[existingDailyIndex] = newDailyEntry;
        else newDailyArray.push(newDailyEntry);

        return { ...s, daily: newDailyArray, balancePP: newBalance };
      }));

      const logText = isRetro 
        ? `${selectedStudent.name} dan 500 PP yechilib, o'tib ketgan kunga (${activeDate}) baho saqlandi.` 
        : `${selectedStudent.name} ga baho saqlandi.`;
        
      setRecentLogs(prev => [{ id: Date.now(), text: logText, time: "Hozirgina", type: "grade" }, ...prev].slice(0, 10));
      setSuccessMessage("Muvaffaqiyatli saqlandi!");
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  // IMTIHON NATIJASINI OSHIRISH (BOOST)
  const handleBoostExam = (boostAmount: number, cost: number) => {
    if (!selectedStudent || !gradeCategory) return;
    
    if (selectedStudent.balancePP < cost) {
      setErrorMessage(`Balans yetarli emas! (Narxi: ${cost} PP)`);
      return;
    }

    const currentScore = selectedStudent[gradeCategory as "bsb1" | "bsb2" | "chsb"] || 0;
    const maxAllowed = gradeCategory === "chsb" ? 40 : 25;

    if (currentScore + boostAmount > maxAllowed) {
      setErrorMessage(`Baho maksimal darajadan (${maxAllowed} ball) oshib ketadi!`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        return { 
          ...s, 
          [gradeCategory]: currentScore + boostAmount,
          balancePP: s.balancePP - cost
        };
      }));

      setRecentLogs(prev => [{ id: Date.now(), text: `${selectedStudent.name} ning ${gradeCategory.toUpperCase()} natijasiga +${boostAmount} ball qo'shildi (${cost} PP yechildi).`, time: "Hozirgina", type: "edit" }, ...prev].slice(0, 10));
      setSuccessMessage(`Muvaffaqiyatli +${boostAmount} ball qo'shildi!`);
      setTimeout(() => { closeModal(); }, 1500);
    }, 500);
  };

  // BOShQA FUNKSIYALAR...
  const handleEditGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedGradeObj) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage("Baho o'zgartirildi!");
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        return { ...s, daily: s.daily.map(g => g.id === selectedGradeObj.id ? { ...g, val: Number(lessonGrade) } : g) };
      }));
      setRecentLogs(prev => [{ id: Date.now(), text: `${selectedStudent.name} bahosi o'zgardi. Sabab: ${reason}`, time: "Hozirgina", type: "edit" }, ...prev].slice(0, 10));
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  const handleAssignHomework = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setLessonPlan(prev => prev.map(p => p.id === selectedPlanId ? { ...p, homework: homeworkText } : p));
      setRecentLogs(prev => [{ id: Date.now(), text: `Yangi uy vazifa saqlandi.`, time: "Hozirgina", type: "system" }, ...prev].slice(0, 10));
      setSuccessMessage("Uy vazifasi muvaffaqiyatli yuborildi!");
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  const handleAddNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newLesson = { id: Date.now(), date: newPlan.date, time: "08:00 - 08:45", className: newPlan.className, subject: "Fizika", room: "302-xona", topic: newPlan.topic, homework: newPlan.homework, type: newPlan.type };
      setLessonPlan(prev => [...prev, newLesson].sort((a, b) => a.date.localeCompare(b.date)));
      setPlanClassFilter(newPlan.className);
      setRecentLogs(prev => [{ id: Date.now(), text: `Yangi ish reja qo'shildi: ${newPlan.topic}`, time: "Hozirgina", type: "system" }, ...prev].slice(0, 10));
      setSuccessMessage("Ish reja muvaffaqiyatli saqlandi!");
      setTimeout(() => { closeModal(); }, 1000);
    }, 600);
  };

  const openGradeModal = (student: Student, date: string) => {
    setSelectedStudent(student);
    setActiveDate(date);
    setErrorMessage("");
    
    // Qaysi kunligini tekshirish (Bugun, O'tgan kun, Kelajak)
    const todayIdx = lessonDates.indexOf(TODAY_DATE);
    const dateIdx = lessonDates.indexOf(date);

    if (dateIdx > todayIdx) return; // Kelajak kun bo'lsa hech narsa qilmaydi

    setGradeCategory("daily");
    const existingEntry = student.daily.find(d => d.date === date);
    
    if (existingEntry) {
      setAttendanceStatus(existingEntry.attendance as any);
      setLessonGrade(existingEntry.val ? existingEntry.val.toString() : "");
      setHomeworkGrade(existingEntry.hwVal ? existingEntry.hwVal.toString() : "");
    } else {
      setAttendanceStatus("present");
      setLessonGrade("");
      setHomeworkGrade("");
    }
    
    // Agar o'tgan kun bo'lsa va hali baho/davomat qo'yilmagan bo'lsa -> Retro oynasi ochiladi
    if (dateIdx < todayIdx && !existingEntry) {
      setActionType("retroGrade");
    } else {
      setActionType("grade");
    }
  };

  const openBoostModal = (student: Student, examType: "bsb1" | "bsb2" | "chsb") => {
    setSelectedStudent(student);
    setGradeCategory(examType);
    setErrorMessage("");
    setActionType("boostExam");
  };

  const openHomeworkModal = (planId: number, currentHw: string) => {
    setSelectedPlanId(planId);
    setHomeworkText(currentHw.includes('+') ? "" : currentHw);
    setActionType("assignHW");
  };

  const closeModal = () => { 
    setSelectedStudent(null); setActionType(null); setAmount(""); setLessonGrade(""); setHomeworkGrade(""); setAttendanceStatus("present"); setSuccessMessage(""); setErrorMessage("");
    setNewPlan({ date: TODAY_DATE, className: "10-A", topic: "", homework: "+ Keyingi darsga UV", type: "lesson" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* TEPADAGI PROFIL */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end">
          <div>
            <p className="text-indigo-300 text-sm mb-1 uppercase tracking-wider font-medium">O'qituvchi Paneli</p>
            <h1 className="text-3xl font-bold mb-2">Ustoz {currentTeacher?.name}</h1>
            <p className="text-indigo-200 text-sm flex items-center"><Calendar className="w-4 h-4 mr-2" /> Bugungi sana: {TODAY_DATE}.2025</p>
          </div>
        </div>
      </div>

      {/* ASOSIY EKRAN */}
      {activeView === "dashboard" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center"><Clock className="w-6 h-6 mr-2 text-indigo-500" /> Bugungi Darslar</h2>
              <button onClick={() => setActiveView("plan")} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-sm flex items-center shadow-sm">
                <FileText className="w-4 h-4 mr-1" /> Ish Rejani ko'rish
              </button>
            </div>
            {todaysSchedule.map((cls) => (
              <div key={cls.id} onClick={() => { setSelectedClass(cls); setActiveView("journal"); }} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`font-bold p-3 rounded-xl text-center w-20 border ${cls.type === 'bsb1' || cls.type === 'chsb' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    <div className="text-sm">{cls.time.split(' - ')[0]}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      {cls.className} {cls.type === 'bsb1' || cls.type === 'chsb' ? <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-md">Imtihon kungi</span> : null}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600 mt-1 flex items-center"><FileText className="w-4 h-4 mr-1" /> {cls.topic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 h-fit">
            <h3 className="font-bold text-lg flex items-center mb-6 dark:text-white"><History className="w-5 h-5 mr-2 text-orange-500" /> Baza Tarixi</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {recentLogs.map((log) => (
                <div key={log.id} className="border-b border-gray-50 pb-3 last:border-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{log.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ISH REJA EKRANI */}
      {activeView === "plan" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-8">
           {/* Reja menyusi va filtrlari avvalgidek */}
           <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveView("dashboard")} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                <div>
                  <h2 className="text-xl font-black text-blue-600 flex items-center">Ish Reja va Mavzular</h2>
                  <p className="text-xs text-gray-500 mt-1">2025/2026 o'quv yili • {currentTeacher?.name}</p>
                </div>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                {["10-A", "10-B", "11-A"].map(cls => (
                  <button key={cls} onClick={() => setPlanClassFilter(cls)} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${planClassFilter === cls ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 border-2 border-blue-400 text-blue-600 rounded-lg text-sm font-bold bg-blue-50">1 chorak</button>
                <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">2</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActionType("addPlan")} className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg text-sm font-bold shadow-sm flex items-center">
                  <Plus className="w-4 h-4 mr-2"/> Yangi mavzu
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm flex items-center hidden md:flex"><Download className="w-4 h-4 mr-2"/> TMR</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200 w-12">№</th>
                    <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200 w-24">Sana</th>
                    <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200">Mavzu dars ({planClassFilter})</th>
                    <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200 w-1/3">Keyingi darsga uy vazifa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessonPlan.map((plan, i) => (
                    <tr key={plan.id} className="hover:bg-blue-50/10 transition-colors">
                      <td className="p-3 text-center text-gray-400 text-sm border border-gray-200">{i + 1}</td>
                      <td className={`p-3 text-center text-sm border border-gray-200 ${plan.date === TODAY_DATE ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-blue-500'}`}>
                        {plan.date}.2025
                        {plan.date === TODAY_DATE && <div className="text-[10px] text-blue-400 mt-1">bugun</div>}
                      </td>
                      <td className="p-3 text-sm text-gray-700 border border-gray-200">
                        <span className={plan.type !== 'lesson' ? 'text-red-600 font-bold' : ''}>{plan.topic}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600 border border-gray-200 align-top">
                        <div className="flex justify-between items-start mb-2">
                          <span className={!plan.homework.includes('+') ? 'text-gray-700 font-medium' : 'text-blue-500 cursor-pointer hover:underline'} onClick={() => { if(plan.homework.includes('+')) openHomeworkModal(plan.id, plan.homework) }}>{plan.homework}</span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button onClick={() => openHomeworkModal(plan.id, plan.homework)} className="px-3 py-1.5 border border-blue-400 text-blue-500 rounded-md text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm bg-white">
                            {plan.homework.includes('+') ? 'Onlayn berish' : 'Tahrirlash'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      )}

      {/* JURNAL EKRANI */}
      {activeView === "journal" && selectedClass && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-right-8 duration-300">
          
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveView("dashboard")} className="p-2 border border-gray-300 rounded-xl hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div>
                <h2 className="text-xl font-black text-blue-600 flex items-center">{selectedClass.className} <ChevronRight className="w-4 h-4 mx-1 text-blue-300"/> Fizika</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">2025/2026 o'quv yili • {currentTeacher?.name}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
               {isEndOfMonth ? (
                 <button onClick={() => setActionType("bulkPP")} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-sm flex items-center hover:bg-blue-600">
                   <Award className="w-4 h-4 mr-2"/> Sinfga PP tarqatish
                 </button>
               ) : (
                 <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold flex items-center cursor-not-allowed border border-gray-200" title="Oy yakuniga hali vaqt bor">
                   <Lock className="w-4 h-4 mr-2"/> Sinfga PP (Oy yakunida)
                 </button>
               )}
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-slate-50">
                  <th colSpan={2} className="p-3 text-center text-sm text-blue-600 font-bold border border-gray-200 w-64">To'liq Ism</th>
                  
                  {lessonDates.map(date => (
                    <th key={date} className={`p-2 text-center border border-gray-200 w-14 align-bottom ${date === TODAY_DATE ? 'border-x-2 border-x-blue-400 bg-blue-50/50' : ''}`}>
                      <div className={`text-xs ${date === TODAY_DATE ? 'text-blue-600 font-bold' : 'text-blue-500'}`}>{date}</div>
                    </th>
                  ))}
                  
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12 bg-gray-50">O'rt</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">BSB</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">CHSB</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12 bg-green-50">Chorak</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">Puli (PP)</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredStudents.map((student, index) => {
                  const dailyAvg = getDailyAverage(student.daily);
                  const totalQuarter = getTotalQuarterScore(student);
                  
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-2 text-center text-gray-500 text-sm border border-gray-200 w-8">{index + 1}</td>
                      <td className="p-2 font-medium text-xs md:text-sm text-gray-700 border border-gray-200">{student.name}</td>

                      {/* KATAKCHALAR: BUGUN, KELAJAK VA O'TGAN KUNLAR MANTIG'I */}
                      {lessonDates.map(date => {
                        const todayIdx = lessonDates.indexOf(TODAY_DATE);
                        const dateIdx = lessonDates.indexOf(date);
                        const g = student.daily.find((d:any) => d.date === date);
                        
                        // Kelajakdagi kun
                        if (dateIdx > todayIdx) {
                           return (
                             <td key={date} className="p-1 border border-gray-200 text-center h-12 align-middle bg-gray-50/50">
                               <div className="w-full h-full flex items-center justify-center cursor-not-allowed opacity-30 text-gray-400">-</div>
                             </td>
                           )
                        }

                        // Bugun yoki O'tgan kun
                        return (
                          <td key={date} className={`p-1 border border-gray-200 text-center h-12 align-middle ${date === TODAY_DATE ? 'border-x-2 border-x-blue-400 bg-blue-50/10' : ''}`}>
                            <div 
                              className="w-full h-full cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center group relative min-h-[36px]" 
                              onClick={() => {
                                if (g) {
                                  setSelectedStudent(student); setSelectedGradeObj(g); setLessonGrade(g.val?.toString() || ""); setActionType("editGrade");
                                } else {
                                  openGradeModal(student, date);
                                }
                              }}
                            >
                              {g ? (
                                g.attendance === "absent" ? <span className="text-red-500 font-black text-sm">MQ</span> : 
                                g.attendance === "sick" ? <span className="text-orange-500 font-black text-sm">S</span> : (
                                  <div className="flex flex-col items-center justify-center w-full leading-none space-y-0.5">
                                    {g.val && <span className={`font-bold text-[13px] ${g.val >= 8 ? 'text-green-600' : g.val >= 6 ? 'text-orange-500' : 'text-red-600'}`}>{g.val}</span>}
                                    {g.hwVal && <span className={`font-bold text-[10px] bg-blue-50 text-blue-600 px-1 rounded-sm`}>{g.hwVal}</span>}
                                  </div>
                                )
                              ) : (
                                // Agar o'tgan kun bo'lsa (Pullik indikator), Bugun bo'lsa (+)
                                dateIdx < todayIdx 
                                  ? <span className="opacity-0 group-hover:opacity-100 text-orange-400 text-xs font-bold absolute">500<br/>PP</span>
                                  : <span className="opacity-0 group-hover:opacity-100 text-blue-400 text-lg absolute">+</span>
                              )}
                            </div>
                          </td>
                        )
                      })}

                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-gray-600 bg-gray-50">{dailyAvg > 0 ? dailyAvg.toFixed(1) : ""}</td>
                      
                      {/* IMTIHON BAHOLARINI OSHIRISH (BOOST) */}
                      <td onClick={() => { if(student.bsb1) openBoostModal(student, "bsb1"); }} className={`p-2 text-center border border-gray-200 font-bold text-sm text-blue-600 bg-blue-50/30 ${student.bsb1 ? 'cursor-pointer hover:bg-blue-100' : ''}`} title={student.bsb1 ? "Imtihon natijasini oshirish (PP)" : ""}>
                        {student.bsb1 || ""}
                      </td>
                      <td onClick={() => { if(student.bsb2) openBoostModal(student, "bsb2"); }} className={`p-2 text-center border border-gray-200 font-bold text-sm text-blue-600 bg-blue-50/30 ${student.bsb2 ? 'cursor-pointer hover:bg-blue-100' : ''}`} title={student.bsb2 ? "Imtihon natijasini oshirish (PP)" : ""}>
                        {student.bsb2 || ""}
                      </td>
                      <td onClick={() => { if(student.chsb) openBoostModal(student, "chsb"); }} className={`p-2 text-center border border-gray-200 font-bold text-sm text-purple-600 bg-purple-50/30 ${student.chsb ? 'cursor-pointer hover:bg-purple-100' : ''}`} title={student.chsb ? "Imtihon natijasini oshirish (PP)" : ""}>
                        {student.chsb || ""}
                      </td>
                      
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-green-600 bg-green-50/50">{totalQuarter > 0 ? totalQuarter : ""}</td>
                      
                      <td className="p-1 border border-gray-200 text-center">
                        <div className="font-bold text-orange-500 text-xs">{student.balancePP}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALLAR */}

      {/* 1. RETRO BAHO QO'YISH MODALI (O'tib ketgan kun uchun pul yechish) */}
      {selectedStudent && actionType === "retroGrade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-200 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1 flex items-center text-orange-600"><History className="w-6 h-6 mr-2" /> O'tgan kunga baho kiritish</h2>
              <p className="text-sm text-gray-500 mb-4">O'quvchi: <strong className="text-gray-900">{selectedStudent.name}</strong> • Sana: {activeDate}</p>
              
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm mb-4 border border-orange-200 flex items-start">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> 
                <div>
                  <p className="font-bold mb-1">Diqqat! Pullik xizmat.</p>
                  <p>Bu kun o'tib ketgan. Baho yoki davomat kiritish uchun o'quvchining balansidan <strong>500 PP</strong> yechib olinadi.</p>
                  <p className="mt-2 font-black text-orange-600">O'quvchi balansi: {selectedStudent.balancePP} PP</p>
                </div>
              </div>

              {errorMessage && <div className="text-red-500 font-bold text-sm text-center mb-4">{errorMessage}</div>}
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4">
                  {/* Davomat va Baho tanlash xuddi normaldek */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Davomatni belgilang</label>
                    <div className="flex gap-2">
                      <button onClick={() => setAttendanceStatus("present")} className={`flex-1 py-3 rounded-xl font-bold text-sm ${attendanceStatus === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Keldi</button>
                      <button onClick={() => setAttendanceStatus("absent")} className={`flex-1 py-3 rounded-xl font-bold text-sm ${attendanceStatus === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>MQ</button>
                      <button onClick={() => setAttendanceStatus("sick")} className={`flex-1 py-3 rounded-xl font-bold text-sm ${attendanceStatus === 'sick' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Kasal</button>
                    </div>
                  </div>

                  {attendanceStatus === "present" && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-500 mb-2">Dars bahosi (Majburiy emas)</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1,2,3,4,5,6,7,8,9,10].map(g => (
                          <button key={g} onClick={() => setLessonGrade(lessonGrade === String(g) ? "" : String(g))} className={`py-2 rounded-lg font-black text-base border ${lessonGrade === String(g) ? "bg-green-500 text-white" : "bg-white text-gray-600"}`}>{g}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={(e) => handleSaveGradeAndAttendance(e, true)} disabled={isProcessing} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-colors">
                    {isProcessing ? "Saqlanmoqda..." : "500 PP yechish va Saqlash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. IMTIHON NATIJASINI OSHIRISH MODALI (BOOST) */}
      {selectedStudent && actionType === "boostExam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-200 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold mb-1 text-gray-900">Imtihon Natijasini Oshirish</h2>
              <p className="text-sm text-gray-500 mb-4">O'quvchi o'z PP balansi hisobidan bahosini ko'tarishi mumkin.</p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">{gradeCategory} joriy natijasi:</p>
                <div className="text-4xl font-black text-blue-600">{selectedStudent[gradeCategory as "bsb1" | "bsb2" | "chsb"]} <span className="text-lg text-gray-400">/ {gradeCategory === 'chsb' ? '40' : '25'}</span></div>
                <p className="text-sm mt-2 font-bold text-orange-500">Balans: {selectedStudent.balancePP} PP</p>
              </div>

              {errorMessage && <div className="text-red-500 font-bold text-sm text-center mb-4">{errorMessage}</div>}
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => handleBoostExam(1, 1000)} disabled={isProcessing} className="w-full py-4 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-xl font-black transition-colors flex justify-between px-6 items-center">
                    <span>+1 Ball qo'shish</span> <span className="bg-white px-3 py-1 rounded-lg text-sm text-orange-500 border border-blue-100">1000 PP</span>
                  </button>
                  <button onClick={() => handleBoostExam(2, 2000)} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-colors shadow-md shadow-blue-500/30 flex justify-between px-6 items-center">
                    <span>+2 Ball qo'shish</span> <span className="bg-blue-800 px-3 py-1 rounded-lg text-sm text-orange-300">2000 PP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NORMAL BAHO MODALI (Faqat bugun uchun) */}
      {selectedStudent && actionType === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-blue-600" /> Baholash va Davomat</h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong className="text-gray-900">{selectedStudent.name}</strong> • Sana: {activeDate}</p>
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Davomatni belgilang</label>
                    <div className="flex gap-2">
                      <button onClick={() => setAttendanceStatus("present")} className={`flex-1 py-3 rounded-xl font-bold text-sm ${attendanceStatus === 'present' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>Keldi</button>
                      <button onClick={() => setAttendanceStatus("absent")} className={`flex-1 py-3 rounded-xl font-bold text-sm ${attendanceStatus === 'absent' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>MQ</button>
                      <button onClick={() => setAttendanceStatus("sick")} className={`flex-1 py-3 rounded-xl font-bold text-sm ${attendanceStatus === 'sick' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>Kasal</button>
                    </div>
                  </div>

                  {attendanceStatus === "present" && (
                    <div className="space-y-4">
                      {gradeCategory === "daily" ? (
                        <>
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 mb-3">Dars ishtiroki bahosi</label>
                            <div className="grid grid-cols-5 gap-2">
                              {[1,2,3,4,5,6,7,8,9,10].map(g => (
                                <button key={g} onClick={() => setLessonGrade(lessonGrade === String(g) ? "" : String(g))} className={`py-2 rounded-lg font-black text-base border ${lessonGrade === String(g) ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-600 border-gray-200"}`}>{g}</button>
                              ))}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <label className="block text-xs font-bold text-blue-600 mb-3">Uy vazifasi bahosi</label>
                            <div className="grid grid-cols-5 gap-2">
                              {[1,2,3,4,5,6,7,8,9,10].map(g => (
                                <button key={g} onClick={() => setHomeworkGrade(homeworkGrade === String(g) ? "" : String(g))} className={`py-2 rounded-lg font-black text-base border ${homeworkGrade === String(g) ? "bg-blue-500 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200"}`}>{g}</button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                         <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <label className="block text-xs font-bold text-orange-600 mb-3">Imtihon bahosi ({gradeCategory.toUpperCase()})</label>
                            <input type="number" value={lessonGrade} onChange={(e) => setLessonGrade(e.target.value)} className="w-full p-4 rounded-xl border border-orange-200 bg-white font-black text-xl outline-none" />
                         </div>
                      )}
                    </div>
                  )}

                  <button onClick={(e) => handleSaveGradeAndAttendance(e, false)} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                    {isProcessing ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QOLGAN MODALLAR (Tahrirlash, Reja qo'shish va h.k avvalgidek qoldi, faqat pastda saqlab qo'yildi...) */}
      
      {/* TAHRIRLASH MODALI */}
      {selectedStudent && actionType === "editGrade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1"><Edit3 className="w-6 h-6 mr-2 text-orange-500 inline" /> Bahoni tahrirlash</h2>
              <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm mb-4 flex border border-orange-200 mt-2">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> Bahoni o'zgartirish tarixda saqlanadi va sabab ko'rsatilishi shart.
              </div>
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Yangi baho (1-10)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(g => (
                        <button key={g} onClick={() => setLessonGrade(g.toString())} className={`py-2 rounded-lg font-black text-lg border ${lessonGrade === g.toString() ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200"}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sabab</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: Uy vazifasi xatosini to'g'riladi..." className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none h-24" />
                  </div>
                  <button onClick={handleEditGrade} disabled={!lessonGrade || !reason || isProcessing} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                    {isProcessing ? "Saqlanmoqda..." : "O'zgarishni tasdiqlash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJA QO'SHISH MODALI */}
      {actionType === "addPlan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center"><FileText className="w-6 h-6 mr-2 text-blue-500" /> Yangi Mavzu Qo'shish</h2>
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <form onSubmit={handleAddNewPlan} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Sana</label>
                      <input type="text" required placeholder="Masalan: 20.09" value={newPlan.date} onChange={e => setNewPlan({...newPlan, date: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Sinf</label>
                      <select value={newPlan.className} onChange={e => setNewPlan({...newPlan, className: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm font-medium">
                        <option value="10-A">10-A</option>
                        <option value="10-B">10-B</option>
                        <option value="11-A">11-A</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dars turi</label>
                    <select value={newPlan.type} onChange={e => setNewPlan({...newPlan, type: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm font-medium">
                      <option value="lesson">Oddiy Dars (Mavzu)</option>
                      <option value="bsb1">BSB (Birlik sinov bahosi)</option>
                      <option value="chsb">CHSB (Chorak sinov bahosi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mavzu nomi</label>
                    <input type="text" required placeholder="Masalan: Logarifmlar..." value={newPlan.topic} onChange={e => setNewPlan({...newPlan, topic: e.target.value})} className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm" />
                  </div>

                  <button type="submit" disabled={isProcessing} className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                    {isProcessing ? "Saqlanmoqda..." : "Rejani saqlash"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

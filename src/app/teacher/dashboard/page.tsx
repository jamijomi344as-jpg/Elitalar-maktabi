"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, X, Calendar, Clock, MapPin, History, Check, UserMinus, Stethoscope, ArrowLeft, BookOpen, Edit3, AlertCircle, FileText, Download, UploadCloud, Eye, Paperclip, ChevronRight, Lock } from "lucide-react";

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");
  const TODAY_DATE = "18.09"; 
  const lessonDates = ["02.09", "04.09", "09.09", "11.09", "16.09", "18.09", "23.09", "25.09", "30.09"];

  // ==========================================
  // OY YAKUNINI TEKSHIRISH
  // ==========================================
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

  // 2. O'QUVCHILAR BAZASI (Davomat endi daily ichida saqlanadi)
  const [allStudents, setAllStudents] = useState([
    { id: "S-8392", class: "10-A", name: "Asadova Parizod", daily: [{ id: 1, val: 8, hwVal: 9, attendance: "present", date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-8393", class: "10-A", name: "Azimov Kamron", daily: [{ id: 3, val: 7, hwVal: null, attendance: "present", date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1001", class: "10-A", name: "Baxtiyorov Sherjahon", daily: [{ id: 4, val: null, hwVal: null, attendance: "absent", date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1002", class: "10-A", name: "Baxshilloyev Akbar", daily: [], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1003", class: "10-A", name: "Botirova Bonu", daily: [{ id: 5, val: null, hwVal: null, attendance: "sick", date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1004", class: "10-A", name: "Dilmurodov Javohir", daily: [{ id: 6, val: 7, hwVal: 8, attendance: "present", date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1007", class: "10-A", name: "Farhodov Firdavs", daily: [{ id: 7, val: 6, hwVal: null, attendance: "present", date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
  ]);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentLogs, setRecentLogs] = useState([{ id: 1, text: "Tizimga muvaffaqiyatli kirdingiz", time: "Hozirgina", type: "system" }]);

  // Modallar holati
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | "bulkPP" | "addPlan" | "assignHW" | null>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Baho qo'yish oynasi uchun statelar
  const [activeDate, setActiveDate] = useState(TODAY_DATE);
  const [attendanceStatus, setAttendanceStatus] = useState<"present" | "absent" | "sick">("present");
  const [lessonGrade, setLessonGrade] = useState("");
  const [homeworkGrade, setHomeworkGrade] = useState("");
  const [gradeCategory, setGradeCategory] = useState<"daily" | "bsb1" | "bsb2" | "chsb">("daily");
  
  // Uy vazifa berish uchun
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [homeworkText, setHomeworkText] = useState("");

  // Qidiruv va hisoblash
  const activeClassStudents = allStudents.filter(s => selectedClass ? s.class === selectedClass.className : true);
  const filteredStudents = activeClassStudents.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getDailyAverage = (daily: any[]) => {
    const allGrades = daily.flatMap(d => [d.val, d.hwVal].filter(g => g !== null && g !== undefined));
    if (allGrades.length === 0) return 0;
    const sum = allGrades.reduce((a, b) => a + Number(b), 0);
    return sum / allGrades.length;
  };
  const getTotalQuarterScore = (student: any) => Math.round(getDailyAverage(student.daily)) + (student.bsb1 || 0) + (student.bsb2 || 0) + (student.chsb || 0);

  // BAHOLASH VA DAVOMATNI SAQLASH
  const handleSaveGradeAndAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        
        // Agar BSB yoki CHSB bo'lsa
        if (gradeCategory !== "daily") {
          return { ...s, [gradeCategory]: Number(lessonGrade) };
        }

        // Agar kunlik dars bo'lsa
        const existingDailyIndex = s.daily.findIndex((d: any) => d.date === activeDate);
        const newDailyEntry = {
          id: existingDailyIndex >= 0 ? s.daily[existingDailyIndex].id : Date.now(),
          date: activeDate,
          attendance: attendanceStatus,
          val: attendanceStatus === "present" && lessonGrade ? Number(lessonGrade) : null,
          hwVal: attendanceStatus === "present" && homeworkGrade ? Number(homeworkGrade) : null
        };

        let newDailyArray = [...s.daily];
        if (existingDailyIndex >= 0) {
          newDailyArray[existingDailyIndex] = newDailyEntry;
        } else {
          newDailyArray.push(newDailyEntry);
        }

        return { ...s, daily: newDailyArray };
      }));

      const logText = attendanceStatus !== "present" 
        ? `${selectedStudent.name} ${activeDate} kuni ${attendanceStatus === 'absent' ? 'kelmadi (MQ)' : 'kasal (S)'} belgilandi.` 
        : `${selectedStudent.name} ga baho saqlandi.`;
        
      setRecentLogs(prev => [{ id: Date.now(), text: logText, time: "Hozirgina", type: "grade" }, ...prev].slice(0, 10));
      setSuccessMessage("Muvaffaqiyatli saqlandi!");
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  // UY VAZIFASINI SAQLASH
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

  // MODALLARNI OCHISH MANTIG'I
  const openGradeModal = (student: any, date: string) => {
    setSelectedStudent(student);
    setActiveDate(date);
    
    const todayLesson = lessonPlan.find(s => s.className === student.class && s.date === date);
    if (todayLesson?.type === "bsb1") setGradeCategory("bsb1");
    else if (todayLesson?.type === "chsb") setGradeCategory("chsb");
    else setGradeCategory("daily");

    // Eski ma'lumotlarni yuklash (agar bor bo'lsa)
    const existingEntry = student.daily.find((d: any) => d.date === date);
    if (existingEntry) {
      setAttendanceStatus(existingEntry.attendance);
      setLessonGrade(existingEntry.val ? existingEntry.val.toString() : "");
      setHomeworkGrade(existingEntry.hwVal ? existingEntry.hwVal.toString() : "");
    } else {
      setAttendanceStatus("present");
      setLessonGrade("");
      setHomeworkGrade("");
    }
    
    setActionType("grade");
  };

  const openHomeworkModal = (planId: number, currentHw: string) => {
    setSelectedPlanId(planId);
    setHomeworkText(currentHw.includes('+') ? "" : currentHw);
    setActionType("assignHW");
  };

  const closeModal = () => { setSelectedStudent(null); setActionType(null); setAmount(""); setLessonGrade(""); setHomeworkGrade(""); setAttendanceStatus("present"); setSuccessMessage(""); };

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
           <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-slate-50">
              <button onClick={() => setActiveView("dashboard")} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div>
                <h2 className="text-xl font-black text-blue-600 flex items-center">Ish Reja va Mavzular <span className="text-gray-400 mx-2">|</span> Fizika</h2>
                <p className="text-xs text-gray-500 mt-1">2025/2026 o'quv yili • {currentTeacher?.name}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-gray-200 mt-2">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200 w-12">№</th>
                  <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200 w-24">Sana</th>
                  <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200">Mavzu dars</th>
                  <th className="p-3 text-center text-xs text-gray-500 font-bold border border-gray-200 w-1/3">Keyingi darsga uy vazifa</th>
                </tr>
              </thead>
              <tbody>
                {lessonPlan.map((plan, i) => (
                  <tr key={plan.id} className="hover:bg-blue-50/10">
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
                        <span className={!plan.homework.includes('+') ? 'text-gray-700' : 'text-blue-500 font-medium'}>{plan.homework}</span>
                      </div>
                      <div className="flex justify-end mt-2">
                        {/* ONLAYN BERISH TUGMASI ISHLATILDI */}
                        <button onClick={() => openHomeworkModal(plan.id, plan.homework)} className="px-3 py-1.5 border border-blue-400 text-blue-500 rounded-md text-xs font-medium hover:bg-blue-50 transition-colors">
                          Onlayn berish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* JURNAL EKRANI (DAVOMAT JADVALDAN OLIB TASHLANDI) */}
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
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">Shaxsiy PP</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredStudents.map((student, index) => {
                  const dailyAvg = getDailyAverage(student.daily);
                  const totalQuarter = getTotalQuarterScore(student);
                  
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-2 text-center text-gray-500 text-sm border border-gray-200 w-8">{index + 1}</td>
                      <td className="p-2 font-medium text-xs md:text-sm text-gray-700 border border-gray-200 cursor-pointer hover:text-blue-600">{student.name}</td>
                      
                      {/* KATAKCHALAR (SANALAR VA BAHOLAR / DAVOMAT) */}
                      {lessonDates.map(date => {
                        const g = student.daily.find((d:any) => d.date === date);
                        return (
                          <td key={date} className={`p-1 border border-gray-200 text-center h-12 align-middle ${date === TODAY_DATE ? 'border-x-2 border-x-blue-400 bg-blue-50/10' : ''}`}>
                            <div 
                              className="w-full h-full cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center group relative min-h-[36px]" 
                              onClick={() => openGradeModal(student, date)}
                            >
                              {g ? (
                                g.attendance === "absent" ? (
                                  <span className="text-red-500 font-black text-sm">MQ</span>
                                ) : g.attendance === "sick" ? (
                                  <span className="text-orange-500 font-black text-sm">S</span>
                                ) : (
                                  <div className="flex flex-col items-center justify-center w-full leading-none space-y-0.5">
                                    {/* Dars ishtiroki bahosi (Tepada yashilroq) */}
                                    {g.val && <span className={`font-bold text-[13px] ${g.val >= 8 ? 'text-green-600' : g.val >= 6 ? 'text-orange-500' : 'text-red-600'}`}>{g.val}</span>}
                                    {/* Uy vazifasi bahosi (Pastda ko'kroq kichkina) */}
                                    {g.hwVal && <span className={`font-bold text-[10px] bg-blue-50 text-blue-600 px-1 rounded-sm`}>{g.hwVal}</span>}
                                  </div>
                                )
                              ) : (
                                <span className="opacity-0 group-hover:opacity-100 text-blue-400 text-lg absolute">+</span>
                              )}
                            </div>
                          </td>
                        )
                      })}

                      {/* O'RTACHA VA CHORAK */}
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-gray-600 bg-gray-50">{dailyAvg > 0 ? dailyAvg.toFixed(1) : ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-blue-600 bg-blue-50/30">{student.bsb1 || ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-purple-600 bg-purple-50/30">{student.chsb || ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-green-600 bg-green-50/50">{totalQuarter > 0 ? totalQuarter : ""}</td>
                      
                      {/* SHAXSIY PP */}
                      <td className="p-1 border border-gray-200 text-center">
                        <button onClick={() => { setSelectedStudent(student); setActionType("pp"); }} className="p-1.5 bg-orange-50 text-orange-500 rounded hover:bg-orange-100 mx-auto block" title="PP (Ball) kiritish">
                          <Award className="w-4 h-4" />
                        </button>
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
      
      {/* 1. BAHO VA DAVOMAT MODALI (YANGILANDI!) */}
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
                  
                  {/* DAVOMAT QISMI */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Davomatni belgilang</label>
                    <div className="flex gap-2">
                      <button onClick={() => setAttendanceStatus("present")} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${attendanceStatus === 'present' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <Check className="w-4 h-4 mr-2"/> Keldi
                      </button>
                      <button onClick={() => setAttendanceStatus("absent")} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${attendanceStatus === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <UserMinus className="w-4 h-4 mr-2"/> MQ
                      </button>
                      <button onClick={() => setAttendanceStatus("sick")} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${attendanceStatus === 'sick' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <Stethoscope className="w-4 h-4 mr-2"/> Kasal
                      </button>
                    </div>
                  </div>

                  {/* BAHOLASH QISMI (Faqat 'Keldi' bo'lsa chiqadi) */}
                  {attendanceStatus === "present" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      {gradeCategory === "daily" ? (
                        <>
                          {/* DARSDAGI FAOLLIK UCHUN BAHO */}
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dars ishtiroki bahosi</label>
                            <div className="grid grid-cols-5 gap-2">
                              {[...Array(10)].map((_, i) => (
                                <button key={i+1} onClick={() => setLessonGrade(lessonGrade === String(i+1) ? "" : String(i+1))} className={`py-2 rounded-lg font-black text-base border transition-all ${lessonGrade === String(i+1) ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}>
                                  {i+1}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* UY VAZIFASI UCHUN BAHO */}
                          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                            <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Uy vazifasi bahosi</label>
                            <div className="grid grid-cols-5 gap-2">
                              {[...Array(10)].map((_, i) => (
                                <button key={i+1} onClick={() => setHomeworkGrade(homeworkGrade === String(i+1) ? "" : String(i+1))} className={`py-2 rounded-lg font-black text-base border transition-all ${homeworkGrade === String(i+1) ? "bg-blue-500 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200 hover:border-blue-400"}`}>
                                  {i+1}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                         <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <label className="block text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Imtihon bahosi ({gradeCategory.toUpperCase()})</label>
                            <input type="number" value={lessonGrade} onChange={(e) => setLessonGrade(e.target.value)} placeholder="Baho miqdori..." className="w-full p-4 rounded-xl border border-orange-200 bg-white font-black text-xl outline-none focus:border-orange-500" />
                         </div>
                      )}
                    </div>
                  )}

                  <button onClick={handleSaveGradeAndAttendance} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-blue-500/20">
                    {isProcessing ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. UY VAZIFASI BERISH MODALI (YANGI!) */}
      {actionType === "assignHW" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center"><BookOpen className="w-6 h-6 mr-2 text-blue-500" /> Uy vazifasini kiritish</h2>
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4 mt-4">
                  <textarea 
                    value={homeworkText} 
                    onChange={(e) => setHomeworkText(e.target.value)} 
                    placeholder="Uy vazifasi matnini kiriting (Masalan: 3-mavzu oxiridagi 5-10 masalalarni yechish...)" 
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none h-32 focus:border-blue-500 transition-colors text-sm" 
                  />
                  <button onClick={handleAssignHomework} disabled={!homeworkText || isProcessing} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                    {isProcessing ? "Yuborilmoqda..." : "Uy vazifasini saqlash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. BULK PP VA SHAXSIY PP MODALLAR (O'zgarishsiz qoldirildi, ular pastda yopilgan) */}
    </div>
  );
}

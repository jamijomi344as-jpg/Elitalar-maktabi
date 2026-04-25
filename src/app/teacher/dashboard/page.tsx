"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, X, Calendar, Clock, MapPin, History, Check, UserMinus, Stethoscope, ArrowLeft, BookOpen, Edit3, AlertCircle, FileText, Download, UploadCloud, Eye, Paperclip, ChevronRight, Lock } from "lucide-react";

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");
  const TODAY_DATE = "18.09"; // Jurnal jadvali uchun sanani ko'rsatuvchi marker
  const lessonDates = ["02.09", "04.09", "09.09", "11.09", "16.09", "18.09", "23.09", "25.09", "30.09"];

  // ==========================================
  // OY YAKUNINI TEKSHIRISH MANTIG'I (YANGI)
  // ==========================================
  const checkIsLastFiveDays = () => {
    const today = new Date();
    const currentDay = today.getDate();
    // Shu oyning oxirgi kunini aniqlash (Masalan: Aprel uchun 30, May uchun 31)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    // Agar bugun oyning oxirgi 5 kuniga kirsa true qaytaradi
    return currentDay > (lastDayOfMonth - 5);
  };
  const isEndOfMonth = checkIsLastFiveDays();

  // EKRANLAR HOLATI: 'dashboard' | 'journal' | 'plan'
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

  // 2. O'QUVCHILAR BAZASI
  const [allStudents, setAllStudents] = useState([
    { id: "S-8392", class: "10-A", name: "Asadova Parizod", attendance: "present", daily: [{ id: 1, val: 8, date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-8393", class: "10-A", name: "Azimov Kamron", attendance: "present", daily: [{ id: 3, val: 7, date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1001", class: "10-A", name: "Baxtiyorov Sherjahon", attendance: "present", daily: [], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1002", class: "10-A", name: "Baxshilloyev Akbar", attendance: "absent", daily: [], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1003", class: "10-A", name: "Botirova Bonu", attendance: "present", daily: [{ id: 5, val: 8, date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1004", class: "10-A", name: "Dilmurodov Javohir", attendance: "present", daily: [{ id: 6, val: 7, date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
    { id: "S-1007", class: "10-A", name: "Farhodov Firdavs", attendance: "present", daily: [{ id: 7, val: 6, date: "04.09" }], bsb1: null, bsb2: null, chsb: null },
  ]);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentLogs, setRecentLogs] = useState([{ id: 1, text: "Tizimga muvaffaqiyatli kirdingiz", time: "Hozirgina", type: "system" }]);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | "editGrade" | "bulkPP" | null>(null);
  const [amount, setAmount] = useState("");
  const [grade, setGrade] = useState("");
  const [gradeCategory, setGradeCategory] = useState<"daily" | "bsb1" | "bsb2" | "chsb">("daily");
  
  const [selectedGradeObj, setSelectedGradeObj] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const activeClassStudents = allStudents.filter(s => selectedClass ? s.class === selectedClass.className : true);
  const filteredStudents = activeClassStudents.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getDailyAverage = (daily: any[]) => daily.length === 0 ? 0 : daily.reduce((a, b) => a + b.val, 0) / daily.length;
  const getTotalQuarterScore = (student: any) => Math.round(getDailyAverage(student.daily)) + (student.bsb1 || 0) + (student.bsb2 || 0) + (student.chsb || 0);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAllStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: status } : s));
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(`${selectedStudent ? selectedStudent.name : 'Sinf'} ga muvaffaqiyatli saqlandi!`);
      
      if (actionType === "bulkPP") {
        setRecentLogs(prev => [{ id: Date.now(), text: `Oy yakuni: Butun sinfga ${amount} PP tarqatildi`, time: "Hozirgina", type: "pp" }, ...prev].slice(0, 10));
      } else if (actionType === "pp") {
         setRecentLogs(prev => [{ id: Date.now(), text: `${selectedStudent.name} hisobi o'zgartirildi`, time: "Hozirgina", type: "pp" }, ...prev].slice(0, 10));
      } else {
        setAllStudents(prev => prev.map(s => {
          if (s.id !== selectedStudent.id) return s;
          if (gradeCategory === "daily") return { ...s, daily: [...s.daily, { id: Date.now(), val: Number(grade), date: TODAY_DATE }] };
          return { ...s, [gradeCategory]: Number(grade) };
        }));
        setRecentLogs(prev => [{ id: Date.now(), text: `${selectedStudent.name} ga ${grade} qo'yildi`, time: "Hozirgina", type: "grade" }, ...prev].slice(0, 10));
      }
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  const handleEditGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage("Baho o'zgartirildi!");
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        return { ...s, daily: s.daily.map((g: any) => g.id === selectedGradeObj.id ? { ...g, val: Number(grade) } : g) };
      }));
      setRecentLogs(prev => [{ id: Date.now(), text: `${selectedStudent.name} bahosi o'zgardi. Sabab: ${reason}`, time: "Hozirgina", type: "edit" }, ...prev].slice(0, 10));
      setTimeout(() => { closeModal(); }, 1000);
    }, 500);
  };

  const openGradeModal = (student: any) => {
    setSelectedStudent(student);
    const todayLesson = todaysSchedule.find(s => s.className === student.class);
    if (todayLesson?.type === "bsb1") setGradeCategory("bsb1");
    else if (todayLesson?.type === "chsb") setGradeCategory("chsb");
    else setGradeCategory("daily");
    setActionType("grade");
  };

  const closeModal = () => { setSelectedStudent(null); setActionType(null); setAmount(""); setGrade(""); setReason(""); setSelectedGradeObj(null); setSuccessMessage(""); };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* TEPADAGI PROFIL */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end">
          <div>
            <p className="text-indigo-300 text-sm mb-1 uppercase tracking-wider font-medium">O'qituvchi Paneli</p>
            <h1 className="text-3xl font-bold mb-2">Ustoz {currentTeacher?.name}</h1>
            <p className="text-indigo-200 text-sm flex items-center"><Calendar className="w-4 h-4 mr-2" /> Bugungi sana: {new Date().toLocaleDateString('uz-UZ')}</p>
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

            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 border-2 border-blue-400 text-blue-600 rounded-lg text-sm font-bold bg-blue-50">1 chorak</button>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm flex items-center"><Download className="w-4 h-4 mr-2"/> MMTVdan TMR</button>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-gray-200">
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
                    <td className="p-3 text-sm text-gray-700 border border-gray-200 flex justify-between items-center group cursor-text">
                      <span className={plan.type !== 'lesson' ? 'text-red-600 font-bold' : ''}>{plan.topic}</span>
                      <div className="flex items-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4 mr-1"/><UploadCloud className="w-4 h-4"/></div>
                    </td>
                    <td className="p-3 text-sm text-gray-600 border border-gray-200 align-top">
                      <div className="flex justify-between items-start mb-2">
                        <span className={!plan.homework.includes('+') ? 'text-gray-700' : 'text-blue-500 cursor-pointer hover:underline'}>{plan.homework}</span>
                        {!plan.homework.includes('+') && <div className="flex space-x-2 text-gray-400"><Eye className="w-4 h-4"/><Paperclip className="w-4 h-4"/></div>}
                      </div>
                      <div className="flex justify-end mt-2"><button className="px-3 py-1.5 border border-blue-400 text-blue-500 rounded-md text-xs font-medium hover:bg-blue-50">Onlayn berish</button></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
               <button className="px-4 py-2 border border-blue-400 text-blue-600 rounded-lg text-sm font-medium bg-blue-50 hidden md:block">BSB/CHSB chiqarish</button>
               
               {/* SINF UCHUN PP TARQATISH TUGMASI (OY OXIRIGA QULFLANGAN) */}
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

          <div className="p-4 border-b border-gray-200 bg-slate-50 flex gap-2 overflow-x-auto">
             <button className="px-4 py-2 border-2 border-blue-400 text-blue-600 rounded-lg text-sm font-bold bg-white">1 chorak</button>
             <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-white">xulosa</button>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-slate-50">
                  <th colSpan={2} className="p-3 text-center text-sm text-blue-600 font-bold border border-gray-200 w-64">To'liq Ism</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-16">Davomat</th>
                  
                  {lessonDates.map(date => (
                    <th key={date} className={`p-2 text-center border border-gray-200 w-12 align-bottom ${date === TODAY_DATE ? 'border-x-2 border-x-blue-400 bg-blue-50/50' : ''}`}>
                      <div className={`text-xs ${date === TODAY_DATE ? 'text-blue-600 font-bold' : 'text-blue-500'}`}>{date}</div>
                      {date === TODAY_DATE && <div className="text-[9px] text-blue-400 mt-0.5">bugun</div>}
                    </th>
                  ))}
                  
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">O'rt</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">BSB 1</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">BSB 2</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12">CHSB</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-12 bg-gray-100">Chorak</th>
                  <th className="p-2 text-center text-[10px] text-gray-500 font-bold border border-gray-200 w-16">Amal (PP/Baho)</th>
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
                      
                      <td className="p-1 border border-gray-200 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => handleAttendanceChange(student.id, "present")} className={`p-1 rounded ${student.attendance === 'present' ? 'bg-green-500 text-white' : 'text-gray-300 hover:text-green-500'}`}><Check className="w-3 h-3" /></button>
                          <button onClick={() => handleAttendanceChange(student.id, "absent")} className={`p-1 rounded ${student.attendance === 'absent' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-red-500'}`}><UserMinus className="w-3 h-3" /></button>
                        </div>
                      </td>

                      {lessonDates.map(date => {
                        const g = student.daily.find((d:any) => d.date === date);
                        return (
                          <td key={date} className={`p-1 border border-gray-200 text-center h-10 ${date === TODAY_DATE ? 'border-x-2 border-x-blue-400 bg-blue-50/10' : ''}`}>
                            {g ? (
                              <button onClick={() => { setSelectedStudent(student); setSelectedGradeObj(g); setGrade(g.val.toString()); setActionType("editGrade"); }} className={`w-5 h-5 mx-auto rounded flex items-center justify-center font-bold text-[11px] cursor-pointer hover:opacity-80 ${g.val >= 8 ? 'bg-green-500 text-white' : g.val >= 6 ? 'bg-orange-400 text-white' : 'bg-red-500 text-white'}`} title="Tahrirlash">{g.val}</button>
                            ) : (
                              <div className="w-full h-full cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center group" onClick={() => { if(date === TODAY_DATE) openGradeModal(student); }}>
                                {date === TODAY_DATE && <span className="opacity-0 group-hover:opacity-100 text-blue-400 text-lg">+</span>}
                              </div>
                            )}
                          </td>
                        )
                      })}

                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-gray-600 bg-gray-50">{dailyAvg > 0 ? dailyAvg.toFixed(1) : ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-blue-600 bg-blue-50/30">{student.bsb1 || ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-blue-600 bg-blue-50/30">{student.bsb2 || ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-purple-600 bg-purple-50/30">{student.chsb || ""}</td>
                      <td className="p-2 text-center border border-gray-200 font-bold text-sm text-green-600 bg-gray-100">{totalQuarter > 0 ? totalQuarter : ""}</td>
                      
                      {/* ASOSIY HARAKATLAR */}
                      <td className="p-1 border border-gray-200 text-center">
                         <div className="flex justify-center gap-1">
                           <button onClick={() => openGradeModal(student)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Plus className="w-4 h-4" /></button>
                           <button onClick={() => { setSelectedStudent(student); setActionType("pp"); }} className="p-1.5 bg-orange-50 text-orange-500 rounded hover:bg-orange-100" title="Shaxsiy PP berish"><Award className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODALLAR */}
      {/* BULK PP MODAL (OY OXIRIDA SINFGA TARQATISH) */}
      {actionType === "bulkPP" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"><Award className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Oy yakuni: Sinfga PP</h2>
              <p className="text-sm text-gray-500 mb-6">Oyning oxirgi kunlari munosabati bilan butun sinf o'quvchilariga oylik stipendiya (PP) ajratish.</p>
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4">
                  <input type="number" placeholder="Oylik miqdor (Har biriga)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full text-center px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-xl font-black text-blue-600" />
                  <button onClick={(e) => handleAddGrade(e)} disabled={!amount || isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                    {isProcessing ? "Tarqatilmoqda..." : "Barchasiga PP qo'shish"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHAXSIY PP MODAL */}
      {selectedStudent && actionType === "pp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1 flex items-center"><Award className="w-6 h-6 mr-2 text-orange-500" /> PP Boshqaruvi</h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong>{selectedStudent.name}</strong></p>
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4">
                  <input type="number" placeholder="Summa (PP)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-lg font-mono" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={(e) => handleAddGrade(e)} disabled={!amount || isProcessing} className="flex items-center justify-center py-3 bg-red-50 text-red-600 rounded-xl font-bold"><Minus className="w-5 h-5 mr-1" /> Jarima</button>
                    <button onClick={(e) => handleAddGrade(e)} disabled={!amount || isProcessing} className="flex items-center justify-center py-3 bg-green-50 text-green-600 rounded-xl font-bold"><Plus className="w-5 h-5 mr-1" /> Mukofot</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BAHO QO'SHISH MODALI */}
      {selectedStudent && actionType === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1"><GraduationCap className="w-6 h-6 mr-2 text-indigo-500 inline" /> Yangi Baho</h2>
              <p className="text-sm text-gray-500 mb-4">O'quvchi: <strong>{selectedStudent.name}</strong></p>
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Baho turini tanlang</label>
                    <select value={gradeCategory} onChange={(e: any) => {setGradeCategory(e.target.value); setGrade("");}} disabled={gradeCategory !== "daily" && gradeCategory !== "bsb1" && gradeCategory !== "chsb"} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-medium outline-none disabled:opacity-70 disabled:bg-gray-200">
                      <option value="daily">Kunlik Baho (Max 10)</option>
                      <option value="bsb1">BSB-1 (Max 25)</option>
                      <option value="bsb2">BSB-2 (Max 25)</option>
                      <option value="chsb">CHSB (Max 40)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Baho miqdori</label>
                    {gradeCategory === "daily" ? (
                      <div className="grid grid-cols-5 gap-2">
                        {[1,2,3,4,5,6,7,8,9,10].map(g => (
                          <button key={g} onClick={() => setGrade(g.toString())} className={`py-2 rounded-lg font-black text-lg border ${grade === g.toString() ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{g}</button>
                        ))}
                      </div>
                    ) : (
                      <input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder={`Max ${gradeCategory === 'chsb' ? 40 : 25} ball`} className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 font-black text-xl outline-none focus:border-indigo-500" />
                    )}
                  </div>
                  <button onClick={handleAddGrade} disabled={!grade || isProcessing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                    {isProcessing ? "Saqlanmoqda..." : "Jurnalga kiritish"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                        <button key={g} onClick={() => setGrade(g.toString())} className={`py-2 rounded-lg font-black text-lg border ${grade === g.toString() ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200"}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sabab</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: Uy vazifasi xatosini to'g'riladi..." className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none h-24" />
                  </div>
                  <button onClick={handleEditGrade} disabled={!grade || !reason || isProcessing} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
                    {isProcessing ? "Saqlanmoqda..." : "O'zgarishni tasdiqlash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

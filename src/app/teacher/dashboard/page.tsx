"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, X, Calendar, Clock, MapPin, History, Check, UserMinus, Stethoscope, ArrowLeft, BookOpen } from "lucide-react";

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");

  // 1. O'QITUVCHINING BUGUNGI DARSLARI (Asosiy ekran)
  const todaysSchedule = [
    { id: 1, time: "08:00 - 08:45", className: "10-A", subject: "Algebra", room: "302-xona", isDone: true },
    { id: 2, time: "08:50 - 09:35", className: "10-B", subject: "Geometriya", room: "302-xona", isDone: false },
    { id: 3, time: "10:05 - 10:50", className: "11-A", subject: "Algebra", room: "305-xona", isDone: false },
  ];

  // 2. BARCHA O'QUVCHILAR BAZASI (Baholar Endi Sana Bilan!)
  const [allStudents, setAllStudents] = useState([
    { id: "S-8392", class: "10-A", name: "Kiyotaka Ayanokoji", balancePP: 100000, attendance: "present", grades: [{val: 5, date: "10.05"}, {val: 4, date: "12.05"}] },
    { id: "S-8393", class: "10-A", name: "Suzune Horikita", balancePP: 100000, attendance: "present", grades: [{val: 5, date: "12.05"}] },
    { id: "S-1001", class: "10-B", name: "Aliyev Vali", balancePP: 5000, attendance: "present", grades: [{val: 3, date: "09.05"}] },
    { id: "S-1002", class: "10-B", name: "Sodiqova Asal", balancePP: 7200, attendance: "absent", grades: [{val: 5, date: "08.05"}, {val: 5, date: "12.05"}] },
    { id: "S-2001", class: "11-A", name: "Toshmatov G'ishmat", balancePP: 1200, attendance: "sick", grades: [] },
  ]);

  // HOLATLAR (States)
  const [selectedClass, setSelectedClass] = useState<any>(null); // Qaysi sinf jurnali ochiqligi
  const [searchTerm, setSearchTerm] = useState("");
  const [recentLogs, setRecentLogs] = useState([{ id: 1, text: "Tizimga muvaffaqiyatli kirdingiz", time: "Hozirgina", type: "system" }]);

  // Modal Holatlari
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | null>(null);
  const [amount, setAmount] = useState("");
  const [grade, setGrade] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Faqat tanlangan sinf o'quvchilarini qidirish va ajratish
  const activeClassStudents = allStudents.filter(s => s.class === selectedClass?.className);
  const filteredStudents = activeClassStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // O'rtacha bahoni hisoblash
  const getAverage = (grades: {val: number, date: string}[]) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((a, b) => a + b.val, 0);
    return (sum / grades.length).toFixed(1);
  };

  // Davomatni o'zgartirish
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAllStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: status } : s));
  };

  // Forma yuborilishi (Baho yoki PP)
  const handleSubmitAction = (e: React.FormEvent, type: "add" | "subtract" | "grade") => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      let message = "";
      
      if (type === "add") message = `${selectedStudent.name} ga ${amount} PP qo'shildi!`;
      if (type === "subtract") message = `${selectedStudent.name} dan ${amount} PP jarima olindi!`;
      
      if (type === "grade") {
        message = `${selectedStudent.name} ga ${grade} baho qo'yildi!`;
        
        // Bugungi sanani olish (Masalan: 14.05)
        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        
        // Jurnalga sanasi bilan yozish
        setAllStudents(prev => prev.map(s => 
          s.id === selectedStudent.id ? { ...s, grades: [...s.grades, { val: Number(grade), date: dateStr }] } : s
        ));
      }

      setSuccessMessage(message);
      
      // Tarixga yozish
      const newLog = { id: Date.now(), text: message.replace("!", ""), time: "Hozirgina", type: type === "grade" ? "grade" : "pp" };
      setRecentLogs(prev => [newLog, ...prev].slice(0, 5));
      
      setTimeout(() => { closeModal(); }, 1500);
    }, 800);
  };

  const closeModal = () => {
    setSelectedStudent(null); setActionType(null); setAmount(""); setGrade(""); setSuccessMessage("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. TEPADAGI USTOZ PROFILI (Doyim ko'rinadi) */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <p className="text-indigo-300 text-sm mb-1 uppercase tracking-wider font-medium">O'qituvchi Paneli</p>
            <h1 className="text-3xl font-bold mb-2">Ustoz {currentTeacher?.name}</h1>
            <p className="text-indigo-200 text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-2" /> Bugun: {new Date().toLocaleDateString('uz-UZ')}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. ASOSIY EKRAN: Agar sinf tanlanmagan bo'lsa */}
      {/* ========================================== */}
      {!selectedClass && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
          
          {/* CHAP USTUN: Dars Jadvali */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
              <Clock className="w-6 h-6 mr-2 text-indigo-500" /> Bugungi Darslaringiz
            </h2>
            
            {todaysSchedule.map((cls) => (
              <div 
                key={cls.id} 
                onClick={() => setSelectedClass(cls)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold p-3 rounded-xl text-center w-20 border border-indigo-100 dark:border-indigo-500/20">
                    <div className="text-sm">{cls.time.split(' - ')[0]}</div>
                    <div className="text-[10px] uppercase opacity-70 mt-1">Boshlanish</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {cls.className} <span className="font-medium text-base text-gray-500 dark:text-gray-400">| {cls.subject}</span>
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {cls.room}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900 text-white dark:bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  Jurnalni ochish
                </div>
              </div>
            ))}
          </div>

          {/* O'NG USTUN: Tarix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 h-fit">
            <h3 className="font-bold text-lg flex items-center mb-6 dark:text-white">
              <History className="w-5 h-5 mr-2 text-orange-500" /> Faollik Tarixi
            </h3>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex gap-4 border-b border-gray-50 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div className="pb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ========================================== */}
      {/* 3. JURNAL EKRANI: Sinf tanlanganda ochiladi */}
      {/* ========================================== */}
      {selectedClass && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-right-8 duration-300">
          
          {/* Jurnal Tepa Menyusi */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedClass(null)}
                className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-indigo-500" /> 
                  {selectedClass.className} <span className="text-gray-400 ml-2 font-medium">| {selectedClass.subject}</span>
                </h2>
              </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Ism orqali izlash..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm" />
            </div>
          </div>

          {/* Jurnal Jadvali */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-slate-800">
                  <th className="p-4 font-medium pl-6 w-16">Nº</th>
                  <th className="p-4 font-medium w-56">O'quvchi Ismi</th>
                  <th className="p-4 font-medium w-48 text-center border-x border-gray-50 dark:border-slate-800">Davomat (Bugun)</th>
                  <th className="p-4 font-medium min-w-[250px]">Chorak Baholari</th>
                  <th className="p-4 font-medium text-center border-l border-gray-50 dark:border-slate-800">O'rtacha</th>
                  <th className="p-4 font-medium text-right pr-6">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-500 font-medium">Bu sinfda o'quvchi yo'q yoki izlashda xatolik.</td></tr>
                ) : (
                  filteredStudents.map((student, index) => {
                    const avg = Number(getAverage(student.grades));
                    const avgColor = avg >= 4.5 ? "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-800" : avg >= 3.5 ? "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-800" : "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-800";

                    return (
                      <tr key={student.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="p-4 pl-6 font-bold text-gray-400">{index + 1}</td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">{student.name}</td>
                        
                        {/* DAVOMAT */}
                        <td className="p-4 border-x border-gray-50 dark:border-slate-800">
                          <div className="flex items-center justify-center space-x-2">
                            <button onClick={() => handleAttendanceChange(student.id, "present")} className={`p-2 rounded-xl transition-all ${student.attendance === 'present' ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-green-500'}`} title="Keldi"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleAttendanceChange(student.id, "absent")} className={`p-2 rounded-xl transition-all ${student.attendance === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500'}`} title="Kelmadi"><UserMinus className="w-4 h-4" /></button>
                            <button onClick={() => handleAttendanceChange(student.id, "sick")} className={`p-2 rounded-xl transition-all ${student.attendance === 'sick' ? 'bg-orange-400 text-white shadow-md shadow-orange-500/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-orange-400'}`} title="Kasal"><Stethoscope className="w-4 h-4" /></button>
                          </div>
                        </td>

                        {/* BAHOLAR VA SANALAR */}
                        <td className="p-4 py-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            {student.grades.map((g: any, i: number) => (
                              <div key={i} className={`flex flex-col items-center justify-center w-11 h-12 rounded-xl border shadow-sm ${
                                g.val === 5 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30' :
                                g.val === 4 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30' :
                                g.val === 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30' :
                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'
                              }`}>
                                <span className="font-black text-base leading-none mt-1">{g.val}</span>
                                <span className="text-[9px] font-medium opacity-60 mt-1">{g.date}</span>
                              </div>
                            ))}
                            {student.grades.length === 0 && <span className="text-gray-400 text-sm font-medium">Baho qo'yilmagan</span>}
                          </div>
                        </td>

                        {/* O'RTACHA */}
                        <td className="p-4 text-center border-l border-gray-50 dark:border-slate-800">
                          <span className={`px-4 py-2 rounded-xl border-2 font-black text-sm shadow-sm ${avgColor}`}>
                            {avg}
                          </span>
                        </td>

                        {/* HARAKATLAR (Baho yoki PP qo'shish) */}
                        <td className="p-4 pr-6 flex justify-end space-x-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedStudent(student); setActionType("grade"); }} className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-xl transition-colors flex items-center font-bold text-sm border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                            <Plus className="w-4 h-4 mr-1" /> Baho
                          </button>
                          <button onClick={() => { setSelectedStudent(student); setActionType("pp"); }} className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-400 rounded-xl transition-colors shadow-sm" title="PP Boshqaruv">
                            <Award className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* MODALLAR TUGMALARIGA O'ZGARISH YO'Q (Jarayonlar shu yerda) */}
      {selectedStudent && actionType === "pp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1 flex items-center"><Award className="w-6 h-6 mr-2 text-orange-500" /> PP Boshqaruvi</h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong className="text-gray-900 dark:text-white">{selectedStudent.name}</strong></p>
              {successMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-2xl flex flex-col items-center text-center font-medium border border-green-100 dark:border-green-800">
                  <CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miqdor (PP)</label>
                    <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-lg font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={(e) => handleSubmitAction(e, "subtract")} disabled={!amount || isProcessing} className="flex items-center justify-center py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-xl font-bold transition-colors disabled:opacity-50"><Minus className="w-5 h-5 mr-1" /> Jarima</button>
                    <button onClick={(e) => handleSubmitAction(e, "add")} disabled={!amount || isProcessing} className="flex items-center justify-center py-3 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 rounded-xl font-bold transition-colors disabled:opacity-50"><Plus className="w-5 h-5 mr-1" /> Mukofot</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedStudent && actionType === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-indigo-500" /> Yangi Baho</h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong className="text-gray-900 dark:text-white">{selectedStudent.name}</strong></p>
              {successMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-2xl flex flex-col items-center text-center font-medium border border-green-100 dark:border-green-800">
                  <CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((g) => (
                      <button key={g} onClick={() => setGrade(g.toString())} className={`py-4 rounded-xl font-black text-2xl transition-all ${grade === g.toString() ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105" : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700"}`}>{g}</button>
                    ))}
                  </div>
                  <button onClick={(e) => handleSubmitAction(e, "grade")} disabled={!grade || isProcessing} className="w-full mt-4 flex items-center justify-center py-4 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md shadow-indigo-500/20">
                    {isProcessing ? "Saqlanmoqda..." : "Jurnalga kiritish"}
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

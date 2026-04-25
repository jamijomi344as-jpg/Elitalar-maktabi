"use client";

import { useState } from "react";
import { mockUsers, mockClasses } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, X, Calendar, Clock, MapPin, History, Activity, Check, UserMinus, Stethoscope } from "lucide-react";

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");
  const assignedClassInfo = mockClasses.find(c => c.className === currentTeacher?.assignedClass);
  const classStudents = mockUsers.filter(u => u.role === "student" && u.class === currentTeacher?.assignedClass);

  // O'QUVCHILAR UCHUN DINAMIK JURNAL STATI (Davomat va Baholar)
  const [localStudents, setLocalStudents] = useState(() => 
    classStudents.map(student => ({
      ...student,
      attendance: "present", // present (Keldi), absent (Kelmadi), sick (Kasal)
      // Vaqtincha test uchun chorak boshidan beri olingan baholar:
      grades: student.id === "S-8392" ? [5, 5, 4, 5, 5] : student.id === "S-8393" ? [5, 4, 5, 4] : [4, 3, 4],
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | null>(null);
  
  const [amount, setAmount] = useState("");
  const [grade, setGrade] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const todaysSchedule = [
    { id: 1, time: "08:00 - 08:45", className: "10-A", subject: "Algebra", room: "302-xona", isDone: true },
    { id: 2, time: "08:50 - 09:35", className: "10-B", subject: "Geometriya", room: "302-xona", isDone: false },
    { id: 3, time: "10:05 - 10:50", className: "11-A", subject: "Algebra", room: "305-xona", isDone: false },
  ];

  const [recentLogs, setRecentLogs] = useState([
    { id: 1, text: "Sinf jurnaliga kirdi", time: "10 daqiqa oldin", type: "grade" },
  ]);

  const filteredStudents = localStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // O'rtacha bahoni hisoblash funksiyasi
  const getAverage = (grades: number[]) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((a, b) => a + b, 0);
    return (sum / grades.length).toFixed(1);
  };

  // Davomatni o'zgartirish funksiyasi
  const handleAttendanceChange = (studentId: string, status: string) => {
    setLocalStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: status } : s));
  };

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
        // Haqiqiy jurnalga bahoni qo'shish
        setLocalStudents(prev => prev.map(s => 
          s.id === selectedStudent.id ? { ...s, grades: [...s.grades, Number(grade)] } : s
        ));
      }

      setSuccessMessage(message);
      
      const newLog = {
        id: Date.now(),
        text: message.replace("!", ""),
        time: "Hozirgina",
        type: type === "grade" ? "grade" : "pp"
      };
      setRecentLogs(prev => [newLog, ...prev].slice(0, 5));
      
      setTimeout(() => { closeModal(); }, 2000);
    }, 1000);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setActionType(null);
    setAmount("");
    setGrade("");
    setSuccessMessage("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. O'qituvchi va Sinf */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-32 h-32" /></div>
        <div className="relative z-10">
          <p className="text-indigo-300 text-sm mb-1 uppercase tracking-wider font-medium">Sinf Rahbari va Fan O'qituvchisi</p>
          <h1 className="text-3xl font-bold mb-6">Ustoz {currentTeacher?.name}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
              <p className="text-indigo-200 text-xs mb-1">Boshqaruvdagi sinf</p>
              <div className="text-2xl font-black">{currentTeacher?.assignedClass}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
              <p className="text-indigo-200 text-xs mb-1">O'quvchilar soni</p>
              <div className="text-2xl font-black">{localStudents.length} <span className="text-sm">nafar</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Dars jadvali va Tarix (Yashiringan/Yig'ilgan qilingan joyni tejash uchun) */}
      
      {/* 2. ELEKTRON JURNAL (ASOSIY QISM) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" /> 
            Elektron Jurnal: {currentTeacher?.assignedClass}
          </h2>
          <div className="relative w-full xl:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Ism yoki ID qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium pl-6 w-16">ID</th>
                <th className="p-4 font-medium w-48">O'quvchi Ismi</th>
                <th className="p-4 font-medium w-48 text-center">Davomat (Bugun)</th>
                <th className="p-4 font-medium min-w-[200px]">Chorak Baholari</th>
                <th className="p-4 font-medium text-center">O'rtacha</th>
                <th className="p-4 font-medium text-right pr-6">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">O'quvchi topilmadi.</td></tr>
              ) : (
                filteredStudents.map((student) => {
                  const avg = Number(getAverage(student.grades));
                  // O'rtacha bahoga qarab rang tanlash
                  const avgColor = avg >= 4.5 ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10 border-green-200 dark:border-green-800" : avg >= 3.5 ? "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-800" : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200 dark:border-red-800";

                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{student.id.split('-')[1]}</td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{student.name}</td>
                      
                      {/* DAVOMAT TOGGLELARI */}
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-1 bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
                          <button onClick={() => handleAttendanceChange(student.id, "present")} className={`p-1.5 rounded-lg transition-all tooltip-trigger ${student.attendance === 'present' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 hover:text-green-500'}`} title="Keldi">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAttendanceChange(student.id, "absent")} className={`p-1.5 rounded-lg transition-all tooltip-trigger ${student.attendance === 'absent' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-red-500'}`} title="Kelmadi">
                            <UserMinus className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAttendanceChange(student.id, "sick")} className={`p-1.5 rounded-lg transition-all tooltip-trigger ${student.attendance === 'sick' ? 'bg-orange-400 text-white shadow-sm' : 'text-gray-400 hover:text-orange-400'}`} title="Kasal (Sababli)">
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* CHORAK BAHOLARI RO'YXATI */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {student.grades.map((g: number, i: number) => (
                            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border ${
                              g === 5 ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' :
                              g === 4 ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' :
                              g === 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30' :
                              'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                            }`}>
                              {g}
                            </div>
                          ))}
                          {student.grades.length === 0 && <span className="text-gray-400 text-sm">Baho yo'q</span>}
                        </div>
                      </td>

                      {/* O'RTACHA BAHO */}
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1.5 rounded-xl border font-black text-sm ${avgColor}`}>
                          {avg}
                        </span>
                      </td>

                      {/* HARAKATLAR */}
                      <td className="p-4 pr-6 flex justify-end space-x-2">
                        <button onClick={() => { setSelectedStudent(student); setActionType("grade"); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors flex items-center">
                          <Plus className="w-4 h-4 mr-1" /> <GraduationCap className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setSelectedStudent(student); setActionType("pp"); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-lg transition-colors">
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

      {/* 3. MODAL: PP (Ball) Boshqaruvi (O'ZGARISHSIZ QOLDIRILDI) */}
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
                    <button onClick={(e) => handleSubmitAction(e, "subtract")} disabled={!amount || isProcessing} className="flex items-center justify-center py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-xl font-bold transition-colors disabled:opacity-50"><Minus className="w-5 h-5 mr-1" /> Jarima (-PP)</button>
                    <button onClick={(e) => handleSubmitAction(e, "add")} disabled={!amount || isProcessing} className="flex items-center justify-center py-3 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 rounded-xl font-bold transition-colors disabled:opacity-50"><Plus className="w-5 h-5 mr-1" /> Mukofot (+PP)</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: Baho qo'yish (O'ZGARISHSIZ QOLDIRILDI) */}
      {selectedStudent && actionType === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-blue-500" /> Yangi Baho</h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong className="text-gray-900 dark:text-white">{selectedStudent.name}</strong></p>
              {successMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-2xl flex flex-col items-center text-center font-medium border border-green-100 dark:border-green-800">
                  <CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((g) => (
                      <button key={g} onClick={() => setGrade(g.toString())} className={`py-4 rounded-xl font-black text-xl transition-all ${grade === g.toString() ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"}`}>{g}</button>
                    ))}
                  </div>
                  <button onClick={(e) => handleSubmitAction(e, "grade")} disabled={!grade || isProcessing} className="w-full mt-4 flex items-center justify-center py-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">
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

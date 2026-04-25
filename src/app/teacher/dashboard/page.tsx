"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, X, Calendar, Clock, MapPin, History, Check, UserMinus, Stethoscope, ArrowLeft, BookOpen, Edit3, AlertCircle, FileText } from "lucide-react";

export default function TeacherDashboard() {
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");
  const TODAY_DATE = "14.05"; // Hozirgi test sanasi

  // 1. YILLIK REJA VA BUGUNGI DARSLAR (Mavzular bilan)
  const todaysSchedule = [
    { id: 1, time: "08:00 - 08:45", className: "10-A", subject: "Algebra", room: "302-xona", topic: "Kvadrat tenglamalar grafiklari", type: "lesson" },
    { id: 2, time: "08:50 - 09:35", className: "10-B", subject: "Geometriya", room: "302-xona", topic: "BSB-1: Uchburchaklar yuzini topish", type: "bsb" },
    { id: 3, time: "10:05 - 10:50", className: "11-A", subject: "Algebra", room: "305-xona", topic: "CHSB: Yillik test", type: "chsb" },
  ];

  // 2. KENGAYTIRILGAN O'QUVCHILAR BAZASI (BSB, CHSB, Kunlik 100-ballik tizim)
  const [allStudents, setAllStudents] = useState([
    { id: "S-8392", class: "10-A", name: "Kiyotaka Ayanokoji", attendance: "present", daily: [{ id: 1, val: 10, date: "10.05" }, { id: 2, val: 9, date: "12.05" }], bsb1: 24, bsb2: null, chsb: null },
    { id: "S-8393", class: "10-A", name: "Suzune Horikita", attendance: "present", daily: [{ id: 3, val: 10, date: "12.05" }], bsb1: 22, bsb2: null, chsb: null },
    { id: "S-1001", class: "10-B", name: "Aliyev Vali", attendance: "present", daily: [{ id: 4, val: 6, date: "09.05" }], bsb1: 15, bsb2: null, chsb: null },
    { id: "S-1002", class: "10-B", name: "Sodiqova Asal", attendance: "absent", daily: [{ id: 5, val: 8, date: "08.05" }, { id: 6, val: 10, date: "12.05" }], bsb1: 25, bsb2: null, chsb: null },
  ]);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentLogs, setRecentLogs] = useState([{ id: 1, text: "Tizimga muvaffaqiyatli kirdingiz", time: "Hozirgina", type: "system" }]);

  // Modallar holati
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | "editGrade" | null>(null);
  const [amount, setAmount] = useState("");
  const [grade, setGrade] = useState("");
  const [gradeCategory, setGradeCategory] = useState<"daily" | "bsb1" | "bsb2" | "chsb">("daily");
  
  // Bahoni tahrirlash uchun
  const [selectedGradeObj, setSelectedGradeObj] = useState<any>(null);
  const [reason, setReason] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const filteredStudents = allStudents.filter(s => s.class === selectedClass?.className && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())));

  // Hisob-kitoblar (100 ballik tizim)
  const getDailyAverage = (daily: any[]) => daily.length === 0 ? 0 : daily.reduce((a, b) => a + b.val, 0) / daily.length;
  const getTotalQuarterScore = (student: any) => Math.round(getDailyAverage(student.daily)) + (student.bsb1 || 0) + (student.bsb2 || 0) + (student.chsb || 0);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAllStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: status } : s));
  };

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kuniga bitta baho cheklovi
    if (gradeCategory === "daily" && selectedStudent.daily.some((g: any) => g.date === TODAY_DATE)) {
      alert("Bu o'quvchiga bugun kunlik baho qo'yilgan! Uni tahrirlashingiz mumkin.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage(`${selectedStudent.name} ga baho muvaffaqiyatli saqlandi!`);
      
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        if (gradeCategory === "daily") return { ...s, daily: [...s.daily, { id: Date.now(), val: Number(grade), date: TODAY_DATE }] };
        return { ...s, [gradeCategory]: Number(grade) };
      }));

      const newLog = { id: Date.now(), text: `${selectedStudent.name} ga ${gradeCategory.toUpperCase()} dan ${grade} qo'yildi`, time: "Hozirgina", type: "grade" };
      setRecentLogs(prev => [newLog, ...prev].slice(0, 10));
      setTimeout(() => { closeModal(); }, 1500);
    }, 800);
  };

  const handleEditGrade = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMessage("Baho muvaffaqiyatli o'zgartirildi!");
      
      setAllStudents(prev => prev.map(s => {
        if (s.id !== selectedStudent.id) return s;
        return { ...s, daily: s.daily.map((g: any) => g.id === selectedGradeObj.id ? { ...g, val: Number(grade) } : g) };
      }));

      const newLog = { id: Date.now(), text: `${selectedStudent.name} bahosi ${selectedGradeObj.val} dan ${grade} ga o'zgartirildi. Sabab: ${reason}`, time: "Hozirgina", type: "edit" };
      setRecentLogs(prev => [newLog, ...prev].slice(0, 10));
      setTimeout(() => { closeModal(); }, 2000);
    }, 1000);
  };

  const closeModal = () => {
    setSelectedStudent(null); setActionType(null); setAmount(""); setGrade(""); setReason(""); setSelectedGradeObj(null); setSuccessMessage(""); setGradeCategory("daily");
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
            <p className="text-indigo-200 text-sm flex items-center"><Calendar className="w-4 h-4 mr-2" /> Bugungi sana: {TODAY_DATE}</p>
          </div>
        </div>
      </div>

      {/* ASOSIY EKRAN: Dars jadvali va Mavzular */}
      {!selectedClass && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
              <Clock className="w-6 h-6 mr-2 text-indigo-500" /> Bugungi Darslar va Mavzular Rejasi
            </h2>
            {todaysSchedule.map((cls) => (
              <div key={cls.id} onClick={() => setSelectedClass(cls)} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`font-bold p-3 rounded-xl text-center w-20 border ${cls.type === 'bsb' || cls.type === 'chsb' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    <div className="text-sm">{cls.time.split(' - ')[0]}</div>
                    <div className="text-[10px] uppercase opacity-70 mt-1">Boshlanish</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      {cls.className} 
                      {cls.type === 'bsb' || cls.type === 'chsb' ? <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-md">Imtihon kungi</span> : null}
                    </h3>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1 flex items-center">
                      <FileText className="w-4 h-4 mr-1" /> Mavzu: {cls.topic}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900 text-white dark:bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  Jurnalni ochish
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 h-fit">
            <h3 className="font-bold text-lg flex items-center mb-6 dark:text-white"><History className="w-5 h-5 mr-2 text-orange-500" /> Baza Tarixi</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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

      {/* JURNAL EKRANI (Yakuniy va mukammal jadval) */}
      {selectedClass && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-right-8 duration-300">
          
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedClass(null)} className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm"><ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center"><BookOpen className="w-6 h-6 mr-3 text-indigo-500" /> {selectedClass.className} Jurnali</h2>
                <p className="text-sm text-indigo-600 font-medium mt-1">Bugungi mavzu: {selectedClass.topic}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                  <th className="p-4 font-bold pl-6 w-12">Nº</th>
                  <th className="p-4 font-bold w-48">O'quvchi Ismi</th>
                  <th className="p-4 font-bold text-center border-x border-gray-200 dark:border-slate-700">Davomat</th>
                  <th className="p-4 font-bold min-w-[180px]">Kunlik Baholar (10)</th>
                  <th className="p-4 font-bold text-center border-l border-gray-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-900/10">O'rtacha (10)</th>
                  <th className="p-4 font-bold text-center bg-blue-50/50 dark:bg-blue-900/10">BSB 1 (25)</th>
                  <th className="p-4 font-bold text-center bg-blue-50/50 dark:bg-blue-900/10">BSB 2 (25)</th>
                  <th className="p-4 font-bold text-center bg-purple-50/50 dark:bg-purple-900/10">CHSB (40)</th>
                  <th className="p-4 font-bold text-center border-l border-gray-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/20">Chorak (100)</th>
                  <th className="p-4 font-bold text-right pr-6">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredStudents.map((student, index) => {
                  const dailyAvg = getDailyAverage(student.daily);
                  const totalQuarter = getTotalQuarterScore(student);
                  
                  return (
                    <tr key={student.id} className="hover:bg-indigo-50/20 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 pl-6 font-bold text-gray-400">{index + 1}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{student.name}</td>
                      
                      {/* DAVOMAT */}
                      <td className="p-4 border-x border-gray-100 dark:border-slate-800 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => handleAttendanceChange(student.id, "present")} className={`p-1.5 rounded-lg ${student.attendance === 'present' ? 'bg-green-500 text-white' : 'text-gray-300 hover:text-green-500'}`}><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleAttendanceChange(student.id, "absent")} className={`p-1.5 rounded-lg ${student.attendance === 'absent' ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-red-500'}`}><UserMinus className="w-4 h-4" /></button>
                          <button onClick={() => handleAttendanceChange(student.id, "sick")} className={`p-1.5 rounded-lg ${student.attendance === 'sick' ? 'bg-orange-400 text-white' : 'text-gray-300 hover:text-orange-400'}`}><Stethoscope className="w-4 h-4" /></button>
                        </div>
                      </td>

                      {/* KUNLIK BAHOLAR */}
                      <td className="p-4 py-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          {student.daily.map((g: any) => (
                            <button 
                              key={g.id} 
                              onClick={() => { setSelectedStudent(student); setSelectedGradeObj(g); setGrade(g.val.toString()); setActionType("editGrade"); }}
                              className="flex flex-col items-center justify-center w-10 h-11 rounded-lg border bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 transition-all cursor-pointer relative group/grade"
                              title="Tahrirlash uchun bosing"
                            >
                              <span className="font-black text-[15px] leading-none text-slate-700 dark:text-slate-300 group-hover/grade:text-indigo-600">{g.val}</span>
                              <span className="text-[8px] font-bold opacity-50 mt-0.5">{g.date}</span>
                            </button>
                          ))}
                          {student.daily.length === 0 && <span className="text-gray-400 text-xs font-medium">Baho yo'q</span>}
                        </div>
                      </td>

                      {/* O'RTACHA (10) */}
                      <td className="p-4 text-center border-l border-gray-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-900/5">
                        <span className="font-black text-indigo-700 dark:text-indigo-400">{dailyAvg > 0 ? dailyAvg.toFixed(1) : "-"}</span>
                      </td>

                      {/* BSB 1 (25) */}
                      <td className="p-4 text-center">
                        <span className="font-black text-blue-700 dark:text-blue-400 text-lg">{student.bsb1 || "-"}</span>
                      </td>

                      {/* BSB 2 (25) */}
                      <td className="p-4 text-center">
                        <span className="font-black text-blue-700 dark:text-blue-400 text-lg">{student.bsb2 || "-"}</span>
                      </td>

                      {/* CHSB (40) */}
                      <td className="p-4 text-center">
                        <span className="font-black text-purple-700 dark:text-purple-400 text-lg">{student.chsb || "-"}</span>
                      </td>

                      {/* CHORAK BAHOSI (100) */}
                      <td className="p-4 text-center border-l border-gray-200 dark:border-slate-700 bg-green-50/50 dark:bg-green-900/10">
                        <span className={`px-3 py-1.5 rounded-lg border-2 font-black text-lg ${totalQuarter >= 86 ? 'border-green-400 text-green-700 bg-green-100' : totalQuarter >= 71 ? 'border-blue-400 text-blue-700 bg-blue-100' : totalQuarter >= 56 ? 'border-yellow-400 text-yellow-700 bg-yellow-100' : totalQuarter > 0 ? 'border-red-400 text-red-700 bg-red-100' : 'border-gray-200 text-gray-400'}`}>
                          {totalQuarter > 0 ? totalQuarter : "-"}
                        </span>
                      </td>

                      {/* HARAKATLAR */}
                      <td className="p-4 pr-6 flex justify-end space-x-2">
                        <button onClick={() => { setSelectedStudent(student); setActionType("grade"); }} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center font-bold text-sm shadow-sm">
                          <Plus className="w-4 h-4 mr-1" /> Baho
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

      {/* YOSHI VA BAHOLASH MODALLARI */}
      
      {/* 1. BAHO QO'SHISH MODALI */}
      {selectedStudent && actionType === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1"><GraduationCap className="w-6 h-6 mr-2 text-indigo-500 inline" /> Yangi Baho</h2>
              <p className="text-sm text-gray-500 mb-4">O'quvchi: <strong className="text-gray-900 dark:text-white">{selectedStudent.name}</strong></p>
              
              {successMessage ? (
                <div className="bg-green-50 text-green-600 p-6 rounded-2xl flex flex-col items-center font-medium border border-green-100"><CheckCircle2 className="w-12 h-12 mb-3" />{successMessage}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Baho turini tanlang</label>
                    <select value={gradeCategory} onChange={(e: any) => {setGradeCategory(e.target.value); setGrade("");}} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 font-medium outline-none">
                      <option value="daily">Kunlik Baho (Max 10)</option>
                      <option value="bsb1">BSB-1 (Max 25)</option>
                      <option value="bsb2">BSB-2 (Max 25)</option>
                      <option value="chsb">CHSB (Max 40)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Baho miqdori</label>
                    {gradeCategory === "daily" ? (
                      <div className="grid grid-cols-5 gap-2">
                        {[1,2,3,4,5,6,7,8,9,10].map(g => (
                          <button key={g} onClick={() => setGrade(g.toString())} className={`py-2 rounded-lg font-black text-lg border ${grade === g.toString() ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200"}`}>{g}</button>
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

      {/* 2. BAHONI TAHRIRLASH (SABAB BILAN) */}
      {selectedStudent && actionType === "editGrade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full z-10"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1"><Edit3 className="w-6 h-6 mr-2 text-orange-500 inline" /> Bahoni tahrirlash</h2>
              <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm mb-4 flex border border-orange-200 mt-2">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> Bahoni o'zgartirish tarixda saqlanadi va ruxsat etilgan sabab ko'rsatilishi shart.
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sabab (Majburiy)</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: Uy vazifasini keyinroq topshirdi..." className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none h-24" />
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

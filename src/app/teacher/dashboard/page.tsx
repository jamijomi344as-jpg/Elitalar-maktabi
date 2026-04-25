"use client";

import { useState } from "react";
import { mockUsers, mockClasses } from "@/lib/mockData";
import { Users, GraduationCap, Award, ShieldAlert, Search, Plus, Minus, CheckCircle2, ChevronRight, X } from "lucide-react";

export default function TeacherDashboard() {
  // Hozirgi tizimga kirgan o'qituvchi (Vaqtincha Yulduz Ismailova)
  const currentTeacher = mockUsers.find(u => u.id === "T-1045");
  
  // O'qituvchiga biriktirilgan sinf ma'lumotlari
  const assignedClassInfo = mockClasses.find(c => c.className === currentTeacher?.assignedClass);
  
  // Faqat shu o'qituvchining sinfidagi o'quvchilarni ajratib olish
  const classStudents = mockUsers.filter(u => u.role === "student" && u.class === currentTeacher?.assignedClass);

  // Qidiruv holati
  const [searchTerm, setSearchTerm] = useState("");

  // Modal oynalar uchun holatlar (State)
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"pp" | "grade" | null>(null);
  
  // Forma ma'lumotlari
  const [amount, setAmount] = useState("");
  const [grade, setGrade] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // O'quvchilarni qidirish funksiyasi
  const filteredStudents = classStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formani yuborish (Baho yoki PP berish)
  const handleSubmitAction = (e: React.FormEvent, type: "add" | "subtract" | "grade") => {
    e.preventDefault();
    setIsProcessing(true);

    // Xuddi serverga so'rov yuborayotgandek 1 soniya kutamiz
    setTimeout(() => {
      setIsProcessing(false);
      let message = "";
      
      if (type === "add") message = `${selectedStudent.name} ga ${amount} PP qo'shildi!`;
      if (type === "subtract") message = `${selectedStudent.name} dan ${amount} PP jarima olindi!`;
      if (type === "grade") message = `${selectedStudent.name} ga ${grade} baho qo'yildi!`;

      setSuccessMessage(message);
      
      // 2 soniyadan keyin modalni yopamiz
      setTimeout(() => {
        closeModal();
      }, 2000);
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
      
      {/* 1. O'qituvchi va Sinf haqida qisqacha malumot */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-indigo-300 text-sm mb-1 uppercase tracking-wider font-medium">Sinf Rahbari Paneli</p>
          <h1 className="text-3xl font-bold mb-6">Ustoz {currentTeacher?.name}</h1>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
              <p className="text-indigo-200 text-xs mb-1">Boshqaruvdagi sinf</p>
              <div className="text-2xl font-black">{currentTeacher?.assignedClass}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
              <p className="text-indigo-200 text-xs mb-1">Sinf reytingi (CP)</p>
              <div className="text-2xl font-black text-amber-400">{assignedClassInfo?.pointsCP} <span className="text-sm">CP</span></div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
              <p className="text-indigo-200 text-xs mb-1">O'quvchilar soni</p>
              <div className="text-2xl font-black">{classStudents.length} <span className="text-sm font-normal">nafar</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. O'quvchilar ro'yxati va Qidiruv */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            Sinf o'quvchilari
          </h2>
          
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Ism yoki ID qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium pl-6">ID Raqam</th>
                <th className="p-4 font-medium">O'quvchi Ismi</th>
                <th className="p-4 font-medium">Balans (PP)</th>
                <th className="p-4 font-medium text-right pr-6">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">O'quvchi topilmadi.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {student.id}
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="p-4">
                      <span className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold px-3 py-1 rounded-lg text-sm border border-green-100 dark:border-green-500/20">
                        {student.balancePP?.toLocaleString()} PP
                      </span>
                    </td>
                    <td className="p-4 pr-6 flex justify-end space-x-2">
                      <button 
                        onClick={() => { setSelectedStudent(student); setActionType("grade"); }}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-lg transition-colors tooltip-trigger"
                        title="Baho qo'yish"
                      >
                        <GraduationCap className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setSelectedStudent(student); setActionType("pp"); }}
                        className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 dark:text-orange-400 rounded-lg transition-colors tooltip-trigger"
                        title="PP (Ball) boshqaruvi"
                      >
                        <Award className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL: PP (Ball) Boshqaruvi */}
      {selectedStudent && actionType === "pp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10">
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1 flex items-center">
                <Award className="w-6 h-6 mr-2 text-orange-500" /> PP Boshqaruvi
              </h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong className="text-gray-900 dark:text-white">{selectedStudent.name}</strong></p>

              {successMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-2xl flex flex-col items-center text-center font-medium border border-green-100 dark:border-green-800">
                  <CheckCircle2 className="w-12 h-12 mb-3" />
                  {successMessage}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miqdor (PP)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-lg font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={(e) => handleSubmitAction(e, "subtract")}
                      disabled={!amount || isProcessing}
                      className="flex items-center justify-center py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-5 h-5 mr-1" /> Jarima (-PP)
                    </button>
                    <button 
                      onClick={(e) => handleSubmitAction(e, "add")}
                      disabled={!amount || isProcessing}
                      className="flex items-center justify-center py-3 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5 mr-1" /> Mukofot (+PP)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: Baho qo'yish */}
      {selectedStudent && actionType === "grade" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full z-10">
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-white mb-1 flex items-center">
                <GraduationCap className="w-6 h-6 mr-2 text-blue-500" /> Baholash
              </h2>
              <p className="text-sm text-gray-500 mb-6">O'quvchi: <strong className="text-gray-900 dark:text-white">{selectedStudent.name}</strong></p>

              {successMessage ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-6 rounded-2xl flex flex-col items-center text-center font-medium border border-green-100 dark:border-green-800">
                  <CheckCircle2 className="w-12 h-12 mb-3" />
                  {successMessage}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g.toString())}
                        className={`py-4 rounded-xl font-black text-xl transition-all ${
                          grade === g.toString() 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" 
                            : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={(e) => handleSubmitAction(e, "grade")}
                    disabled={!grade || isProcessing}
                    className="w-full mt-4 flex items-center justify-center py-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? "Saqlanmoqda..." : "Bahoni saqlash"}
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

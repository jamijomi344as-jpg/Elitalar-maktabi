"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, Table, Calendar, Calculator, Building, Crown, LayoutDashboard, CheckCircle2, AlertTriangle, Lock, X, PlusCircle, Clock, Save } from "lucide-react";

export default function DirectorDashboard() {
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");

  // ==========================================
  // MODALLAR UCHUN STATE'LAR
  // ==========================================
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // KONSTRUKTOR STATE'LARI
  const [selectedClassForTimetable, setSelectedClassForTimetable] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentCell, setCurrentCell] = useState<{ day: string, lesson: number } | null>(null);

  // MOCK BAZALAR
  const [teachers, setTeachers] = useState([
    { id: "T-101", name: "Abduraximov V.M.", subject: "Algebra & Geometriya", homeroom: "9-B" },
    { id: "T-102", name: "Omondillayeva B.", subject: "Ona tili & Adabiyot", homeroom: "9-A" },
    { id: "T-103", name: "G'ULOMOVA G.R.", subject: "Fizika", homeroom: "Biriktirilmagan" },
  ]);

  const [classes, setClasses] = useState([
    { name: "9-A", capacity: 24, maxLimit: 24, status: "To'la" },
    { name: "9-B", capacity: 23, maxLimit: 24, status: "Joy bor" },
    { name: "9-C", capacity: 24, maxLimit: 24, status: "To'la" },
    { name: "9-D", capacity: 18, maxLimit: 24, status: "Joy bor" },
  ]);

  const subjectsBase = ["Algebra", "Geometriya", "Ona tili", "Adabiyot", "Ingliz tili", "Kimyo", "Biologiya", "Fizika", "Informatika"];
  const cabinetsBase = ["101-xona", "102-xona", "201-xona (Kompyuter)", "202-xona", "Fizika lab.", "Kimyo lab.", "Sport zal"];
  const days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
  const lessonNumbers = [1, 2, 3, 4, 5, 6, 7];

  // DARS JADVALI (Misol uchun 9-B dagi mavjud darslar)
  const [timetableData, setTimetableData] = useState<any>({
    "9-B": {
      "Du": { 
        1: { subject: "Kelajak soati", group: "Butun sinf", teacher: "ABDURAZZAQOV D.", room: "101-xona" }
      },
      "Se": {
        2: { subject: "Algebra", group: "Butun sinf", teacher: "Abduraximov V.M.", room: "101-xona" }
      }
    }
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* ======================================================== */}
      {/* YON PANEL (SIDEBAR) */}
      {/* ======================================================== */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen flex-shrink-0 z-20 text-slate-300 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-purple-600/30">E</div>
          <span className="text-xl font-black tracking-widest text-white">ELITA <span className="text-xs text-purple-400 align-top">ADMIN</span></span>
        </div>

        <div className="p-4 flex flex-col gap-2 mt-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'boshqaruv' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Boshqaruv
          </button>
          <button onClick={() => setActiveMenu("teachers")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'teachers' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Crown className="w-5 h-5 mr-3" /> O'qituvchilar
          </button>
          <button onClick={() => setActiveMenu("students")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'students' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3" /> O'quvchilar & Limit
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'timetable' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3" /> Dars Jadvali Konstruktori
          </button>
          <button onClick={() => setActiveMenu("algorithm")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'algorithm' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Calculator className="w-5 h-5 mr-3" /> Moliya & Algoritm
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ASOSIY KONTENT */}
      {/* ======================================================== */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
          
          <div className="w-full bg-gradient-to-br from-slate-900 to-purple-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Shield className="w-32 h-32 text-purple-200" /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-purple-300 text-sm mb-1 uppercase tracking-wider font-bold">Maktab Direktori Paneli</p>
                <h1 className="text-3xl font-black mb-2">Salom, Director 👋</h1>
                <p className="text-purple-200 font-medium flex items-center bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md">
                  <Building className="w-4 h-4 mr-2" /> Elita Maktabi Boshqaruvi
                </p>
              </div>
            </div>
          </div>

          {/* 1. BOSHQARUV */}
          {activeMenu === "boshqaruv" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4"><Users className="w-8 h-8"/></div>
                <h3 className="font-bold text-lg text-gray-800">Jami O'qituvchilar</h3>
                <p className="text-3xl font-black text-purple-600 mt-2">12</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8"/></div>
                <h3 className="font-bold text-lg text-gray-800">Tizim holati</h3>
                <p className="text-lg font-black text-emerald-600 mt-2">Algoritm Faol 🟢</p>
              </div>
            </div>
          )}

          {/* 2. O'QITUVCHILAR */}
          {activeMenu === "teachers" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center"><Crown className="w-6 h-6 mr-2 text-purple-600"/> O'qituvchilar Ro'yxati</h2>
                <button 
                  onClick={() => setShowTeacherModal(true)} // TUGMA JONLANDI
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Yangi o'qituvchi
                </button>
              </div>
              
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="p-4 text-sm font-bold text-gray-500">ID</th>
                      <th className="p-4 text-sm font-bold text-gray-500">F.I.SH</th>
                      <th className="p-4 text-sm font-bold text-gray-500">Fani</th>
                      <th className="p-4 text-sm font-bold text-gray-500">Sinf Rahbarligi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-medium text-gray-500">{t.id}</td>
                        <td className="p-4 text-sm font-bold text-gray-900">{t.name}</td>
                        <td className="p-4 text-sm text-gray-600">{t.subject}</td>
                        <td className="p-4">
                          <select className={`text-sm font-bold p-2 rounded-lg border outline-none ${t.homeroom === 'Biriktirilmagan' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`} defaultValue={t.homeroom}>
                            <option value="Biriktirilmagan">Biriktirilmagan</option>
                            {(["9-A", "9-B", "9-C", "9-D"] as const).map(cls => (
                               <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. O'QUVCHILAR & LIMIT */}
          {activeMenu === "students" && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center"><Shield className="w-6 h-6 mr-2 text-purple-600"/> Sifat Nazorati (Sinf Limiti)</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-2xl">O'quv sifatini tushirmaslik uchun har bir sinfda jami 24 tadan ortiq o'quvchi bo'lishiga ruxsat berilmaydi.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map(cls => (
                  <div key={cls.name} className={`p-5 rounded-2xl border transition-colors ${cls.capacity >= cls.maxLimit ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-2xl font-black text-gray-800">{cls.name}</h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${cls.capacity >= cls.maxLimit ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {cls.status}
                      </span>
                    </div>
                    
                    <div className="w-full bg-white rounded-full h-3 mb-2 overflow-hidden border border-gray-200 relative">
                      <div className={`h-3 rounded-full ${cls.capacity >= cls.maxLimit ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(cls.capacity / cls.maxLimit) * 100}%` }}></div>
                    </div>
                    <p className="text-sm font-bold text-gray-600 text-right">{cls.capacity} / {cls.maxLimit}</p>

                    <button 
                      onClick={() => setShowStudentModal(true)} // TUGMA JONLANDI
                      disabled={cls.capacity >= cls.maxLimit} 
                      className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${cls.capacity >= cls.maxLimit ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white shadow-sm'}`}
                    >
                      + {cls.capacity >= cls.maxLimit ? "Limit To'lgan" : "O'quvchi qo'shish"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DARS JADVALI KONSTRUKTORI */}
          {activeMenu === "timetable" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-wrap justify-between items-center gap-4">
                 <h2 className="text-xl font-bold text-gray-800 flex items-center"><Table className="w-6 h-6 mr-2 text-purple-600"/> Dars Jadvali Konstruktori</h2>
                 
                 {/* 1-Bosqich: Sinf tanlash (Gorizontal tab) */}
                 <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                   {classes.map(cls => (
                      <button 
                        key={cls.name} 
                        onClick={() => setSelectedClassForTimetable(cls.name)} 
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedClassForTimetable === cls.name ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                         {cls.name} Sinf
                      </button>
                   ))}
                 </div>
              </div>

              <div className="p-6">
                {/* Agar sinf tanlanmagan bo'lsa */}
                {!selectedClassForTimetable ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <Table className="w-16 h-16 text-purple-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Konstruktorni ishga tushirish</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">Dars jadvalini shakllantirish uchun avval tepadagi ro'yxatdan kerakli sinfni tanlang.</p>
                  </div>
                ) : (
                  
                  /* Sinf tanlangach: Gorizontal Kunlar va Vertikal Soatlar Gridi (2-rasmdek) */
                  <div className="animate-in fade-in duration-300 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">Sinf: <span className="font-black text-2xl text-purple-700">{selectedClassForTimetable}</span></h3>
                      <button className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-colors">
                         <Save className="w-4 h-4 mr-2" /> Jadvalni saqlash
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto p-1 border border-gray-200 rounded-3xl shadow-inner bg-slate-50/50">
                       <table className="w-full text-left border-collapse min-w-[900px]">
                          <thead>
                             <tr>
                                <th className="p-4 border-r border-gray-100 text-gray-400 font-bold text-xs text-center w-24">Soat \ Kun</th>
                                {days.map(day => (
                                   <th key={day} className="p-4 text-center text-sm font-bold text-gray-600 border-r border-gray-100 last:border-r-0">{day === 'Du' ? "Dushanba" : day === 'Se' ? "Seshanba" : day === 'Ch' ? "Chorshanba" : day === 'Pa' ? "Payshanba" : day === 'Ju' ? "Juma" : day === 'Sh' ? "Shanba" : day}</th>
                                ))}
                             </tr>
                          </thead>
                          <tbody>
                             {lessonNumbers.map(lessonNum => (
                                <tr key={lessonNum} className="border-t border-gray-100 hover:bg-slate-50/50">
                                   <td className="p-4 border-r border-gray-100 text-gray-400 font-black text-center align-top relative">
                                      <div className="absolute top-1 right-1 text-[10px] text-gray-400">{lessonNum}</div>
                                      <div className="flex flex-col items-center gap-1 text-[11px] font-medium text-gray-500">
                                         <Clock className="w-3 h-3"/>
                                         <span>0{7 + lessonNum}:00</span>
                                      </div>
                                   </td>
                                   
                                   {days.map(day => {
                                      const cellData = timetableData[selectedClassForTimetable]?.[day]?.[lessonNum];
                                      
                                      return (
                                        <td key={day} className="p-2 border-r border-gray-100 last:border-r-0 align-top min-h-[100px] h-full relative group">
                                          {cellData ? (
                                            /* Dars bor katak */
                                            <div 
                                              className="bg-purple-100 border border-purple-200 rounded-lg p-3 h-full cursor-pointer hover:border-purple-400 transition-colors relative"
                                              onClick={() => { setCurrentCell({day, lesson: lessonNum}); setShowLessonModal(true); }}
                                            >
                                                <div className="text-[10px] text-purple-600 uppercase font-black">{cellData.group}</div>
                                                <div className="font-bold text-sm text-purple-900 leading-tight my-1">{cellData.subject}</div>
                                                <div className="text-[11px] text-gray-600 leading-tight">{cellData.teacher}</div>
                                                <div className="text-[11px] text-gray-500 mt-1 font-medium">{cellData.room}</div>
                                            </div>
                                          ) : (
                                            /* Bo'sh katak (+) */
                                            <div 
                                              className="border-2 border-dashed border-gray-200 rounded-lg py-8 h-full flex items-center justify-center text-gray-300 hover:border-purple-300 hover:text-purple-500 transition-all cursor-pointer bg-white"
                                              onClick={() => { setCurrentCell({day, lesson: lessonNum}); setShowLessonModal(true); }}
                                              title={`${day}, ${lessonNum}-soatga dars qo'shish`}
                                            >
                                               <PlusCircle className="w-6 h-6" />
                                            </div>
                                          )}
                                        </td>
                                      )
                                   })}
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. MOLIYA VA ALGORITM */}
          {activeMenu === "algorithm" && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-4">
               <Lock className="absolute top-6 right-6 w-24 h-24 text-white/5" />
               <h2 className="text-2xl font-black mb-2 flex items-center"><Calculator className="w-6 h-6 mr-2 text-amber-400"/> ELITA Algoritmi (Smart Contract)</h2>
               <p className="text-slate-400 text-sm max-w-2xl mb-8">
                 Maktabning oylik byudjeti (100,000 PP) ushbu algoritm orqali avtomatik taqsimlanadi. Direktor yoki o'qituvchi bunga aralasha olmaydi.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                   <h3 className="font-bold text-amber-400 mb-2">1. Sinflar Reytingi bo'yicha:</h3>
                   <ul className="space-y-2 text-sm font-medium text-slate-300">
                     <li>🥇 1-o'rin (9-B): 40% (40,000 PP)</li>
                     <li>🥈 2-o'rin (9-A): 30% (30,000 PP)</li>
                     <li>🥉 3-o'rin (9-C): 20% (20,000 PP)</li>
                     <li>📉 4-o'rin (9-D): 10% (10,000 PP)</li>
                   </ul>
                 </div>
                 <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                   <h3 className="font-bold text-purple-400 mb-2">2. O'quvchilar bo'yicha formula:</h3>
                   <code className="text-xs bg-slate-900 p-3 rounded-lg text-emerald-400 block font-mono border border-slate-700">
                     O'quvchi Ulushi = (Sening O'rtacha Bahong / Sinfdagi Jami O'rtacha Baholar) * Sinfingizga Berilgan Jami PP
                   </code>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* QALQIB CHIQIDIGAN MODALLAR (MODALS) */}
      {/* ======================================================== */}

      {/* 1. YANGI O'QITUVCHI QO'SHISH OYNASI */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowTeacherModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><UserPlus className="w-5 h-5 mr-2 text-purple-600"/> Yangi O'qituvchi</h3>
                <button onClick={() => setShowTeacherModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <input type="text" placeholder="F.I.SH (Masalan: Alimov B.)" className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-300 font-medium" />
                <select className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-300 text-gray-600 font-medium">
                   <option value="">O'tadigan Fanini tanlang</option>
                   {subjectsBase.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={() => setShowTeacherModal(false)} className="px-5 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">Bekor qilish</button>
                <button onClick={() => setShowTeacherModal(false)} className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition-colors">Saqlash</button>
             </div>
          </div>
        </div>
      )}

      {/* 2. YANGI O'QUVCHI QO'SHISH OYNASI */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowStudentModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-emerald-600"/> Yangi O'quvchi</h3>
                <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <input type="text" placeholder="O'quvchining F.I.SH" className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 font-medium" />
                <div className="grid grid-cols-2 gap-4">
                   <select className="p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 text-gray-600 font-medium">
                      <option value="">Jinsi</option>
                      <option value="Male">Erkak</option>
                      <option value="Female">Ayol</option>
                   </select>
                   <select className="p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 text-gray-600 font-medium">
                      <option value="">Sinfi</option>
                      {classes.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                   </select>
                </div>
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={() => setShowStudentModal(false)} className="px-5 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">Bekor qilish</button>
                <button onClick={() => setShowStudentModal(false)} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors">Maktabga Qo'shish</button>
             </div>
          </div>
        </div>
      )}

      {/* 3. DARS QO'SHISH OYNASI (3-Rasm) */}
      {showLessonModal && currentCell && selectedClassForTimetable && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowLessonModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 bg-purple-50 flex justify-between items-center">
                <div>
                   <div className="text-xs text-purple-600 font-black tracking-widest">{selectedClassForTimetable} SINF</div>
                   <h3 className="font-bold text-xl text-purple-900 mt-1">
                     Dars qo'shish: <span className="text-purple-600">{currentCell.day}, {currentCell.lesson}-soat</span>
                   </h3>
                </div>
                <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5"/></button>
             </div>
             
             <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                   <select className="p-4 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-bold text-gray-700">
                      <option value="">Fanni tanlang</option>
                      {subjectsBase.map(s => (<option key={s} value={s}>{s}</option>))}
                   </select>
                   <select className="p-4 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-bold text-gray-700">
                      <option value="">Kim ishtirok etmoqda?</option>
                      <option value="Butun sinf">Butun sinf</option>
                      <option value="1-guruh">1-guruh</option>
                      <option value="2-guruh">2-guruh</option>
                      <option value="Qizlar">Qizlar guruhi</option>
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <select className="p-4 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-bold text-gray-700">
                      <option value="">O'qituvchini tanlang</option>
                      {teachers.map(t => (<option key={t.id} value={t.name}>{t.name}</option>))}
                   </select>
                   <select className="p-4 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-bold text-gray-700">
                      <option value="">Kabinetni tanlang</option>
                      {cabinetsBase.map(c => (<option key={c} value={c}>{c}</option>))}
                   </select>
                </div>
                
                <div className="flex items-center bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-500 mr-3"/>
                  <p className="text-sm font-medium text-amber-700">Ushbu dars 0{7 + currentCell.lesson}:00 da boshlanib, 45 daqiqa davom etadi.</p>
                </div>
             </div>

             <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50">
                <button onClick={() => setShowLessonModal(false)} className="px-5 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-200 transition-colors">Bekor qilish</button>
                <button onClick={() => setShowLessonModal(false)} className="px-5 py-3 bg-white text-purple-600 border border-purple-200 font-bold rounded-xl shadow-sm hover:bg-purple-50 transition-colors">Yaratish va yana qo'shish</button>
                <button onClick={() => setShowLessonModal(false)} className="px-5 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition-colors">Darsni Yaratish</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

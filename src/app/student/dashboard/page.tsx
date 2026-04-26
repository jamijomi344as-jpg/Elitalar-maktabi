"use client";

import { useState } from "react";
import { BookOpen, CheckSquare, ChevronLeft, ChevronRight, Clock, FileText, GraduationCap, LayoutGrid, Square, User, Award, TrendingUp, CheckCircle2, Home, BookA, Wallet, Trophy, Info } from "lucide-react";

// TYPESCRIPT PASPORTLARI
export type DailyGrade = { id: number; val: number | null; hwVal: number | null; attendance: string; date: string; };
export type Student = { id: string; class: string; name: string; balancePP: number; bsb1: number | null; bsb2: number | null; chsb: number | null; daily: DailyGrade[]; cp: number; };

export default function StudentDashboard() {
  const student = { id: "S-8392", name: "Kiyotaka Ayanokoji", class: "9-B", balancePP: 12000, cp: 150 };

  // ASOSIY MENYULAR (Tepadagi knopkalar orqali boshqariladi, chunki layout.tsx dagi sidebar bilan ulanish qiyin)
  const [mainMenu, setMainMenu] = useState<"asosiy" | "talim" | "reyting" | "hamyon">("talim");
  
  // TA'LIM ICHIDAGI NAVIGATION
  const [activeTab, setActiveTab] = useState<"kundalik" | "jadval" | "vazifa">("kundalik");
  const [kundalikView, setKundalikView] = useState<"joriy" | "chorak">("chorak"); 

  // ==========================================
  // BAZALAR
  // ==========================================
  const quarterGrades = [
    { id: 1, subject: "Adabiyot", grades: [], bsb: null, total: "-" },
    { id: 2, subject: "Algebra", grades: [9,9,9,9,9,9,9,9,9], bsb: "23/25", total: "32" },
    { id: 3, subject: "Biologiya", grades: [9,9,9,9], bsb: null, total: "9" },
    { id: 4, subject: "Dav/huq as", grades: [8,9,9], bsb: null, total: "9" },
    { id: 5, subject: "Fizika", grades: [9,9,9], bsb: "18/20", total: "18" },
    { id: 6, subject: "Geografiya", grades: [10,9], bsb: null, total: "-" },
    { id: 7, subject: "Geometriya", grades: [9,9,9,9,9,9], bsb: null, total: "9" },
    { id: 8, subject: "Informatika va AT", grades: [8,8,9,9], bsb: null, total: "9" },
    { id: 9, subject: "Ingliz tili", grades: [10,10], bsb: null, total: "10" },
  ];

  const [homeworks, setHomeworks] = useState([
    { id: 1, subject: "Algebra", text: "463-464 mashqlar. Kvadrat tenglamalar.", dueDate: "Ertaga, 08:00", completed: false },
    { id: 2, subject: "Geometriya", text: "51.4 mashq. Uchburchak yuzi.", dueDate: "25-apr, 08:00", completed: false },
    { id: 3, subject: "Fizika", text: "52 va 148-betlardagi masalalar.", dueDate: "25-apr, 09:40", completed: true },
  ]);

  const toggleHomework = (id: number) => setHomeworks(prev => prev.map(hw => hw.id === id ? { ...hw, completed: !hw.completed } : hw));
  const sortedHomeworks = [...homeworks].sort((a, b) => Number(a.completed) - Number(b.completed));

  const weeklyDiary = [
    {
      date: "JUM, 24 apr.",
      isToday: false,
      lessons: [
        { num: 1, name: "Algebra", time: "8:00 - 8:45", hw: "463-464 mashq", grade: 9, canceled: false },
        { num: 2, name: "Kimyo", time: "8:50 - 9:35", hw: "o'qib o'rganib kelish", grade: 8, canceled: false },
        { num: 3, name: "Dav/huq as", time: "9:40 - 10:25", hw: "Mavzuni o'qib kelish", grade: 9, canceled: false },
        { num: 4, name: "Rus tili", time: "10:35 - 11:20", hw: "повторение", grade: null, canceled: true },
        { num: 5, name: "Ona tili", time: "11:25 - 12:10", hw: "matn bilan ishlash.", grade: null, canceled: false },
      ]
    },
    {
      date: "SHAN, 25 apr.",
      isToday: false,
      lessons: [
        { num: 1, name: "Geometriya", time: "8:00 - 8:45", hw: "51.4 mashq", grade: null, canceled: false },
        { num: 2, name: "Biologiya", time: "8:50 - 9:35", hw: "O'rganib kelish", grade: null, canceled: false },
        { num: 3, name: "Fizika", time: "9:40 - 10:25", hw: "52 & 148 bet", grade: null, canceled: false },
      ]
    },
    { date: "YAK, 26 apr., bugun", isToday: true, lessons: [] }
  ];

  const scheduleGrid = [
    {
      time: "1 (08:00 - 08:45)",
      days: [
        { day: "Dush", subject: "Kelajak soati", teacher: "ABDURAZZAQOV D." },
        { day: "Sesh", subject: "Informatika", teacher: "Boltaboyeva N.B." },
        { day: "Chor", subject: "Algebra", teacher: "Abduraximov V.M." },
        { day: "Pay", subject: "Jahon tarixi", teacher: "ABDURAZZAQOV D." },
        { day: "Jum", subject: "Algebra", teacher: "Abduraximov V.M." },
        { day: "Shan", subject: "Geometriya", teacher: "Abduraximov V.M." },
      ]
    },
    {
      time: "2 (08:50 - 09:35)",
      days: [
        { day: "Dush", subject: "Ona tili", teacher: "Omondillayeva B." },
        { day: "Sesh", subject: "Algebra", teacher: "Abduraximov V.M." },
        { day: "Chor", subject: "Ingliz tili", teacher: "SHERMIRZAYEVA S." },
        { day: "Pay", subject: "O'zbekiston tarixi", teacher: "ABDURAZZAQOV D." },
        { day: "Jum", subject: "Kimyo", teacher: "G'aniyeva D.B." },
        { day: "Shan", subject: "Biologiya", teacher: "USUBBAYEVA D.A." },
      ]
    },
    {
      time: "3 (09:40 - 10:25)",
      days: [
        { day: "Dush", subject: "Algebra", teacher: "Abduraximov V.M." },
        { day: "Sesh", subject: "Ingliz tili", teacher: "SHERMIRZAYEVA S." },
        { day: "Chor", subject: "Ona tili", teacher: "Omondillayeva B." },
        { day: "Pay", subject: "Jismoniy madaniyat", teacher: "Qahharov H.Z." },
        { day: "Jum", subject: "Dav/huq as", teacher: "Adashaliyev A.K." },
        { day: "Shan", subject: "Fizika", teacher: "G'ULOMOVA G.R." },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* TEPADAGI PROFIL VA BALANS */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-blue-300 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchi Paneli</p>
            <h1 className="text-3xl font-black mb-2">{student.name}</h1>
            <p className="text-blue-200 font-medium flex items-center bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md">
              <GraduationCap className="w-4 h-4 mr-2" /> Sinf: {student.class}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 text-xs mb-1 font-bold uppercase">Balans (PP)</p>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.balancePP}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 text-xs mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1" /> {student.cp}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ICHKI MENYULAR (Asosiy, Ta'lim, Hamyon, Reyting) */}
      {/* Diqqat: Bu tugmalar orqali sahifani boshqaramiz, chunki chapdagi qora sidebar loyihaning Layout'ida joylashgan */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit overflow-x-auto max-w-full">
        <button onClick={() => setMainMenu("asosiy")} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap ${mainMenu === 'asosiy' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Home className="w-4 h-4 mr-2"/> Asosiy
        </button>
        <button onClick={() => setMainMenu("talim")} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap ${mainMenu === 'talim' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
          <BookA className="w-4 h-4 mr-2"/> Ta'lim
        </button>
        <button onClick={() => setMainMenu("reyting")} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap ${mainMenu === 'reyting' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Trophy className="w-4 h-4 mr-2"/> Reyting
        </button>
        <button onClick={() => setMainMenu("hamyon")} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center whitespace-nowrap ${mainMenu === 'hamyon' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Wallet className="w-4 h-4 mr-2"/> Hamyon
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. ASOSIY SAHIFA */}
      {/* ======================================================== */}
      {mainMenu === "asosiy" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center min-h-[300px]">
            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Info className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Maktab yangiliklari</h2>
            <p className="text-gray-500">Hozircha hech qanday e'lon yoki yangilik yo'q.</p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HAMYON SAHIFASI */}
      {/* ======================================================== */}
      {mainMenu === "hamyon" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center min-h-[300px]">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">O'quvchilar Do'koni</h2>
            <p className="text-gray-500">PP ballaringiz evaziga maktab xizmatlarini xarid qiling. Do'kon tez orada ochiladi.</p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REYTING SAHIFASI */}
      {/* ======================================================== */}
      {mainMenu === "reyting" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center min-h-[300px]">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sinf Reytingi</h2>
            <p className="text-gray-500">Sizning CP (Class Points) ballaringiz reytingda qatnashmoqda.</p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TA'LIM SAHIFASI (Kundalik, Jadval, Vazifalar) */}
      {/* ======================================================== */}
      {mainMenu === "talim" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="border-b border-gray-200 bg-slate-50 p-4 flex flex-wrap justify-center sm:justify-start gap-2">
            <button onClick={() => setActiveTab("kundalik")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'kundalik' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <BookOpen className="w-4 h-4 mr-2" /> Kundalik
            </button>
            <button onClick={() => setActiveTab("jadval")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'jadval' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <LayoutGrid className="w-4 h-4 mr-2" /> Dars jadvali
            </button>
            <button onClick={() => setActiveTab("vazifa")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'vazifa' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <FileText className="w-4 h-4 mr-2" /> Uy vazifasi
            </button>
          </div>

          <div className="p-6 bg-slate-50/30 min-h-[500px]">
            
            {activeTab === "kundalik" && (
              <div className="animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm gap-4 md:gap-0">
                  <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button onClick={() => setKundalikView("joriy")} className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${kundalikView === 'joriy' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>Joriy</button>
                    <button onClick={() => setKundalikView("chorak")} className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${kundalikView === 'chorak' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}>Choraklar bo'yicha</button>
                  </div>
                  <div className="hidden md:flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-blue-600 font-bold text-sm rounded-lg flex items-center shadow-sm">
                      <Award className="w-4 h-4 mr-2"/> O'zlashTah
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-500 font-bold text-sm rounded-lg shadow-sm">100%</button>
                  </div>
                </div>

                {kundalikView === "joriy" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-left-4">
                    {weeklyDiary.map((day, idx) => (
                      <div key={idx} className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full border ${day.isToday ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-gray-200'}`}>
                        <div className={`p-3 font-bold text-sm text-center ${day.isToday ? 'bg-blue-100 text-blue-800' : 'bg-blue-400 text-white'}`}>
                          {day.date}
                        </div>
                        <div className="p-2 flex-1 flex flex-col gap-2 bg-slate-50/50">
                          {day.lessons.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium py-10">Dam olish kuni</div>
                          ) : (
                            day.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className={`bg-white p-3 rounded-lg border ${lesson.canceled ? 'border-red-100 bg-red-50/30' : 'border-gray-200 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <span className="text-gray-400 font-bold text-xs mr-2">{lesson.num}.</span>
                                    <span className={`font-bold text-sm ${lesson.canceled ? 'text-red-500 line-through' : 'text-blue-600'}`}>{lesson.name}</span>
                                    <div className="text-[10px] text-gray-400 font-medium ml-4 mt-0.5">{lesson.time}</div>
                                  </div>
                                  {lesson.grade && (
                                    <div className="w-6 h-6 bg-green-500 rounded text-white font-black text-sm flex items-center justify-center shadow-sm">{lesson.grade}</div>
                                  )}
                                </div>
                                <div className="ml-4 mt-1">
                                  {lesson.hw ? (
                                    <div className="flex items-start bg-blue-50/50 p-2 rounded border border-blue-100">
                                      <CheckSquare className="w-3 h-3 text-blue-400 mt-0.5 mr-1.5 flex-shrink-0" />
                                      <span className="text-xs font-medium text-gray-700 leading-tight">{lesson.hw}</span>
                                    </div>
                                  ) : (
                                    !lesson.canceled && <div className="text-[11px] text-gray-400 italic">Vazifa yo'q</div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {kundalikView === "chorak" && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-right-4">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <button className="text-blue-500 hover:text-blue-700"><ChevronLeft className="w-6 h-6"/></button>
                        <h3 className="text-2xl font-black text-blue-900 flex items-center">
                          2025/2026 <span className="text-lg font-medium text-gray-500 ml-2">({student.class})</span>
                        </h3>
                        <button className="text-blue-500 hover:text-blue-700"><ChevronRight className="w-6 h-6"/></button>
                      </div>
                      
                      <div className="flex gap-1 items-center">
                        <button className="px-4 py-2 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-lg">1</button>
                        <button className="px-4 py-2 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-lg">2</button>
                        <button className="px-4 py-2 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-lg">3</button>
                        <button className="px-5 py-2 font-bold text-sm text-blue-600 bg-white border-2 border-blue-400 rounded-xl shadow-sm">4 chorak</button>
                        <button className="px-4 py-2 font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-lg">xulosa</button>
                      </div>
                      
                      <div className="hidden lg:flex items-center bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-xs text-blue-600 font-medium">
                        <span className="w-4 h-4 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mr-2"></span>
                        Reytingni ko'rish uchun bahoning ustiga bosing
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="p-4 text-sm font-bold text-gray-600 w-1/4">Fan</th>
                            <th className="p-4 text-sm font-bold text-gray-600 text-center"></th>
                            <th className="p-4 text-sm font-bold text-gray-600 text-center w-24">Ballar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quarterGrades.map((q, idx) => (
                            <tr key={q.id} className={`border-b border-gray-100 hover:bg-blue-50/20 transition-colors ${idx % 2 !== 0 ? 'bg-slate-50/30' : 'bg-white'}`}>
                              <td className="p-4 font-bold text-sm text-blue-900">{q.subject}</td>
                              
                              <td className="p-4">
                                {q.grades.length === 0 ? (
                                  <div className="text-center text-sm font-medium text-gray-500">Qo'yilmagan baholar mavjud emas.</div>
                                ) : (
                                  <div className="flex flex-wrap items-center justify-start gap-1">
                                    {q.grades.map((grade, i) => (
                                      <div key={i} className="w-6 h-6 bg-[#4caf50] text-white flex items-center justify-center rounded-sm text-xs font-black shadow-sm">
                                        {grade}
                                      </div>
                                    ))}
                                    {q.bsb && (
                                      <div className="px-2 py-0.5 bg-[#43a047] text-white flex items-center justify-center rounded-sm text-xs font-black shadow-sm ml-2 tracking-wide">
                                        {q.bsb}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="p-4 text-center font-black text-sm text-blue-600">
                                {q.total}
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

            {activeTab === "jadval" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
                  <div>
                    <h2 className="text-2xl font-light text-gray-600">Dars jadvali <strong className="text-blue-900 font-black">{student.class}</strong> <span className="text-lg text-gray-400">(2025/2026)</span></h2>
                    <p className="text-sm text-gray-500 mt-1">O'zbek tili</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 bg-white">1 chorak</button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 bg-white">2 chorak</button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 bg-white">3 chorak</button>
                    <button className="px-4 py-2 border-2 border-blue-400 text-blue-600 font-bold text-sm rounded-lg bg-blue-50">4 chorak</button>
                  </div>
                </div>

                <div className="overflow-x-auto p-4">
                  <table className="w-full text-left border-collapse border border-gray-200 min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 text-center w-24"></th>
                        <th className="p-3 text-center text-sm font-bold text-gray-600 border-l border-gray-200">Dush, 20 Apr</th>
                        <th className="p-3 text-center text-sm font-bold text-gray-600 border-l border-gray-200">Sesh, 21 Apr</th>
                        <th className="p-3 text-center text-sm font-bold text-gray-600 border-l border-gray-200">Chor, 22 Apr</th>
                        <th className="p-3 text-center text-sm font-bold text-gray-600 border-l border-gray-200">Pay, 23 Apr</th>
                        <th className="p-3 text-center text-sm font-bold text-gray-600 border-l border-gray-200">Jum, 24 Apr</th>
                        <th className="p-3 text-center text-sm font-bold text-red-500 border-l border-gray-200">Shan, 25 Apr</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleGrid.map((row, i) => (
                        <tr key={i} className="border-b border-gray-200">
                          <td className="p-2 border-r border-gray-200 align-top bg-gray-50/50">
                            <div className="font-black text-gray-800 text-lg text-center">{row.time.split(' ')[0]}</div>
                            <div className="text-[10px] text-gray-400 font-medium text-center">{row.time.split(' ')[1]}</div>
                          </td>
                          {row.days.map((day, dIdx) => (
                            <td key={dIdx} className="p-2 border-r border-gray-200 align-top hover:bg-blue-50/30 transition-colors w-1/6">
                              <div className="h-full border border-transparent hover:border-blue-200 rounded p-1.5 cursor-pointer">
                                <div className="font-bold text-sm text-blue-600 mb-0.5 leading-tight">{day.subject}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold leading-tight mb-1 truncate" title={day.teacher}>{day.teacher}</div>
                                <div className="text-[10px] text-gray-400">Kabinet yo'q</div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "vazifa" && (
              <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                  <h2 className="text-2xl font-black mb-2 flex items-center"><FileText className="w-6 h-6 mr-2" /> Uy vazifalari (Checklist)</h2>
                  <p className="text-blue-100 text-sm">O'qituvchi tomonidan berilgan vazifalarni belgilab boring. Hammasini yakunlab, reytingingizni oshiring!</p>
                </div>

                {sortedHomeworks.map((hw) => (
                  <div 
                    key={hw.id} 
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                      hw.completed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300'
                    }`}
                  >
                    <button 
                      onClick={() => toggleHomework(hw.id)} 
                      className={`mt-1 flex-shrink-0 transition-colors ${hw.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                    >
                      {hw.completed ? <CheckSquare className="w-7 h-7" /> : <Square className="w-7 h-7" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                        <h3 className={`font-bold text-lg ${hw.completed ? 'text-gray-500 line-through decoration-2' : 'text-blue-900'}`}>
                          {hw.subject}
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit border ${
                          hw.completed ? 'bg-gray-100 text-gray-500 border-gray-200' : 
                          hw.dueDate.includes('Ertaga') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          <Clock className="w-3 h-3 inline mr-1" /> Muddat: {hw.dueDate}
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${hw.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {hw.text}
                      </p>
                    </div>
                  </div>
                ))}

                {homeworks.every(hw => hw.completed) && (
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-8 animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-green-700 mb-1">Qoyilmaqom!</h3>
                    <p className="text-green-600 font-medium">Barcha uy vazifalari bajarildi. Siz bugun o'z ustingizda ajoyib ishladingiz!</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

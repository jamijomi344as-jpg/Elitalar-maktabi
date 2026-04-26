"use client";

import { useState } from "react";
import { BookOpen, CheckSquare, ChevronLeft, ChevronRight, Clock, FileText, GraduationCap, LayoutGrid, Square, User, Award, TrendingUp, CheckCircle2 } from "lucide-react";

export default function EducationPage() {
  const student = { id: "S-8392", name: "Kiyotaka Ayanokoji", class: "9-B", balancePP: 12000, cp: 150 };

  const [activeTab, setActiveTab] = useState<"kundalik" | "jadval" | "vazifa">("kundalik");
  const [kundalikView, setKundalikView] = useState<"joriy" | "chorak">("chorak"); 

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

  // 6 SOATLIK DARS QO'SHILDI
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
        { num: 6, name: "Tarbiyaviy soat", time: "12:15 - 13:00", hw: "", grade: null, canceled: false },
      ]
    },
    {
      date: "SHAN, 25 apr.",
      isToday: false,
      lessons: [
        { num: 1, name: "Geometriya", time: "8:00 - 8:45", hw: "51.4 mashq", grade: null, canceled: false },
        { num: 2, name: "Biologiya", time: "8:50 - 9:35", hw: "O'rganib kelish", grade: null, canceled: false },
        { num: 3, name: "Fizika", time: "9:40 - 10:25", hw: "52 & 148 bet", grade: null, canceled: false },
        { num: 4, name: "Adabiyot", time: "10:35 - 11:20", hw: "she'r yod olish.", grade: null, canceled: false },
        { num: 5, name: "Informatika", time: "11:25 - 12:10", hw: "Amaliyot", grade: null, canceled: false },
        { num: 6, name: "Jismoniy tarbiya", time: "12:15 - 13:00", hw: "Sport kiyimi", grade: null, canceled: false },
      ]
    },
    { date: "YAK, 26 apr., bugun", isToday: true, lessons: [] }
  ];

  const scheduleGrid = [
    { time: "1 (08:00 - 08:45)", days: [{ day: "Dush", subject: "Kelajak soati", teacher: "ABDURAZZAQOV" }, { day: "Sesh", subject: "Informatika", teacher: "Boltaboyeva" }, { day: "Chor", subject: "Algebra", teacher: "Abduraximov" }, { day: "Pay", subject: "Jahon tarixi", teacher: "ABDURAZZAQOV" }, { day: "Jum", subject: "Algebra", teacher: "Abduraximov" }, { day: "Shan", subject: "Geometriya", teacher: "Abduraximov" }] },
    { time: "2 (08:50 - 09:35)", days: [{ day: "Dush", subject: "Ona tili", teacher: "Omondillayeva" }, { day: "Sesh", subject: "Algebra", teacher: "Abduraximov" }, { day: "Chor", subject: "Ingliz tili", teacher: "SHERMIRZAYEVA" }, { day: "Pay", subject: "O'zbekiston tarixi", teacher: "ABDURAZZAQOV" }, { day: "Jum", subject: "Kimyo", teacher: "G'aniyeva" }, { day: "Shan", subject: "Biologiya", teacher: "USUBBAYEVA" }] },
    { time: "3 (09:40 - 10:25)", days: [{ day: "Dush", subject: "Algebra", teacher: "Abduraximov" }, { day: "Sesh", subject: "Ingliz tili", teacher: "SHERMIRZAYEVA" }, { day: "Chor", subject: "Ona tili", teacher: "Omondillayeva" }, { day: "Pay", subject: "Jismoniy tarbiya", teacher: "Qahharov" }, { day: "Jum", subject: "Dav/huq as", teacher: "Adashaliyev" }, { day: "Shan", subject: "Fizika", teacher: "G'ULOMOVA" }] },
    { time: "4 (10:35 - 11:20)", days: [{ day: "Dush", subject: "Fizika", teacher: "G'ULOMOVA" }, { day: "Sesh", subject: "O'zbekiston tarixi", teacher: "ABDURAZZAQOV" }, { day: "Chor", subject: "Rus tili", teacher: "Mavlonova" }, { day: "Pay", subject: "Geometriya", teacher: "Abduraximov" }, { day: "Jum", subject: "Rus tili", teacher: "Mavlonova" }, { day: "Shan", subject: "Adabiyot", teacher: "Omondillayeva" }] },
    { time: "5 (11:25 - 12:10)", days: [{ day: "Dush", subject: "Biologiya", teacher: "USUBBAYEVA" }, { day: "Sesh", subject: "Tarbiya", teacher: "Adashaliyev" }, { day: "Chor", subject: "Adabiyot", teacher: "Omondillayeva" }, { day: "Pay", subject: "Informatika", teacher: "Boltaboyeva" }, { day: "Jum", subject: "Ona tili", teacher: "Omondillayeva" }, { day: "Shan", subject: "Informatika", teacher: "Boltaboyeva" }] },
    { time: "6 (12:15 - 13:00)", days: [{ day: "Dush", subject: "Geografiya", teacher: "Sodiqov" }, { day: "Sesh", subject: "Chizmachilik", teacher: "Rahmonov" }, { day: "Chor", subject: "Informatika", teacher: "Boltaboyeva" }, { day: "Pay", subject: "-", teacher: "-" }, { day: "Jum", subject: "Tarbiyaviy soat", teacher: "Rahbar" }, { day: "Shan", subject: "Jismoniy tarbiya", teacher: "Qahharov" }] },
  ];

  return (
    // BO'ShLIQ MUAMMOSI HAL QILINDI: max-w-6xl o'rniga w-full ishlatildi.
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-transparent dark:border-slate-800 w-full">
        <div className="absolute top-0 right-0 p-8 opacity-10"><User className="w-32 h-32" /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div>
            <p className="text-blue-300 dark:text-blue-400 text-sm mb-1 uppercase tracking-wider font-bold">O'quvchi Paneli</p>
            <h1 className="text-3xl font-black mb-2">{student.name}</h1>
            <p className="text-blue-200 dark:text-slate-300 font-medium flex items-center bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md">
              <GraduationCap className="w-4 h-4 mr-2" /> Sinf: {student.class}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 dark:text-slate-300 text-xs mb-1 font-bold uppercase">Balans (PP)</p>
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1"/> {student.balancePP}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[120px] text-center">
              <p className="text-blue-200 dark:text-slate-300 text-xs mb-1 font-bold uppercase">Reyting (CP)</p>
              <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1" /> {student.cp}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden w-full animate-in slide-in-from-bottom-4 duration-300">
        <div className="border-b border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-wrap justify-center sm:justify-start gap-2 w-full">
          <button onClick={() => setActiveTab("kundalik")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'kundalik' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
            <BookOpen className="w-4 h-4 mr-2" /> Kundalik
          </button>
          <button onClick={() => setActiveTab("jadval")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'jadval' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
            <LayoutGrid className="w-4 h-4 mr-2" /> Dars jadvali
          </button>
          <button onClick={() => setActiveTab("vazifa")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${activeTab === 'vazifa' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
            <FileText className="w-4 h-4 mr-2" /> Uy vazifasi
          </button>
        </div>

        <div className="p-6 bg-slate-50/30 dark:bg-slate-900/50 min-h-[500px] w-full">
          {activeTab === "kundalik" && (
            <div className="animate-in fade-in duration-300 w-full">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm gap-4 md:gap-0 w-full">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{student.name}</h2>
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                  <button onClick={() => setKundalikView("joriy")} className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${kundalikView === 'joriy' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>Joriy</button>
                  <button onClick={() => setKundalikView("chorak")} className={`px-6 py-2 font-bold text-sm rounded-lg transition-all ${kundalikView === 'chorak' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800'}`}>Choraklar bo'yicha</button>
                </div>
              </div>

              {kundalikView === "joriy" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-left-4 w-full">
                  {weeklyDiary.map((day, idx) => (
                    <div key={idx} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full border ${day.isToday ? 'border-blue-300 dark:border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-slate-700'}`}>
                      <div className={`p-3 font-bold text-sm text-center ${day.isToday ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200' : 'bg-blue-400 dark:bg-slate-700 text-white'}`}>{day.date}</div>
                      <div className="p-2 flex-1 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/20">
                        {day.lessons.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium py-10">Dam olish kuni</div>
                        ) : (
                          day.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className={`bg-white dark:bg-slate-800 p-3 rounded-lg border ${lesson.canceled ? 'border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/20' : 'border-gray-200 dark:border-slate-700 shadow-sm'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-gray-400 font-bold text-xs mr-2">{lesson.num}.</span>
                                  <span className={`font-bold text-sm ${lesson.canceled ? 'text-red-500 line-through' : 'text-blue-600 dark:text-blue-400'}`}>{lesson.name}</span>
                                  <div className="text-[10px] text-gray-400 font-medium ml-4 mt-0.5">{lesson.time}</div>
                                </div>
                                {lesson.grade && <div className="w-6 h-6 bg-green-500 dark:bg-green-600 rounded text-white font-black text-sm flex items-center justify-center shadow-sm">{lesson.grade}</div>}
                              </div>
                              <div className="ml-4 mt-1">
                                {lesson.hw ? (
                                  <div className="flex items-start bg-blue-50/50 dark:bg-blue-900/30 p-2 rounded border border-blue-100 dark:border-blue-800">
                                    <CheckSquare className="w-3 h-3 text-blue-400 dark:text-blue-300 mt-0.5 mr-1.5 flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{lesson.hw}</span>
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-right-4 w-full">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="p-4 text-sm font-bold text-gray-600 dark:text-gray-300 w-1/4">Fan</th>
                          <th className="p-4 text-sm font-bold text-gray-600 dark:text-gray-300 text-center"></th>
                          <th className="p-4 text-sm font-bold text-gray-600 dark:text-gray-300 text-center w-24">Ballar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quarterGrades.map((q, idx) => (
                          <tr key={q.id} className={`border-b border-gray-100 dark:border-slate-700 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 transition-colors ${idx % 2 !== 0 ? 'bg-slate-50/30 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}`}>
                            <td className="p-4 font-bold text-sm text-blue-900 dark:text-blue-300">{q.subject}</td>
                            <td className="p-4">
                              {q.grades.length === 0 ? (
                                <div className="text-center text-sm font-medium text-gray-400">Qo'yilmagan baholar mavjud emas.</div>
                              ) : (
                                <div className="flex flex-wrap items-center justify-start gap-1">
                                  {q.grades.map((grade, i) => (<div key={i} className="w-6 h-6 bg-[#4caf50] text-white flex items-center justify-center rounded-sm text-xs font-black shadow-sm">{grade}</div>))}
                                  {q.bsb && <div className="px-2 py-0.5 bg-[#43a047] text-white flex items-center justify-center rounded-sm text-xs font-black shadow-sm ml-2 tracking-wide">{q.bsb}</div>}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center font-black text-sm text-blue-600 dark:text-blue-400">{q.total}</td>
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
              <div className="overflow-x-auto p-4 w-full">
                <table className="w-full text-left border-collapse border border-gray-200 dark:border-slate-700 min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                      <th className="p-3 text-center w-24"></th>
                      <th className="p-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-slate-700">Dush, 20 Apr</th>
                      <th className="p-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-slate-700">Sesh, 21 Apr</th>
                      <th className="p-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-slate-700">Chor, 22 Apr</th>
                      <th className="p-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-slate-700">Pay, 23 Apr</th>
                      <th className="p-3 text-center text-sm font-bold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-slate-700">Jum, 24 Apr</th>
                      <th className="p-3 text-center text-sm font-bold text-red-500 dark:text-red-400 border-l border-gray-200 dark:border-slate-700">Shan, 25 Apr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleGrid.map((row, i) => (
                      <tr key={i} className="border-b border-gray-200 dark:border-slate-700">
                        <td className="p-2 border-r border-gray-200 dark:border-slate-700 align-top bg-gray-50/50 dark:bg-slate-900/50">
                          <div className="font-black text-gray-800 dark:text-white text-lg text-center">{row.time.split(' ')[0]}</div>
                          <div className="text-[10px] text-gray-400 font-medium text-center">{row.time.split(' ')[1]}</div>
                        </td>
                        {row.days.map((day, dIdx) => (
                          <td key={dIdx} className="p-2 border-r border-gray-200 dark:border-slate-700 align-top hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors w-1/6">
                            <div className="h-full border border-transparent hover:border-blue-200 dark:hover:border-blue-700 rounded p-1.5 cursor-pointer">
                              <div className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-0.5 leading-tight">{day.subject}</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold leading-tight mb-1 truncate" title={day.teacher}>{day.teacher}</div>
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
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 rounded-2xl p-6 text-white shadow-lg mb-8">
                <h2 className="text-2xl font-black mb-2 flex items-center"><FileText className="w-6 h-6 mr-2" /> Uy vazifalari (Checklist)</h2>
                <p className="text-blue-100 text-sm">O'qituvchi tomonidan berilgan vazifalarni belgilab boring. Hammasini yakunlab, reytingingizni oshiring!</p>
              </div>

              {sortedHomeworks.map((hw) => (
                <div key={hw.id} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 w-full ${hw.completed ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60' : 'bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-600 shadow-sm'}`}>
                  <button onClick={() => toggleHomework(hw.id)} className={`mt-1 flex-shrink-0 transition-colors ${hw.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-500 hover:text-blue-500'}`}>
                    {hw.completed ? <CheckSquare className="w-7 h-7" /> : <Square className="w-7 h-7" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                      <h3 className={`font-bold text-lg ${hw.completed ? 'text-gray-500 dark:text-gray-400 line-through decoration-2' : 'text-blue-900 dark:text-blue-300'}`}>{hw.subject}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit border ${hw.completed ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400' : hw.dueDate.includes('Ertaga') ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                        <Clock className="w-3 h-3 inline mr-1" /> Muddat: {hw.dueDate}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${hw.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{hw.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, Settings, Table, Calendar, Calculator, Building, Crown, LayoutDashboard, CheckCircle2, AlertTriangle, Lock } from "lucide-react";

export default function DirectorDashboard() {
  // DIREKTOR MENYULARI
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");

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

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* ======================================================== */}
      {/* YON PANEL (SIDEBAR) - DIREKTOR UCHUN */}
      {/* ======================================================== */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen flex-shrink-0 z-20 text-slate-300 hidden md:flex">
        
        {/* ELITA Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-purple-600/30">
            E
          </div>
          <span className="text-xl font-black tracking-widest text-white">ELITA <span className="text-xs text-purple-400 align-top">ADMIN</span></span>
        </div>

        {/* Menyular */}
        <div className="p-4 flex flex-col gap-2 mt-2">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'boshqaruv' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> Boshqaruv
          </button>
          <button onClick={() => setActiveMenu("teachers")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'teachers' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Crown className="w-5 h-5 mr-3" /> O'qituvchilar
          </button>
          <button onClick={() => setActiveMenu("students")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'students' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3" /> O'quvchilar & Limit
          </button>
          <button onClick={() => setActiveMenu("timetable")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'timetable' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Calendar className="w-5 h-5 mr-3" /> Dars Jadvali (Set)
          </button>
          <button onClick={() => setActiveMenu("algorithm")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'algorithm' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Calculator className="w-5 h-5 mr-3" /> Moliya & Algoritm
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ASOSIY KONTENT (O'NG TOMON) */}
      {/* ======================================================== */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
          
          {/* TEPADAGI DIREKTOR PROFILI */}
          <div className="w-full bg-gradient-to-br from-slate-900 to-purple-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Shield className="w-32 h-32 text-purple-200" /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-purple-300 text-sm mb-1 uppercase tracking-wider font-bold">Maktab Direktori</p>
                <h1 className="text-3xl font-black mb-2">Boshqaruv Paneli</h1>
                <p className="text-purple-200 font-medium flex items-center bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-md">
                  <Building className="w-4 h-4 mr-2" /> Elita Maktabi
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[120px] text-center border border-white/10">
                  <p className="text-purple-200 text-xs mb-1 font-bold uppercase">Jami O'quvchilar</p>
                  <div className="text-2xl font-black text-white flex items-center justify-center">85 / 96</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[120px] text-center border border-white/10 border-b-4 border-b-amber-400">
                  <p className="text-purple-200 text-xs mb-1 font-bold uppercase">Oylik Byudjet</p>
                  <div className="text-2xl font-black text-amber-400 flex items-center justify-center">100K PP</div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 1. BOSHQARUV (Dashboard) */}
          {/* ======================================================== */}
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
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-8 h-8"/></div>
                <h3 className="font-bold text-lg text-gray-800">Limit Ogohlantirish</h3>
                <p className="text-sm font-medium text-amber-600 mt-2">9-A va 9-C sinflari to'lgan (24/24).</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. O'QITUVCHILAR VA SINF RAHBAR TAYINLASH */}
          {/* ======================================================== */}
          {activeMenu === "teachers" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center"><Crown className="w-6 h-6 mr-2 text-purple-600"/> O'qituvchilarni Boshqarish</h2>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" /> Yangi o'qituvchi
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
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
                          <select 
                            className={`text-sm font-bold p-2 rounded-lg border outline-none ${t.homeroom === 'Biriktirilmagan' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                            defaultValue={t.homeroom}
                          >
                            <option value="Biriktirilmagan">Biriktirilmagan</option>
                            <option value="9-A">9-A</option>
                            <option value="9-B">9-B</option>
                            <option value="9-C">9-C</option>
                            <option value="9-D">9-D</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. O'QUVCHILAR VA SINF LIMITI */}
          {/* ======================================================== */}
          {activeMenu === "students" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center"><Shield className="w-6 h-6 mr-2 text-purple-600"/> Sifat Nazorati (Sinf Limiti)</h2>
                <p className="text-gray-500 text-sm mb-6">Ta'lim sifatini tushirmaslik uchun har bir sinfda maksimal 24 ta o'quvchi bo'lishiga ruxsat berilgan.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map(cls => (
                    <div key={cls.name} className={`p-5 rounded-2xl border ${cls.capacity >= cls.maxLimit ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-black text-gray-800">{cls.name}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${cls.capacity >= cls.maxLimit ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                          {cls.status}
                        </span>
                      </div>
                      
                      <div className="w-full bg-white rounded-full h-3 mb-2 overflow-hidden border border-gray-200">
                        <div className={`h-3 rounded-full ${cls.capacity >= cls.maxLimit ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(cls.capacity / cls.maxLimit) * 100}%` }}></div>
                      </div>
                      <p className="text-sm font-bold text-gray-600 text-right">{cls.capacity} / {cls.maxLimit}</p>

                      <button disabled={cls.capacity >= cls.maxLimit} className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${cls.capacity >= cls.maxLimit ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white shadow-sm'}`}>
                        + O'quvchi qo'shish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. DARS JADVALINI TUZISH */}
          {/* ======================================================== */}
          {activeMenu === "timetable" && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-10 text-center flex flex-col items-center">
                <Table className="w-16 h-16 text-purple-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Maktab Dars Jadvali Konstruktori</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">Bu bo'limda direktor har bir sinf uchun dars jadvalini shakllantiradi va o'qituvchilarni biriktiradi.</p>
                <button className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30">
                  Konstruktorni ochish
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. MOLIYA VA ALGORITM (Eng muhim qism!) */}
          {/* ======================================================== */}
          {activeMenu === "algorithm" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <Lock className="absolute top-6 right-6 w-24 h-24 text-white/5" />
                <h2 className="text-2xl font-black mb-2 flex items-center"><Calculator className="w-6 h-6 mr-2 text-amber-400"/> ELITA Algoritmi (Smart Contract)</h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                  Maktabning oylik byudjeti ushbu o'zgarmas algoritm orqali avtomatik taqsimlanadi. Bunga direktor ham, o'qituvchi ham aralasha olmaydi. Bu korrupsiyaning oldini oladi va adolatli raqobatni shakllantiradi.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1-Bosqich */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 font-black rounded-full flex items-center justify-center mb-4 border border-amber-200">1</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Sinflar bo'yicha taqsimot</h3>
                  <p className="text-sm text-gray-500 mb-4">Umumiy byudjet (100,000 PP) sinflarning CP reytingiga qarab kesiladi:</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-gray-700">1-o'rin (9-B)</span>
                      <span className="font-black text-amber-500">40% <span className="text-gray-400 text-sm font-medium ml-1">(40,000 PP)</span></span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-gray-700">2-o'rin (9-A)</span>
                      <span className="font-black text-amber-500">30% <span className="text-gray-400 text-sm font-medium ml-1">(30,000 PP)</span></span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-gray-700">3-o'rin (9-C)</span>
                      <span className="font-black text-amber-500">20% <span className="text-gray-400 text-sm font-medium ml-1">(20,000 PP)</span></span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-gray-700">4-o'rin (9-D)</span>
                      <span className="font-black text-amber-500">10% <span className="text-gray-400 text-sm font-medium ml-1">(10,000 PP)</span></span>
                    </div>
                  </div>
                </div>

                {/* 2-Bosqich */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 font-black rounded-full flex items-center justify-center mb-4 border border-purple-200">2</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">O'quvchilar o'rtasida taqsimot</h3>
                  <p className="text-sm text-gray-500 mb-4">Har bir sinf byudjeti shu sinf o'quvchilariga ularning <strong>o'rtacha bahosi</strong> ga mutanosib (ko'paytirilgan) ravishda avtomatik bo'linadi.</p>
                  
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mt-6">
                    <h4 className="font-bold text-purple-900 mb-2 text-sm">Matematik Formula:</h4>
                    <code className="text-xs bg-white p-2 rounded-lg text-purple-700 block font-mono border border-purple-200 font-bold">
                      Ulush = (O'quvchi Bahosi / Sinfdagi Jami Baholar) * Sinf Byudjeti
                    </code>
                    <p className="text-xs text-purple-600 mt-3 font-medium">Natija: 10 bahoga o'qigan o'quvchi, 5 bahoga o'qigandan ko'ra aniq 2 barobar ko'p PP oladi. Byudjet to'liq yopiladi va byurokratiya nolga tushadi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

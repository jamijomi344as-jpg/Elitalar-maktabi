"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Table, Calendar, Calculator, Building, Crown, LayoutDashboard, CheckCircle2, X, PlusCircle, School, Key } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

export default function DirectorDashboard() {
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "teachers" | "students" | "timetable" | "algorithm">("boshqaruv");

  // Modallar
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bazadan keladigan ma'lumotlar
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentsCountByClass, setStudentsCountByClass] = useState<any>({});
  
  // Yangi formalar
  const [newPerson, setNewPerson] = useState({ fullName: "", subject: "", gender: "", className: "", homeroom: "" });
  const [newClassInfo, setNewClassInfo] = useState({ name: "", limit: 24 });

  const subjectsBase = ["Algebra", "Geometriya", "Ona tili", "Adabiyot", "Ingliz tili", "Kimyo", "Biologiya", "Fizika", "Informatika"];

  // ==========================================
  // O'QISH
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: teachersData } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('created_at', { ascending: false });
      setTeachers(teachersData || []);

      const { data: classesData } = await supabase.from('classes').select('*').order('name');
      setClasses(classesData || []);

      const { data: studentsData } = await supabase.from('profiles').select('class_name').eq('role', 'student');
      const counts: any = {};
      classesData?.forEach(c => counts[c.name] = 0);
      studentsData?.forEach(student => {
        if(student.class_name) counts[student.class_name] = (counts[student.class_name] || 0) + 1;
      });
      setStudentsCountByClass(counts);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // TASODIFIY PAROL YARATUVCHI FUNKSIYA (6 ta harf-raqam)
  const generatePassword = () => Math.random().toString(36).slice(-6).toUpperCase();

  // ==========================================
  // YOZISH
  // ==========================================
  const handleAddClass = async () => {
    if(!newClassInfo.name) return alert("Sinf nomini yozing!");
    if(classes.some(c => c.name === newClassInfo.name.toUpperCase())) return alert("Bu sinf mavjud!");

    const { error } = await supabase.from('classes').insert([{ name: newClassInfo.name.toUpperCase(), max_limit: newClassInfo.limit }]);
    if (error) alert("Xatolik: " + error.message);
    else { setShowClassModal(false); setNewClassInfo({ name: "", limit: 24 }); fetchData(); }
  };

  const handleAddTeacher = async () => {
    if(!newPerson.fullName || !newPerson.subject) return alert("F.I.SH va Fanni to'ldiring!");
    
    const uniqueId = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword(); // O'qituvchiga parol yasaldi
    const assignedHomeroom = newPerson.homeroom === "" ? null : newPerson.homeroom;

    const { error } = await supabase.from('profiles').insert([{ 
      id: uniqueId, 
      role: 'teacher', 
      full_name: newPerson.fullName, 
      bio: newPerson.subject,
      password: pass,
      homeroom: assignedHomeroom
    }]);

    if (error) alert("Xatolik: " + error.message);
    else { setShowTeacherModal(false); setNewPerson({ fullName: "", subject: "", gender: "", className: "", homeroom: "" }); fetchData(); }
  };

  const handleAddStudent = async () => {
    if(!newPerson.fullName || !newPerson.className) return alert("Hamma joyni to'ldiring!");
    
    const limit = classes.find(c => c.name === newPerson.className)?.max_limit || 24;
    const currentCount = studentsCountByClass[newPerson.className] || 0;
    if(currentCount >= limit) return alert("Sinfda joy qolmagan!");

    const uniqueId = `S-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = generatePassword(); // O'quvchiga parol yasaldi

    const { error } = await supabase.from('profiles').insert([{ 
      id: uniqueId, 
      role: 'student', 
      full_name: newPerson.fullName, 
      class_name: newPerson.className,
      password: pass 
    }]);

    if (error) alert("Xatolik: " + error.message);
    else { setShowStudentModal(false); setNewPerson({ fullName: "", subject: "", gender: "", className: "", homeroom: "" }); fetchData(); }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* YON PANEL */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen flex-shrink-0 z-20 text-slate-300 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg shadow-purple-600/30">E</div>
          <span className="text-xl font-black tracking-widest text-white">ELITA <span className="text-xs text-purple-400 align-top">ADMIN</span></span>
        </div>
        <div className="p-4 flex flex-col gap-2 mt-2 flex-1">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'boshqaruv' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Boshqaruv</button>
          <button onClick={() => setActiveMenu("teachers")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'teachers' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><Crown className="w-5 h-5 mr-3" /> O'qituvchilar</button>
          <button onClick={() => setActiveMenu("students")} className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all ${activeMenu === 'students' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><Users className="w-5 h-5 mr-3" /> O'quvchilar & Limit</button>
        </div>
      </div>

      {/* ASOSIY KONTENT */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
          
          <div className="w-full bg-gradient-to-br from-slate-900 to-purple-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Shield className="w-32 h-32 text-purple-200" /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <p className="text-purple-300 text-sm mb-1 uppercase tracking-wider font-bold">Maktab Direktori Paneli</p>
                <h1 className="text-3xl font-black mb-2">Salom, Director 👋</h1>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20 text-purple-600 font-bold animate-pulse">Yuklanmoqda...</div>
          ) : (
            <>
              {/* O'QITUVCHILAR */}
              {activeMenu === "teachers" && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center"><Crown className="w-6 h-6 mr-2 text-purple-600"/> O'qituvchilar Ro'yxati</h2>
                    <button onClick={() => setShowTeacherModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" /> Yangi o'qituvchi
                    </button>
                  </div>
                  <div className="overflow-x-auto p-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="p-4 text-sm font-bold text-gray-500">ID Raqam</th>
                          <th className="p-4 text-sm font-bold text-gray-500">Parol (Kod)</th>
                          <th className="p-4 text-sm font-bold text-gray-500">F.I.SH</th>
                          <th className="p-4 text-sm font-bold text-gray-500">Fani</th>
                          <th className="p-4 text-sm font-bold text-gray-500">Sinf Rahbarligi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.length === 0 ? (
                          <tr><td colSpan={5} className="text-center p-8 text-gray-400">Hali o'qituvchi qo'shilmagan.</td></tr>
                        ) : (
                          teachers.map(t => (
                            <tr key={t.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                              <td className="p-4 text-sm font-black text-purple-600">{t.id}</td>
                              <td className="p-4 text-sm font-mono font-bold text-amber-600 flex items-center"><Key className="w-3 h-3 mr-1"/> {t.password || "yo'q"}</td>
                              <td className="p-4 text-sm font-bold text-gray-900">{t.full_name}</td>
                              <td className="p-4 text-sm text-gray-600">{t.bio}</td>
                              <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${t.homeroom ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{t.homeroom || "Biriktirilmagan"}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* O'QUVCHILAR & LIMIT */}
              {activeMenu === "students" && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center"><Shield className="w-6 h-6 mr-2 text-purple-600"/> Sifat Nazorati (Sinflar)</h2>
                    </div>
                    <button onClick={() => setShowClassModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center">
                      <School className="w-4 h-4 mr-2" /> Yangi Sinf Ochish
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classes.map(cls => {
                        const count = studentsCountByClass[cls.name] || 0;
                        const limit = cls.max_limit;
                        const isFull = count >= limit;

                        return (
                          <div key={cls.name} className={`p-5 rounded-2xl border transition-colors ${isFull ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="text-2xl font-black text-gray-800">{cls.name}</h3>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 mb-2 overflow-hidden border border-gray-200 relative">
                              <div className={`h-3 rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${(count / limit) * 100}%` }}></div>
                            </div>
                            <p className="text-sm font-bold text-gray-600 text-right">{count} / {limit}</p>
                            <button onClick={() => { setNewPerson({...newPerson, className: cls.name}); setShowStudentModal(true); }} disabled={isFull} className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all ${isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white shadow-sm'}`}>
                              + {isFull ? "Limit To'lgan" : "O'quvchi qo'shish"}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
              {/* Boshqa menyular qisqartirildi... */}
            </>
          )}
        </div>
      </div>

      {/* O'QITUVCHI MODALI (Sinf rahbarligi qo'shildi) */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTeacherModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><UserPlus className="w-5 h-5 mr-2 text-purple-600"/> Yangi O'qituvchi</h3>
                <button onClick={() => setShowTeacherModal(false)} className="text-gray-400"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <input type="text" value={newPerson.fullName} onChange={e => setNewPerson({...newPerson, fullName: e.target.value})} placeholder="F.I.SH (Masalan: Alimov B.)" className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none font-medium" />
                <select value={newPerson.subject} onChange={e => setNewPerson({...newPerson, subject: e.target.value})} className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none font-medium text-gray-700">
                   <option value="">O'tadigan Fanini tanlang</option>
                   {subjectsBase.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
                {/* SINF RAHBARLIGI TANLASH */}
                <select value={newPerson.homeroom} onChange={e => setNewPerson({...newPerson, homeroom: e.target.value})} className="w-full p-4 bg-blue-50 border border-blue-100 rounded-xl outline-none font-bold text-blue-800">
                   <option value="">Sinf rahbarligi (Yo'q bo'lsa tanlamang)</option>
                   {classes.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                </select>
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={handleAddTeacher} className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700">Bazaga Saqlash</button>
             </div>
          </div>
        </div>
      )}

      {/* SINF VA O'QUVCHI MODALLARI... (Qisqartirildi, asosiy logika bir xil) */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowClassModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                <h3 className="font-bold text-lg text-blue-900 flex items-center"><School className="w-5 h-5 mr-2 text-blue-600"/> Yangi Sinf</h3>
                <button onClick={() => setShowClassModal(false)} className="text-gray-400"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <input type="text" value={newClassInfo.name} onChange={e => setNewClassInfo({...newClassInfo, name: e.target.value})} placeholder="Sinf Nomi (Masalan: 9-A)" className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none font-bold uppercase" />
             </div>
             <div className="p-4 border-t border-gray-100 flex justify-end bg-slate-50">
                <button onClick={handleAddClass} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md">Yaratish</button>
             </div>
          </div>
        </div>
      )}
      
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStudentModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-emerald-600"/> Yangi O'quvchi ({newPerson.className})</h3>
                <button onClick={() => setShowStudentModal(false)} className="text-gray-400"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 space-y-4">
                <input type="text" value={newPerson.fullName} onChange={e => setNewPerson({...newPerson, fullName: e.target.value})} placeholder="O'quvchining F.I.SH" className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl outline-none font-medium" />
             </div>
             <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50">
                <button onClick={handleAddStudent} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md">Maktabga Qo'shish</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, MessageCircle, Wallet, BookOpen, Trophy, Settings, LogOut, 
  BellRing, TrendingUp, User, GraduationCap, Award, FileText, CheckCircle2, 
  Circle, Clock, Send, AlertCircle, X, ShieldCheck, EyeOff, Eye, Search, Edit, 
  MoreVertical, BellOff, Trash2, Ban, ArrowRight, ArrowDownLeft, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<"asosiy" | "messenger" | "hamyon" | "talim" | "reyting" | "settings">("asosiy");
  const [talimTab, setTalimTab] = useState<"kundalik" | "jadval" | "vazifa">("vazifa");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // MA'LUMOTLAR
  const [notifications, setNotifications] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [classmates, setClassmates] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);

  // HAMYON (PP) O'TKAZMA
  const [transferForm, setTransferForm] = useState({ receiverId: "", amount: "" });
  const [isTransferring, setIsTransferring] = useState(false);

  // MUROJAAT (FEEDBACK)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ message: "", isAnonymous: false });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  // ==========================================
  // LOGIN & LOAD DATA
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', loginForm.id).eq('password', loginForm.password).eq('role', 'student').single();
    if (data) setStudent(data); else alert("ID yoki Parol xato!");
    setIsLoading(false);
  };

  useEffect(() => { if (student) loadAllData(); }, [student]);

  const loadAllData = async () => {
    // Profilni yangilash
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', student.id).single();
    if(profile) setStudent(profile);

    // Bildirishnomalar
    const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', student.id).order('created_at', { ascending: false });
    setNotifications(notifs || []);

    // Uy vazifalari
    const { data: hw } = await supabase.from('homeworks').select('*').eq('class_name', student.class_name).order('created_at', { ascending: false });
    setHomeworks(hw || []);

    // Bajarilgan vazifalar
    const { data: cTasks } = await supabase.from('completed_tasks').select('homework_id').eq('student_id', student.id);
    if(cTasks) setCompletedTasks(cTasks.map(t => t.homework_id));

    // Sinfdoshlar (Reyting uchun)
    const { data: cmates } = await supabase.from('profiles').select('*').eq('role', 'student').eq('class_name', student.class_name);
    setClassmates(cmates || []);

    // Barcha sinflar (Maktab reytingi uchun)
    const { data: cls } = await supabase.from('classes').select('*');
    setAllClasses(cls || []);

    // Tranzaksiyalar (Tarix)
    const { data: trx } = await supabase.from('transactions').select('*').or(`sender_id.eq.${student.id},receiver_id.eq.${student.id}`).order('created_at', { ascending: false });
    setTransactions(trx || []);

    // Dars jadvali
    const { data: time } = await supabase.from('timetable').select('*').eq('class_name', student.class_name);
    setTimetable(time || []);
  };

  // ==========================================
  // HARAKATLAR
  // ==========================================
  const toggleTask = async (hwId: string) => {
    if (completedTasks.includes(hwId)) {
      await supabase.from('completed_tasks').delete().eq('student_id', student.id).eq('homework_id', hwId);
      setCompletedTasks(completedTasks.filter(id => id !== hwId));
    } else {
      await supabase.from('completed_tasks').insert([{ student_id: student.id, homework_id: hwId }]);
      setCompletedTasks([...completedTasks, hwId]);
    }
  };

  const handleTransfer = async () => {
    const amount = parseInt(transferForm.amount);
    if (!transferForm.receiverId || isNaN(amount) || amount <= 0) return alert("Ma'lumotlarni to'g'ri kiriting!");
    if (amount > (student.pp_balance || 0)) return alert("Balansingizda yetarli PP yo'q!");
    if (transferForm.receiverId.toUpperCase() === student.id) return alert("O'zingizga PP o'tkaza olmaysiz!");

    setIsTransferring(true);
    
    // Qabul qiluvchini topish
    const { data: receiver } = await supabase.from('profiles').select('*').eq('id', transferForm.receiverId.toUpperCase()).single();
    if (!receiver) { setIsTransferring(false); return alert("Bunday ID raqamli foydalanuvchi topilmadi!"); }

    // Balanslarni yangilash
    const myNewBalance = (student.pp_balance || 0) - amount;
    const receiverNewBalance = (receiver.pp_balance || 0) + amount;

    await supabase.from('profiles').update({ pp_balance: myNewBalance }).eq('id', student.id);
    await supabase.from('profiles').update({ pp_balance: receiverNewBalance }).eq('id', receiver.id);

    // Tarixga yozish
    await supabase.from('transactions').insert([{ sender_id: student.id, receiver_id: receiver.id, amount }]);

    alert("O'tkazma muvaffaqiyatli bajarildi!");
    setTransferForm({ receiverId: "", amount: "" });
    loadAllData();
    setIsTransferring(false);
  };

  const handleSendFeedback = async () => {
    if (!feedbackForm.message) return alert("Xabar yozing!");
    setIsSendingFeedback(true);
    await supabase.from('feedbacks').insert([{ sender_id: student.id, sender_name: student.full_name, message: feedbackForm.message, is_anonymous: feedbackForm.isAnonymous }]);
    alert("Murojaatingiz yuborildi!"); setShowFeedbackModal(false); setFeedbackForm({ message: "", isAnonymous: false });
    setIsSendingFeedback(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 4) return alert("Parol qisqa!");
    setIsChanging(true);
    await supabase.from('profiles').update({ password: newPassword }).eq('id', student.id);
    alert("Parol yangilandi!"); setStudent({ ...student, password: newPassword }); setNewPassword(""); 
    setIsChanging(false);
  };

  // ==========================================
  // REYTING HISOBLARI
  // ==========================================
  const sortedClassmates = [...classmates].sort((a,b) => (b.cp_score || 0) - (a.cp_score || 0));
  const myRankInClass = sortedClassmates.findIndex(c => c.id === student?.id) + 1;
  const cpNeededForNext = myRankInClass > 1 ? (sortedClassmates[myRankInClass-2].cp_score - (student?.cp_score || 0) + 1) : 0;

  const sortedClasses = [...allClasses].sort((a,b) => (b.total_cp || 0) - (a.total_cp || 0));
  const myClassRank = sortedClasses.findIndex(c => c.name === student?.class_name) + 1;

  // LOGIN EKRANI
  if (!student) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e1621] font-sans p-6">
        <div className="bg-[#17212b] p-10 rounded-[3rem] shadow-2xl w-full max-w-md border border-slate-800 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-10 h-10"/></div>
          <h2 className="text-3xl font-black text-center mb-2 text-white">O'QUVCHI KIRISH</h2>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input type="text" placeholder="ID (S-XXXX)" className="w-full p-5 bg-[#0e1621] text-white rounded-2xl outline-none font-black text-center uppercase border border-slate-700 focus:border-blue-500" onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toUpperCase()})} />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Maxfiy Parol" className="w-full p-5 bg-[#0e1621] text-white rounded-2xl outline-none font-black text-center uppercase border border-slate-700 focus:border-blue-500" onChange={(e) => setLoginForm({...loginForm, password: e.target.value.toUpperCase()})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500">{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
            </div>
            <button disabled={isLoading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all">{isLoading ? "KIRILMOQDA..." : "KIRISH"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0e1621] font-sans overflow-hidden text-slate-200">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0e1621] border-r border-slate-800/50 flex flex-col h-screen flex-shrink-0 z-20 hidden md:flex p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-[10px] flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">E</div>
          <span className="text-2xl font-black text-white tracking-widest uppercase">ELITA</span>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2">
          <button onClick={() => setActiveMenu("asosiy")} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeMenu === 'asosiy' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy</button>
          <button onClick={() => setActiveMenu("messenger")} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeMenu === 'messenger' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><MessageCircle className="w-5 h-5 mr-3" /> Messenger</button>
          <button onClick={() => setActiveMenu("hamyon")} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeMenu === 'hamyon' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><Wallet className="w-5 h-5 mr-3" /> Hamyon (PP)</button>
          <button onClick={() => setActiveMenu("talim")} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeMenu === 'talim' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><BookOpen className="w-5 h-5 mr-3" /> Ta'lim</button>
          <button onClick={() => setActiveMenu("reyting")} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeMenu === 'reyting' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><Trophy className="w-5 h-5 mr-3" /> Reyting</button>
        </nav>
        <div className="pt-4 border-t border-slate-800/50 space-y-2">
           <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeMenu === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><Settings className="w-5 h-5 mr-3" /> Sozlamalar</button>
           <button onClick={() => setStudent(null)} className="w-full flex items-center px-4 py-3.5 rounded-xl text-red-400 font-bold hover:bg-red-500/10 text-sm"><LogOut className="w-5 h-5 mr-3" /> Chiqish</button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto bg-[#0e1621] relative pb-24">
        
        {/* HEADER (ALWAYS VISIBLE) */}
        <header className="sticky top-0 z-30 bg-[#0e1621]/90 backdrop-blur-md border-b border-slate-800/50 p-4 md:px-8 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <button className="md:hidden text-slate-400 hover:text-white"><LayoutDashboard/></button>
             <h2 className="font-bold text-white text-lg hidden sm:block">O'quvchi Paneli</h2>
           </div>
           <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white relative">
                 <BellRing className="w-5 h-5"/>
                 {notifications.filter(n=>!n.is_read).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white">{student.full_name.charAt(0)}</div>
           </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          
          {/* USER INFO CARD */}
          <div className="bg-[#17212b] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800/50 shadow-sm">
             <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">O'quvchi Paneli</p>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">{student.full_name}</h1>
                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-lg w-fit">
                   <GraduationCap className="w-4 h-4 text-slate-400 mr-2"/>
                   <span className="text-slate-300 text-sm font-medium">Sinf: {student.class_name}</span>
                </div>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
                <div className="flex-1 md:flex-none border border-slate-700/50 bg-slate-800/30 rounded-2xl p-4 text-center min-w-[120px]">
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Balans (PP)</p>
                   <div className="text-2xl font-black text-amber-400 flex items-center justify-center"><Award className="w-5 h-5 mr-1.5"/> {student.pp_balance || 0}</div>
                </div>
                <div className="flex-1 md:flex-none border border-slate-700/50 bg-slate-800/30 rounded-2xl p-4 text-center min-w-[120px]">
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Reyting (CP)</p>
                   <div className="text-2xl font-black text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-1.5"/> {student.cp_score || 0}</div>
                </div>
             </div>
          </div>

          {/* ASOSIY (DASHBOARD) */}
          {activeMenu === "asosiy" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#17212b] rounded-3xl p-6 border border-slate-800/50">
                 <h3 className="flex items-center text-blue-400 font-bold mb-4"><BellRing className="w-5 h-5 mr-2"/> Muhim E'lonlar</h3>
                 <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase rounded mb-2 inline-block">Bugun, 09:00</span>
                    <h4 className="text-white font-bold text-lg mb-1">Maktab do'koni yaqinda ochiladi!</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Yig'ilgan PP ballaringiz evaziga qimmatbaho sovg'alar va xizmatlarni xarid qilishingiz mumkin bo'ladi.</p>
                 </div>
                 
                 <div className="mt-4 space-y-3">
                   {notifications.slice(0,3).map(notif => (
                     <div key={notif.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4">
                        <h4 className="text-slate-200 font-bold text-sm mb-1">{notif.title}</h4>
                        <p className="text-slate-400 text-xs">{notif.message}</p>
                     </div>
                   ))}
                 </div>
              </div>
              
              <div className="bg-[#0f8b65] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center">
                 <TrendingUp className="absolute -right-6 -bottom-6 w-40 h-40 text-black/10"/>
                 <h3 className="flex items-center text-emerald-100 font-bold mb-2 relative z-10"><TrendingUp className="w-5 h-5 mr-2"/> O'zlashtirish</h3>
                 <p className="text-emerald-200 text-xs mb-4 relative z-10">Sinfdagi umumiy o'rningiz (Top 3)</p>
                 <div className="text-5xl font-black text-white relative z-10 mb-2">{myRankInClass}-o'rin</div>
                 {cpNeededForNext > 0 ? (
                   <p className="text-emerald-200 text-sm relative z-10 font-medium">{myRankInClass - 1}-o'ringa chiqish uchun yana <b className="text-white">{cpNeededForNext} CP</b> kerak.</p>
                 ) : (
                   <p className="text-emerald-200 text-sm relative z-10 font-medium">Siz sinfda peshqadamsiz! 🔥</p>
                 )}
              </div>
            </div>
          )}

          {/* REYTING */}
          {activeMenu === "reyting" && (
            <div className="space-y-6">
              {/* MAKTAB REYTINGI */}
              <div className="bg-[#0f8b65] rounded-3xl p-8 relative overflow-hidden">
                <Trophy className="absolute -right-10 -bottom-10 w-64 h-64 text-black/10"/>
                <div className="relative z-10">
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center"><Trophy className="w-4 h-4 mr-2"/> Maktab Reytingi (9-sinflar)</p>
                  <h2 className="text-3xl font-black text-white mb-6">Sinfingiz hozir {myClassRank}-o'rinda! 🎉</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sortedClasses.slice(0,4).map((cls, i) => (
                      <div key={cls.name} className={`rounded-2xl p-4 text-center border transition-all ${i===0 ? 'bg-white text-[#0f8b65] border-white shadow-xl scale-105' : 'bg-black/10 text-white border-white/20'}`}>
                         <h4 className="font-black text-xl mb-1">#{i+1} {cls.name}</h4>
                         <p className={`text-sm font-bold ${i===0 ? 'text-emerald-600' : 'text-emerald-200'}`}>{cls.total_cp || 0} CP</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SINF O'QUVCHILARI */}
              <div className="bg-[#17212b] border border-slate-800/50 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-white font-bold flex items-center"><Trophy className="w-5 h-5 mr-2 text-blue-500"/> {student.class_name} O'quvchilari Reytingi</h3>
                </div>
                <div className="space-y-2">
                   {sortedClassmates.map((mate, i) => (
                     <div key={mate.id} className={`flex items-center justify-between p-4 rounded-2xl border ${mate.id === student.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-800/20 border-slate-700/30'}`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i===0?'bg-amber-500 text-white':i===1?'bg-slate-300 text-slate-800':i===2?'bg-amber-700 text-white':'bg-slate-800 text-slate-400'}`}>{i+1}</div>
                           <p className={`font-bold ${mate.id === student.id ? 'text-blue-400' : 'text-slate-200'}`}>{mate.full_name}</p>
                        </div>
                        <div className="font-black text-emerald-400">{mate.cp_score || 0} CP</div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* HAMYON (PP) */}
          {activeMenu === "hamyon" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-[#17212b] border border-slate-800/50 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Send className="w-5 h-5 mr-3 text-blue-500"/> O'tkazma qilish</h3>
                  <div className="space-y-5">
                     <div>
                       <label className="text-slate-400 text-sm font-medium mb-2 block">Qabul qiluvchining ID raqami</label>
                       <input type="text" value={transferForm.receiverId} onChange={e=>setTransferForm({...transferForm, receiverId: e.target.value})} placeholder="MASALAN: S-8393" className="w-full bg-[#0e1621] border border-slate-700 rounded-xl p-4 text-white font-mono uppercase focus:border-blue-500 outline-none" />
                     </div>
                     <div>
                       <label className="text-slate-400 text-sm font-medium mb-2 block">O'tkaziladigan summa (PP)</label>
                       <input type="number" value={transferForm.amount} onChange={e=>setTransferForm({...transferForm, amount: e.target.value})} placeholder="0" className="w-full bg-[#0e1621] border border-slate-700 rounded-xl p-4 text-white font-black text-lg focus:border-blue-500 outline-none" />
                     </div>
                     <button onClick={handleTransfer} disabled={isTransferring} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-4">
                        {isTransferring ? "BAJARILMOQDA..." : "Davom etish ➔"}
                     </button>
                  </div>
               </div>

               <div className="bg-[#17212b] border border-slate-800/50 rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center"><Clock className="w-5 h-5 mr-3 text-slate-400"/> Tarix</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     {transactions.length === 0 ? (
                       <p className="text-slate-500 text-center py-10">O'tkazmalar tarixi bo'sh</p>
                     ) : (
                       transactions.map(trx => {
                         const isSent = trx.sender_id === student.id;
                         return (
                           <div key={trx.id} className="flex items-center justify-between bg-[#0e1621] border border-slate-800 p-4 rounded-2xl">
                             <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                 {isSent ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownLeft className="w-5 h-5"/>}
                               </div>
                               <div>
                                 <p className="text-white font-bold text-sm">{isSent ? `O'quvchi: ${trx.receiver_id}` : `Qabul qilindi: ${trx.sender_id}`}</p>
                                 <p className="text-slate-500 text-xs mt-0.5">{new Date(trx.created_at).toLocaleDateString('uz-UZ')}</p>
                               </div>
                             </div>
                             <div className={`font-black ${isSent ? 'text-red-400' : 'text-emerald-400'}`}>
                               {isSent ? '-' : '+'}{trx.amount}
                             </div>
                           </div>
                         )
                       })
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* TA'LIM (TABS) */}
          {activeMenu === "talim" && (
            <div className="bg-[#17212b] border border-slate-800/50 rounded-[2.5rem] p-6 md:p-8">
               
               <div className="flex gap-2 mb-8 bg-[#0e1621] p-1.5 rounded-xl w-fit border border-slate-800">
                 <button onClick={() => setTalimTab('kundalik')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${talimTab === 'kundalik' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Kundalik</button>
                 <button onClick={() => setTalimTab('jadval')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${talimTab === 'jadval' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Dars jadvali</button>
                 <button onClick={() => setTalimTab('vazifa')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${talimTab === 'vazifa' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Uy vazifasi</button>
               </div>

               {/* KUNDALIK TAB */}
               {talimTab === 'kundalik' && (
                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-white font-bold text-lg">{student.full_name}</h3>
                     <div className="flex gap-2 bg-[#0e1621] p-1 rounded-lg">
                        <button className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-md">Joriy</button>
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-sm">Choraklar bo'yicha</button>
                     </div>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
                             <th className="pb-4 font-bold">Fan</th><th className="pb-4 font-bold text-right">Ballar</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                           <tr className="border-b border-slate-800 hover:bg-slate-800/20">
                             <td className="py-4 font-bold text-slate-300">Adabiyot</td><td className="py-4 text-right text-slate-500 italic">Qo'yilmagan baholar mavjud emas.</td>
                           </tr>
                           <tr className="border-b border-slate-800 hover:bg-slate-800/20">
                             <td className="py-4 font-bold text-slate-300">Algebra</td>
                             <td className="py-4 text-right flex justify-end gap-1">
                                {[8,9,10,10,9,10,8].map((g,i) => <div key={i} className="w-6 h-6 bg-[#0f8b65] text-white rounded-[4px] flex items-center justify-center font-bold text-[10px]">{g}</div>)}
                             </td>
                           </tr>
                           <tr className="border-b border-slate-800 hover:bg-slate-800/20">
                             <td className="py-4 font-bold text-slate-300">Geometriya</td>
                             <td className="py-4 text-right flex justify-end gap-1">
                                {[7,8,9].map((g,i) => <div key={i} className="w-6 h-6 bg-[#0f8b65] text-white rounded-[4px] flex items-center justify-center font-bold text-[10px]">{g}</div>)}
                             </td>
                           </tr>
                        </tbody>
                     </table>
                   </div>
                 </div>
               )}

               {/* JADVAL TAB */}
               {talimTab === 'jadval' && (
                 <div>
                    <h3 className="text-white font-bold text-lg mb-4">Sinf Dars Jadvali</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {["Du", "Se", "Ch", "Pa", "Ju", "Sh"].map(day => {
                        const dayLessons = timetable.filter(t => t.day_of_week === day).sort((a,b)=>a.lesson_number - b.lesson_number);
                        if(dayLessons.length === 0) return null;
                        return (
                          <div key={day} className="bg-[#0e1621] border border-slate-800 rounded-2xl p-5">
                             <h4 className="text-blue-400 font-black uppercase mb-3 border-b border-slate-800 pb-2">{day}shanba</h4>
                             <div className="space-y-2">
                               {dayLessons.map(l => (
                                 <div key={l.id} className="flex gap-3 text-sm">
                                   <span className="text-slate-500 font-bold">{l.lesson_number}.</span>
                                   <span className="text-slate-200 font-medium">{l.subject}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                        )
                      })}
                    </div>
                 </div>
               )}

               {/* VAZIFA TAB (CHECKLIST) */}
               {talimTab === 'vazifa' && (
                 <div>
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 mb-6">
                       <h3 className="text-blue-400 font-black text-lg flex items-center mb-1"><FileText className="w-5 h-5 mr-2"/> Uy vazifalari (Checklist)</h3>
                       <p className="text-blue-200/70 text-sm">O'qituvchi tomonidan berilgan vazifalarni belgilab boring. Hammasini yakunlab, reytingingizni oshiring!</p>
                    </div>
                    
                    <div className="space-y-3">
                      {homeworks.length === 0 ? (
                        <p className="text-slate-500 text-center py-10">Hozircha vazifalar yo'q</p>
                      ) : (
                        homeworks.map(hw => {
                          const isDone = completedTasks.includes(hw.id);
                          return (
                            <div key={hw.id} className={`p-5 rounded-2xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#0e1621] border-slate-700'}`}>
                              <div className="flex items-start gap-4">
                                <button onClick={() => toggleTask(hw.id)} className={`mt-1 transition-colors ${isDone ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}>
                                  {isDone ? <CheckCircle2 className="w-6 h-6"/> : <Circle className="w-6 h-6"/>}
                                </button>
                                <div className={isDone ? 'opacity-50' : ''}>
                                  <h3 className={`font-bold text-lg mb-1 ${isDone ? 'text-emerald-400 line-through' : 'text-blue-400'}`}>{hw.subject}</h3>
                                  <p className="text-slate-300 text-sm">{hw.description}</p>
                                </div>
                              </div>
                              <div className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border ${isDone ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                <Clock className="w-4 h-4 mr-1.5"/> Muddat: {hw.deadline}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* SOZLAMALAR */}
          {activeMenu === "settings" && (
            <div className="max-w-xl bg-[#17212b] p-10 rounded-[3rem] shadow-sm border border-slate-800/50 mx-auto mt-10">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6"><Settings className="w-8 h-8"/></div>
              <h2 className="text-3xl font-black text-white mb-2">Sozlamalar</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">Shaxsiy parolingizni o'zgartiring</p>
              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yangi parol yozing..." className="w-full p-5 bg-[#0e1621] border border-slate-700 focus:border-blue-500 rounded-2xl mb-6 font-black text-lg outline-none text-center text-white placeholder-slate-600" />
              <button onClick={handleChangePassword} disabled={isChanging} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center text-lg disabled:opacity-50">{isChanging ? "SAQLANMOQDA..." : "PAROLNI SAQLASH"}</button>
            </div>
          )}

        </div>
      </main>

      {/* FLOAT MUROJAAT TUGMASI (O'QUVCHI UCHUN) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setShowFeedbackModal(true)} className="bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-2xl hover:bg-blue-500 flex items-center gap-2 transition-all hover:scale-105">
           <MessageSquare className="w-5 h-5"/> Murojaat yo'llash
        </button>
      </div>

      {/* MUROJAAT MODALI */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
           <div className="bg-[#17212b] rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-800" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-[#0e1621] flex justify-between items-center border-b border-slate-800">
                 <h3 className="text-xl font-black text-white flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-blue-500"/> Murojaat yo'llash</h3>
                 <button onClick={() => setShowFeedbackModal(false)} className="text-slate-500 hover:text-white"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <textarea rows={4} placeholder="Fikringizni yozing..." className="w-full p-4 bg-[#0e1621] border border-slate-800 focus:border-blue-500 rounded-2xl font-medium outline-none resize-none text-white placeholder-slate-600" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})}></textarea>
                 <label className="flex items-center gap-3 p-4 bg-[#0e1621] rounded-2xl cursor-pointer border border-slate-800 hover:border-slate-700 transition-colors">
                   <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={feedbackForm.isAnonymous} onChange={e => setFeedbackForm({...feedbackForm, isAnonymous: e.target.checked})} />
                   <div><p className="font-bold text-white text-sm">Anonim yuborish</p><p className="text-xs text-slate-500">Ismingiz direktorga ko'rinmaydi</p></div>
                 </label>
                 <button onClick={handleSendFeedback} disabled={isSendingFeedback} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50">{isSendingFeedback ? "YUBORILMOQDA..." : "YUBORISH"}</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

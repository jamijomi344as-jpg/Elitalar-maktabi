"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageCircle, Wallet, BookOpen, Trophy, Settings, LogOut, BellRing, Sun, Moon, Menu, Bell, MessageSquare, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Murojaat modali uchun
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ message: "", isAnonymous: false });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // 1. OQUVCHINI ANIQLASH VA MALUMOT YUKLASH
  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) {
      router.push('/'); // ID yo'q bo'lsa loginga qaytarib yuboradi
      return;
    }

    const fetchStudentData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if (profile) setStudent(profile);

      const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', studentId).order('created_at', { ascending: false });
      setNotifications(notifs || []);
    };

    fetchStudentData();

    // Jonli bildirishnomalar (Real-time)
    const notifChannel = supabase.channel('realtime-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${studentId}` }, (payload) => {
         setNotifications((prev) => [payload.new, ...prev]);
      }).subscribe();

    return () => { supabase.removeChannel(notifChannel); }
  }, []);

  // 2. MAVZU (THEME)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"))) {
      setIsDarkMode(true); document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); setIsDarkMode(false); } 
    else { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); setIsDarkMode(true); }
  };

  const handleLogout = () => {
    localStorage.removeItem('student_id');
    router.push('/');
  };

  const markAsRead = async (notifId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    setNotifications(notifications.map(n => n.id === notifId ? {...n, is_read: true} : n));
  };

  const handleSendFeedback = async () => {
    if (!feedbackForm.message) return alert("Xabar yozing!");
    setIsSendingFeedback(true);
    await supabase.from('feedbacks').insert([{ sender_id: student.id, sender_name: student.full_name, message: feedbackForm.message, is_anonymous: feedbackForm.isAnonymous }]);
    alert("Murojaat yuborildi!"); setShowFeedbackModal(false); setFeedbackForm({ message: "", isAnonymous: false });
    setIsSendingFeedback(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isMessenger = pathname.includes("messenger");

  if (!student) return <div className="min-h-screen bg-[#0e1621] flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0e1621] font-sans overflow-hidden text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-[#0e1621] border-r border-slate-200 dark:border-slate-800/50 flex flex-col h-screen flex-shrink-0 z-40 transition-all duration-300 overflow-hidden absolute md:relative ${isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full border-none"}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/50 flex-shrink-0 w-72">
          <div className="w-10 h-10 bg-blue-600 rounded-[10px] flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 mr-3">E</div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">ELITA</span>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 p-4 w-72 custom-scrollbar">
          <Link href="/student/dashboard"><div className={`flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${pathname === '/student/dashboard' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy</div></Link>
          <Link href="/student/messenger"><div className={`flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${pathname === '/student/messenger' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}><MessageCircle className="w-5 h-5 mr-3" /> Messenger</div></Link>
          <Link href="/student/wallet"><div className={`flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${pathname === '/student/wallet' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}><Wallet className="w-5 h-5 mr-3" /> Hamyon (PP)</div></Link>
          <Link href="/student/education"><div className={`flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${pathname === '/student/education' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}><BookOpen className="w-5 h-5 mr-3" /> Ta'lim</div></Link>
          <Link href="/student/ranking"><div className={`flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${pathname === '/student/ranking' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}><Trophy className="w-5 h-5 mr-3" /> Reyting</div></Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 space-y-2 w-72">
           <Link href="/student/settings"><div className="flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"><Settings className="w-5 h-5 mr-3" /> Sozlamalar</div></Link>
           <button onClick={handleLogout} className="w-full flex items-center px-4 py-3.5 rounded-xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 text-sm"><LogOut className="w-5 h-5 mr-3" /> Chiqish</button>
        </div>
      </aside>

      {/* ASOSIY OYNA */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-[#0e1621]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 px-4 md:px-8 flex justify-between items-center flex-shrink-0 z-30">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"><Menu className="w-5 h-5" /></button>
             <h2 className="font-black text-xl text-slate-900 dark:text-white hidden sm:block">O'quvchi Paneli</h2>
           </div>
           
           <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

             <div className="relative">
               <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all relative">
                 <Bell className="w-5 h-5" />
                 {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-[#0e1621] rounded-full flex items-center justify-center text-[9px] font-black text-white">{unreadCount}</span>}
               </button>

               {/* NOTIFIKATSIYA OYNASI */}
               {showNotifDropdown && (
                 <div className="absolute right-0 top-14 w-80 bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                   <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0e1621]"><h3 className="font-bold text-slate-900 dark:text-white">Bildirishnomalar</h3></div>
                   <div className="max-h-80 overflow-y-auto">
                     {notifications.length === 0 ? <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">Xabarlar yo'q.</p> : 
                       notifications.map(n => (
                         <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                           <div className="flex justify-between items-start mb-1"><span className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</span>{!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>}</div>
                           <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                         </div>
                       ))
                     }
                   </div>
                 </div>
               )}
             </div>
             
             <div className="pl-4 border-l border-slate-200 dark:border-slate-800 ml-1">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-600 rounded-full flex items-center justify-center text-blue-600 dark:text-white font-black text-lg">{student.full_name.charAt(0)}</div>
             </div>
           </div>
        </header>

        {/* PAGE KONTENTI (Boshqa sahifalar shuning ichida ochiladi) */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isMessenger ? 'p-0' : 'p-4 md:p-8'}`}>
          {children}
        </div>

      </div>

      {/* FLOAT MUROJAAT TUGMASI (Har doim pastda turadi) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setShowFeedbackModal(true)} className="bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-2xl hover:bg-blue-500 flex items-center gap-2 hover:scale-105 transition-all">
           <MessageSquare className="w-5 h-5"/> Murojaat yo'llash
        </button>
      </div>

      {/* MUROJAAT MODALI */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
           <div className="bg-white dark:bg-[#17212b] rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-50 dark:bg-[#0e1621] flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-500"/> Murojaat yo'llash</h3>
                 <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <textarea rows={4} placeholder="Fikringizni yozing..." className="w-full p-4 bg-white dark:bg-[#0e1621] border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-2xl font-medium outline-none resize-none text-slate-900 dark:text-white" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})}></textarea>
                 <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#0e1621] rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-800">
                   <input type="checkbox" className="w-5 h-5 accent-blue-600" checked={feedbackForm.isAnonymous} onChange={e => setFeedbackForm({...feedbackForm, isAnonymous: e.target.checked})} />
                   <div><p className="font-bold text-slate-900 dark:text-white text-sm">Anonim yuborish</p><p className="text-xs text-slate-500">Ismingiz direktorga ko'rinmaydi</p></div>
                 </label>
                 <button onClick={handleSendFeedback} disabled={isSendingFeedback} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50">{isSendingFeedback ? "YUBORILMOQDA..." : "YUBORISH"}</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Calendar, Award, Star, BookOpen, 
  Clock, ShieldCheck, Key, CheckCircle, LogOut, Settings, Eye, EyeOff, 
  TableProperties, Send, AlertCircle, FileText, X, PlusCircle, Video, MessageCircle, Edit, MessageSquare, MoreVertical, Search, BellOff, Trash2, Ban
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TeacherDashboard() {
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<"boshqaruv" | "timetable" | "jurnal" | "ish_reja" | "homeroom" | "settings" | "messenger">("boshqaruv");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const [myStudents, setMyStudents] = useState<any[]>([]); 
  const [myTimetable, setMyTimetable] = useState<any[]>([]); 
  const [allClasses, setAllClasses] = useState<any[]>([]); 

  // ==========================================
  // MUROJAAT (FEEDBACK)
  // ==========================================
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ message: "", isAnonymous: false });
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // ==========================================
  // MESSENGER STATE
  // ==========================================
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ id: "", name: "" });
  const [showChatMenu, setShowChatMenu] = useState(false); // 3 nuqta menyusi

  // Jurnal va Ish reja statelari... (Oldingidek qisqartirmasdan yozilgan)
  const [selectedClassForPlan, setSelectedClassForPlan] = useState("");
  const [lessonPlans, setLessonPlans] = useState([{ id: 1, date: "02.09.2025", topic: "Fizika qonunlari", homework: "1-mashq", isSent: true }]);
  const [selectedClassToGrade, setSelectedClassToGrade] = useState("");
  const [studentsInJournal, setStudentsInJournal] = useState<any[]>([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeCell, setActiveCell] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState({ classwork: "", homework: "", status: "" });

  const journalColumns = [{ label: "04.09", sub: "Dj" }, { label: "18.09", sub: "bugun", isToday: true }, { label: "BSB", sub: "Dj" }];

  // ==========================================
  // YUKLASH VA LOGIN
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', loginForm.id).eq('password', loginForm.password).eq('role', 'teacher').single();
    if (data) setCurrentTeacher(data); else alert("ID yoki Parol xato!");
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentTeacher) {
      loadTeacherData();
      loadContacts();
    }
  }, [currentTeacher]);

  const loadTeacherData = async () => {
    setIsLoading(true);
    const { data: cData } = await supabase.from('classes').select('*').order('name');
    setAllClasses(cData || []);
    setIsLoading(false);
  };

  // ==========================================
  // MESSENGER LOGIKASI (HAQIQIY BAZA)
  // ==========================================
  const loadContacts = async () => {
    const { data } = await supabase.from('contacts').select('*').eq('owner_id', currentTeacher?.id);
    setContacts(data || []);
  };

  const loadMessages = async (contact_id: string) => {
    // Ikkala tomondan yozilgan xabarlarni tortish
    const { data } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentTeacher.id},receiver_id.eq.${contact_id}),and(sender_id.eq.${contact_id},receiver_id.eq.${currentTeacher.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const handleAddContact = async () => {
    if(!contactForm.id || !contactForm.name) return alert("To'ldiring!");
    await supabase.from('contacts').insert([{ owner_id: currentTeacher.id, contact_id: contactForm.id.toUpperCase(), contact_name: contactForm.name }]);
    setShowAddContact(false);
    setContactForm({id: "", name: ""});
    loadContacts();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!msgInput.trim() || !activeChat) return;
    
    // UI da darhol ko'rsatish (tezlik uchun)
    const newMsg = { id: Date.now(), sender_id: currentTeacher.id, text: msgInput, created_at: new Date().toISOString() };
    setMessages([...messages, newMsg]);
    setMsgInput("");

    // Bazaga yozish
    await supabase.from('messages').insert([{ sender_id: currentTeacher.id, receiver_id: activeChat.contact_id, text: newMsg.text }]);
  };

  const handleClearHistory = async () => {
    if(confirm("Butun chat tarixini o'chirib yuborasizmi?")) {
      await supabase.from('messages').delete().or(`and(sender_id.eq.${currentTeacher.id},receiver_id.eq.${activeChat.contact_id}),and(sender_id.eq.${activeChat.contact_id},receiver_id.eq.${currentTeacher.id})`);
      setMessages([]);
      setShowChatMenu(false);
    }
  };

  // ==========================================
  // MUROJAAT YUBORISH (GEMINI STYLE)
  // ==========================================
  const handleSendFeedback = async () => {
    if (!feedbackForm.message) return alert("Xabar yozing!");
    setIsSendingFeedback(true);
    await supabase.from('feedbacks').insert([{ sender_id: currentTeacher.id, sender_name: currentTeacher.full_name, message: feedbackForm.message, is_anonymous: feedbackForm.isAnonymous }]);
    alert("Murojaat yuborildi!");
    setShowFeedbackModal(false);
    setFeedbackForm({ message: "", isAnonymous: false });
    setIsSendingFeedback(false);
  };

  // LOGIN EKRANI
  if (!currentTeacher) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 font-sans p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in-95">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-10 h-10"/></div>
          <h2 className="text-3xl font-black text-center mb-2">USTOZ KIRISH</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="ID (T-XXXX)" className="w-full p-5 bg-slate-100 rounded-2xl outline-none text-center font-black uppercase" onChange={(e) => setLoginForm({...loginForm, id: e.target.value.toUpperCase()})} />
            <input type="password" placeholder="Parol" className="w-full p-5 bg-slate-100 rounded-2xl outline-none text-center font-black uppercase" onChange={(e) => setLoginForm({...loginForm, password: e.target.value.toUpperCase()})} />
            <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black">{isLoading ? "KIRILMOQDA..." : "KIRISH"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-indigo-950 border-r border-indigo-900 flex flex-col h-screen flex-shrink-0 z-20 text-indigo-100 hidden md:flex p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black">E</div>
          <span className="text-2xl font-black text-white italic">TEACHER</span>
        </div>
        <nav className="space-y-2 flex-1 overflow-y-auto">
          <button onClick={() => setActiveMenu("boshqaruv")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'boshqaruv' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}><LayoutDashboard className="w-5 h-5 mr-3" /> Asosiy Panel</button>
          <button onClick={() => setActiveMenu("jurnal")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'jurnal' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}><TableProperties className="w-5 h-5 mr-3" /> Jurnal</button>
          
          {/* MESSENGER TUGMASI */}
          <button onClick={() => setActiveMenu("messenger")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'messenger' ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}>
            <MessageCircle className="w-5 h-5 mr-3" /> Messenger
          </button>
          
          <button onClick={() => setActiveMenu("settings")} className={`w-full flex items-center p-4 rounded-2xl font-bold transition-all ${activeMenu === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'}`}><Settings className="w-5 h-5 mr-3" /> Sozlamalar</button>
        </nav>
        <button onClick={() => setCurrentTeacher(null)} className="w-full flex items-center justify-center p-4 text-red-400 font-black hover:bg-red-500/10 mt-4"><LogOut className="w-5 h-5 mr-2" /> Chiqish</button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 lg:p-12 relative pb-24">
        
        {/* MESSENGER BO'LIMI */}
        {activeMenu === "messenger" ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex overflow-hidden">
            
            {/* CHAP TOMON: KONTAKTLAR */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="relative flex-1 mr-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Qidiruv..." className="w-full bg-slate-100 rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                {/* QALAMCHA TUGMASI */}
                <button onClick={() => setShowAddContact(true)} className="p-2.5 bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {contacts.map(c => (
                  <div key={c.id} onClick={() => { setActiveChat(c); loadMessages(c.contact_id); setShowChatMenu(false); }} className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-50 transition-all ${activeChat?.id === c.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-100'}`}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {c.contact_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${activeChat?.id === c.id ? 'text-indigo-900' : 'text-slate-800'}`}>{c.contact_name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{c.contact_id}</p>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && <p className="text-center text-slate-400 text-sm mt-10 p-4">Hali hech kim yozishmadingiz. Qalamchani bosib kontakt qo'shing.</p>}
              </div>
            </div>

            {/* O'NG TOMON: CHAT MAYDONI */}
            <div className="flex-1 flex flex-col bg-[#f0f2f5] relative">
              {activeChat ? (
                <>
                  {/* CHAT HEADER & 3 DOTS */}
                  <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black">{activeChat.contact_name.charAt(0)}</div>
                      <div>
                        <h2 className="font-bold text-slate-800">{activeChat.contact_name}</h2>
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest">O'quvchi</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 relative">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-full"><Search className="w-5 h-5"/></button>
                      <button onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-full"><MoreVertical className="w-5 h-5"/></button>
                      
                      {/* 3 DOTS DROPDOWN */}
                      {showChatMenu && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in zoom-in-95">
                          <button onClick={handleClearHistory} className="w-full flex items-center px-4 py-3 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 mr-3"/> Tarixni tozalash</button>
                          <button className="w-full flex items-center px-4 py-3 text-sm text-slate-700 font-bold hover:bg-slate-50 transition-colors"><BellOff className="w-4 h-4 mr-3 text-slate-400"/> Ovozsiz (Mute)</button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="w-full flex items-center px-4 py-3 text-sm text-slate-700 font-bold hover:bg-slate-50 transition-colors"><Ban className="w-4 h-4 mr-3 text-slate-400"/> Bloklash (Disable share)</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CHAT MESSAGES */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(msg => {
                      const isMe = msg.sender_id === currentTeacher.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-[15px] ${isMe ? 'bg-[#e3ffc2] text-slate-800 rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm'}`}>
                            <p>{msg.text}</p>
                            <div className={`text-[10px] text-right mt-1 ${isMe ? 'text-green-700' : 'text-slate-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {isMe && '✓✓'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* INPUT */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
                    <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Xabar yozing..." className="flex-1 bg-slate-100 rounded-full py-3 px-5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    <button type="submit" className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 shadow-md transition-transform active:scale-95"><Send className="w-5 h-5 ml-1"/></button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <MessageCircle className="w-20 h-20 mb-4 opacity-20"/>
                  <p className="font-bold text-lg">Yozishish uchun chapdan chatni tanlang</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-[3rem] shadow-sm">
            <h2 className="text-3xl font-black">Asosiy Sahifa</h2>
            <p className="text-slate-500 mt-4">Tizim bo'limlarini yon paneldan tanlang.</p>
          </div>
        )}
      </main>

      {/* ==========================================
          GEMINI USLUBIDAGI MUROJAAT TUGMASI 
          (Doim markazda pastda turadi)
      ========================================== */}
      <div className="fixed bottom-4 w-[90%] md:w-auto left-1/2 transform -translate-x-1/2 z-50">
        <button 
          onClick={() => setShowFeedbackModal(true)} 
          className="w-full md:w-auto bg-slate-900/90 backdrop-blur-md text-slate-300 text-[13px] font-medium px-6 py-2.5 rounded-full shadow-2xl hover:text-white flex items-center justify-center gap-2 border border-slate-700/50 transition-all hover:bg-slate-900"
        >
           <MessageSquare className="w-4 h-4 text-indigo-400"/>
           Tizim bo'yicha taklif yoki murojaat yo'llash
        </button>
      </div>

      {/* MUROJAAT MODALI */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowFeedbackModal(false)}>
           <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-8 bg-slate-900 flex justify-between items-center">
                 <h3 className="text-xl font-black text-white flex items-center"><MessageSquare className="w-5 h-5 mr-3 text-indigo-400"/> Murojaat yo'llash</h3>
                 <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-white"><X/></button>
              </div>
              <div className="p-8 space-y-4">
                 <textarea rows={4} placeholder="Fikringizni shu yerga yozing..." className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl outline-none resize-none font-medium" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})}></textarea>
                 <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                   <input type="checkbox" className="w-5 h-5 accent-slate-900" checked={feedbackForm.isAnonymous} onChange={e => setFeedbackForm({...feedbackForm, isAnonymous: e.target.checked})} />
                   <div><p className="font-bold text-sm">Anonim yuborish</p><p className="text-xs text-slate-500">Ismingiz ko'rinmaydi</p></div>
                 </label>
                 <button onClick={handleSendFeedback} disabled={isSendingFeedback} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50">
                   {isSendingFeedback ? "YUBORILMOQDA..." : "YUBORISH"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* KONTAKT QO'SHISH MODALI */}
      {showAddContact && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAddContact(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()}>
             <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
               <h3 className="font-black text-indigo-900">Yangi Kontakt Qo'shish</h3>
             </div>
             <div className="p-6 space-y-4">
               <input type="text" placeholder="Foydalanuvchi ID (Masalan: S-8392)" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-mono uppercase" value={contactForm.id} onChange={e=>setContactForm({...contactForm, id: e.target.value})} />
               <input type="text" placeholder="Qanday nom bilan saqlaysiz?" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={contactForm.name} onChange={e=>setContactForm({...contactForm, name: e.target.value})} />
               <button onClick={handleAddContact} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700">SAQLASH</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

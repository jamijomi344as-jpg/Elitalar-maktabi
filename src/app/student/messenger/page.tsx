"use client";

import { useState, useEffect } from "react";
import { 
  Search, MoreVertical, Paperclip, Send, Smile, Phone, Video, Users, CheckCheck, 
  Menu, Bookmark, User, Megaphone, Settings, Moon, Sun, ChevronDown, X, Trash2, 
  BellOff, Ban, Image as ImageIcon, Camera, MessageCircle, Edit2, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MessengerPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Modallar va menyular
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditChatModal, setShowEditChatModal] = useState(false);

  // Formalar uchun state'lar
  const [contactId, setContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Profil tahrirlash uchun
  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");

  // ==========================================
  // YUKLASH VA TAYYORGARLIK
  // ==========================================
  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) { router.push('/'); return; }

    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark" || document.documentElement.classList.contains("dark"));

    const loadData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if(profile) {
        setStudent(profile);
        setProfileName(profile.full_name);
        setProfileUsername(profile.username || "");
      }
      fetchChats(studentId);
    };
    loadData();
  }, [router]);

  const toggleTheme = () => {
    if (isDarkMode) { document.documentElement.classList.remove("dark"); localStorage.setItem("theme", "light"); setIsDarkMode(false); } 
    else { document.documentElement.classList.add("dark"); localStorage.setItem("theme", "dark"); setIsDarkMode(true); }
  };

  const fetchChats = async (userId: string) => {
    // 1. Kontaktlar
    const { data: contacts } = await supabase.from('contacts').select('*').eq('owner_id', userId);
    // 2. Guruh va Kanallar
    const { data: groupChannels } = await supabase.from('chats').select('*').order('created_at', { ascending: false });
    
    let allChats: any[] = [];
    
    // Saqlangan xabarlar (Telegramdagi kabi)
    allChats.push({
      id: 'saved', name: "Saqlangan xabarlar", type: "saved", 
      avatar_url: null, created_by: userId, isOnline: true
    });

    if (contacts) {
      contacts.forEach(c => allChats.push({ id: c.contact_id, name: c.contact_name, type: "personal", avatar_url: null, isOnline: Math.random() > 0.5 }));
    }
    if (groupChannels) {
      allChats = [...allChats, ...groupChannels];
    }
    setChats(allChats);
  };

  const fetchMessages = async (chatId: string | number) => {
    // Agar "Saqlangan xabarlar" bo'lsa
    if (chatId === 'saved') {
       const { data } = await supabase.from('messages').select('*').eq('sender_id', student.id).eq('receiver_id', student.id).order('created_at', { ascending: true });
       setMessages(data || []);
       return;
    }
    const { data } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${student.id},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${student.id})`).order('created_at', { ascending: true });
    setMessages(data || []);
  };

  // ==========================================
  // RASM YUKLASH LOGIKASI
  // ==========================================
  const handleUploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) { alert(`Rasm yuklashda xato: ${uploadError.message}`); throw uploadError; }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ==========================================
  // HARAKATLAR
  // ==========================================
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const receiver = activeChat.id === 'saved' ? student.id : activeChat.id;
    const newMsg = { sender_id: student.id, receiver_id: receiver, text: messageInput };
    
    setMessages([...messages, { ...newMsg, id: Date.now(), created_at: new Date().toISOString() }]);
    setMessageInput("");

    await supabase.from('messages').insert([newMsg]);
  };

  const handleAddContact = async () => {
    if (!contactId.trim() || !contactName.trim()) return alert("Maydonlarni to'ldiring!");
    setIsUploading(true);
    
    // Qidirilayotgan odam bormi?
    const { data: exist } = await supabase.from('profiles').select('id').eq('id', contactId.toUpperCase()).single();
    if (!exist) { alert("Bunday ID raqamli odam topilmadi!"); setIsUploading(false); return; }

    await supabase.from('contacts').insert([{ owner_id: student.id, contact_id: contactId.toUpperCase(), contact_name: contactName }]);
    fetchChats(student.id);
    setShowAddContactModal(false); setContactId(""); setContactName(""); setIsUploading(false);
  };

  const handleCreateGroupOrChannel = async (type: "group" | "channel") => {
    if (!newChatName.trim()) return alert("Nomini yozing!");
    setIsUploading(true);
    let avatarUrl = "";
    if (uploadImage) {
      try { avatarUrl = await handleUploadImage(uploadImage); } catch (err) { setIsUploading(false); return; }
    }
    const { data, error } = await supabase.from('chats').insert([{ name: newChatName, type: type, avatar_url: avatarUrl, created_by: student.id }]).select().single();
    if (!error && data) {
      setChats([data, ...chats]); setActiveChat(data);
      setShowCreateGroupModal(false); setShowCreateChannelModal(false); setNewChatName(""); setUploadImage(null);
    }
    setIsUploading(false);
  };

  const handleUpdateProfile = async () => {
    setIsUploading(true);
    let avatarUrl = student.avatar_url;
    if (uploadImage) {
      try { avatarUrl = await handleUploadImage(uploadImage); } catch (err) { setIsUploading(false); return; }
    }
    const { error } = await supabase.from('profiles').update({ full_name: profileName, username: profileUsername, avatar_url: avatarUrl }).eq('id', student.id);
    if (!error) { setStudent({...student, full_name: profileName, username: profileUsername, avatar_url: avatarUrl}); setShowProfileModal(false); setUploadImage(null); }
    setIsUploading(false);
  };

  const handleUpdateChat = async () => {
    setIsUploading(true);
    let avatarUrl = activeChat.avatar_url;
    if (uploadImage) {
      try { avatarUrl = await handleUploadImage(uploadImage); } catch (err) { setIsUploading(false); return; }
    }
    const { error } = await supabase.from('chats').update({ name: newChatName, avatar_url: avatarUrl }).eq('id', activeChat.id);
    if (!error) {
      const updatedChat = {...activeChat, name: newChatName, avatar_url: avatarUrl};
      setActiveChat(updatedChat);
      setChats(chats.map(c => c.id === activeChat.id ? updatedChat : c));
      setShowEditChatModal(false); setUploadImage(null);
    }
    setIsUploading(false);
  };

  if (!student) return <div className="flex h-screen items-center justify-center bg-[#0e1621]"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const isOwner = activeChat && activeChat.created_by === student.id && (activeChat.type === 'group' || activeChat.type === 'channel');

  return (
    <div className="w-full h-full bg-[#0e1621] text-white flex overflow-hidden relative">
      
      {/* ========================================================== */}
      {/* YON MENYU (DRAWER) - Telegram uslubi */}
      {/* ========================================================== */}
      {isDrawerOpen && <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>}
      <div className={`absolute top-0 left-0 h-full w-[280px] bg-[#17212b] z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-[#2b5278] text-white relative">
           <div className="flex justify-between items-start mb-4">
             <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center font-black text-2xl shadow-lg overflow-hidden border border-white/20">
               {student.avatar_url ? <img src={student.avatar_url} className="w-full h-full object-cover"/> : student.full_name.charAt(0)}
             </div>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors">
               {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
             </button>
           </div>
           <div className="flex justify-between items-center cursor-pointer" onClick={() => {setShowProfileModal(true); setIsDrawerOpen(false);}}>
              <div>
                 <h3 className="font-bold text-[15px]">{student.full_name}</h3>
                 <p className="text-xs text-blue-200 opacity-80">{student.username ? `@${student.username}` : `ID: ${student.id}`}</p>
              </div>
              <ChevronDown className="w-5 h-5" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 text-[#708499]">
           <div onClick={() => {setShowProfileModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <User className="w-5 h-5" /> <span className="font-medium text-[15px]">Mening Profilim</span>
           </div>
           <div className="h-[1px] bg-[#0e1621] my-1 mx-2"></div>
           <div onClick={() => {setShowCreateGroupModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <Users className="w-5 h-5" /> <span className="font-medium text-[15px]">Yangi Guruh</span>
           </div>
           <div onClick={() => {setShowCreateChannelModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" /> <span className="font-medium text-[15px]">Yangi Kanal</span>
           </div>
           <div onClick={() => {setActiveChat(chats.find(c => c.id === 'saved')); fetchMessages('saved'); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" /> <span className="font-medium text-[15px]">Saqlangan Xabarlar</span>
           </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* CHAP TOMON: CHATLAR RO'YXATI */}
      {/* ========================================================== */}
      <div className="w-full md:w-[340px] bg-[#17212b] flex flex-col flex-shrink-0 border-r border-[#0e1621] z-10 relative">
        <div className="p-3 flex items-center gap-3">
          <Menu onClick={() => setIsDrawerOpen(true)} className="w-6 h-6 text-[#708499] cursor-pointer hover:text-white transition-colors" />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#708499]" />
            <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Qidiruv" className="w-full bg-[#242f3d] rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-[#708499]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredChats.length === 0 ? (
             <p className="text-center text-[#708499] mt-10 text-sm">Hech narsa topilmadi.</p>
          ) : (
            filteredChats.map(chat => {
              const isActive = activeChat?.id === chat.id;
              const isSaved = chat.id === 'saved';
              return (
                <div key={chat.id} onClick={() => {setActiveChat(chat); fetchMessages(chat.id);}} className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${isActive ? 'bg-[#2b5278]' : 'hover:bg-[#202b36]'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white overflow-hidden flex-shrink-0 ${isSaved ? 'bg-blue-400' : 'bg-gradient-to-tr from-blue-500 to-indigo-500'}`}>
                    {isSaved ? <Bookmark className="w-6 h-6"/> : chat.avatar_url ? <img src={chat.avatar_url} className="w-full h-full object-cover"/> : chat.name.charAt(0)}
                  </div>
                  <div className={`flex-1 min-w-0 border-b pb-2 ${isActive ? 'border-transparent' : 'border-[#0e1621]'}`}>
                    <div className="flex justify-between items-center mb-0.5 mt-1">
                      <h3 className={`font-bold text-[15px] truncate pr-2 text-white`}>{chat.name}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[13px] truncate pr-2 text-[#4a8ebf] capitalize">{chat.type}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* FAB (Qalamcha) Tugmasi - Kontakt qo'shish uchun */}
        <button onClick={() => setShowAddContactModal(true)} className="absolute bottom-6 right-6 w-14 h-14 bg-[#4a8ebf] hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20">
          <Edit2 className="w-6 h-6" />
        </button>
      </div>

      {/* ========================================================== */}
      {/* O'NG TOMON: ASOSIY CHAT OYNASI */}
      {/* ========================================================== */}
      <div className="flex-1 flex flex-col min-w-0 hidden md:flex relative bg-[#0e1621]">
        {activeChat ? (
          <>
            <div className="h-[60px] bg-[#17212b] flex items-center justify-between px-4 z-10 border-b border-[#0e1621]">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-bold text-[15px] text-white flex items-center">{activeChat.name}</h2>
                  <p className="text-[13px] text-[#708499]">
                    {activeChat.id === 'saved' ? 'Shaxsiy xotirangiz' : activeChat.type === 'personal' ? 'Yaqinda kirdi' : '1 a\'zo'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-[#708499] relative">
                <Search className="w-5 h-5 cursor-pointer hover:text-white" />
                <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
                
                <MoreVertical onClick={() => setShowChatMenu(!showChatMenu)} className="w-5 h-5 cursor-pointer hover:text-white" />
                {showChatMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-[#17212b] rounded-xl shadow-2xl border border-slate-800 py-2 z-50">
                    {isOwner && (
                      <button onClick={() => {setNewChatName(activeChat.name); setShowEditChatModal(true); setShowChatMenu(false);}} className="w-full flex items-center px-4 py-2.5 text-sm text-white hover:bg-[#202b36]"><Edit2 className="w-4 h-4 mr-3 text-blue-400"/> Tahrirlash</button>
                    )}
                    <button className="w-full flex items-center px-4 py-2.5 text-sm text-white hover:bg-[#202b36]"><BellOff className="w-4 h-4 mr-3 text-[#708499]"/> Ovozsiz</button>
                    <div className="h-[1px] bg-[#0e1621] my-1"></div>
                    <button className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-[#202b36]"><Trash2 className="w-4 h-4 mr-3"/> Tarixni tozalash</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 flex flex-col scrollbar-thin bg-black/20">
              {messages.length === 0 ? (
                <div className="text-center mt-20 text-[#708499]">
                  {activeChat.id === 'saved' ? "Bu yerga muhim fayl va xabarlarni saqlang." : "Bu yerda hali xabarlar yo'q."}
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === student.id;
                  return (
                    <div key={msg.id} className={`flex max-w-xl ${isMe ? 'self-end' : 'self-start'}`}>
                      <div className={`rounded-2xl p-2.5 shadow-md ${isMe ? 'bg-[#2b5278] text-white rounded-br-sm' : 'bg-[#182533] text-white rounded-bl-sm'}`}>
                        <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-blue-200' : 'text-[#708499]'}`}>
                          <span className="text-[10px]">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-[#17212b] flex gap-3 items-center">
              <button type="button" className="p-2 text-[#708499] hover:text-white transition-colors"><Paperclip className="w-6 h-6" /></button>
              <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Xabar yozing..." className="flex-1 bg-[#0e1621] rounded-full py-3 px-5 outline-none text-white text-[15px] placeholder-[#708499]" />
              <button type="submit" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md"><Send className="w-5 h-5 ml-1"/></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#708499] bg-[#0e1621]">
            <div className="w-20 h-20 bg-[#17212b] rounded-full flex items-center justify-center mb-4"><MessageCircle className="w-10 h-10"/></div>
            <p className="font-bold text-lg">Yozishish uchun chatni tanlang</p>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* BARCHA MODALLAR (Qo'shish, Tahrirlash, Rasm yuklash) */}
      {/* ========================================================== */}

      {/* KONTAKT QO'SHISH (FAB orqali) */}
      {showAddContactModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#0e1621]">
             <h3 className="font-bold text-xl mb-6 text-white flex items-center"><User className="w-5 h-5 mr-2 text-blue-500"/> Yangi Kontakt</h3>
             <input type="text" value={contactId} onChange={e=>setContactId(e.target.value)} placeholder="ID raqam (Masalan: S-1122)" className="w-full bg-[#0e1621] rounded-xl p-4 text-white outline-none focus:border-blue-500 border border-transparent mb-3 uppercase font-mono" />
             <input type="text" value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Kontakt nomi..." className="w-full bg-[#0e1621] rounded-xl p-4 text-white outline-none focus:border-blue-500 border border-transparent mb-6" />
             <div className="flex gap-3">
               <button onClick={() => setShowAddContactModal(false)} className="flex-1 py-3 text-[#708499] font-bold hover:bg-[#202b36] rounded-xl">Bekor qilish</button>
               <button onClick={handleAddContact} disabled={isUploading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">Qo'shish</button>
             </div>
          </div>
        </div>
      )}

      {/* KANAL/GURUH YARATISH */}
      {(showCreateGroupModal || showCreateChannelModal) && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#0e1621]">
             <h3 className="font-bold text-xl mb-6 text-white">{showCreateGroupModal ? "Yangi Guruh" : "Yangi Kanal"}</h3>
             
             <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-[#0e1621] border border-[#2b5278] flex items-center justify-center overflow-hidden">
                    {uploadImage ? <img src={URL.createObjectURL(uploadImage)} className="w-full h-full object-cover"/> : <Camera className="w-8 h-8 text-blue-500"/>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setUploadImage(e.target.files[0]); }}/>
                </label>
             </div>

             <input type="text" value={newChatName} onChange={e=>setNewChatName(e.target.value)} placeholder="Nomi..." className="w-full bg-[#0e1621] rounded-xl p-4 text-white outline-none focus:border-blue-500 border border-transparent mb-4" />
             
             <div className="flex gap-3 mt-2">
               <button onClick={() => {setShowCreateGroupModal(false); setShowCreateChannelModal(false); setUploadImage(null);}} className="flex-1 py-3 text-[#708499] font-bold hover:bg-[#202b36] rounded-xl">Bekor qilish</button>
               <button onClick={() => handleCreateGroupOrChannel(showCreateGroupModal ? 'group' : 'channel')} disabled={isUploading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                 {isUploading ? "Yuklanmoqda..." : "Yaratish"}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* CHATNI TAHRIRLASH (Egalari uchun) */}
      {showEditChatModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#0e1621]">
             <h3 className="font-bold text-xl mb-6 text-white">Tahrirlash</h3>
             <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-[#0e1621] border border-[#2b5278] flex items-center justify-center overflow-hidden">
                    {uploadImage ? <img src={URL.createObjectURL(uploadImage)} className="w-full h-full object-cover"/> : activeChat.avatar_url ? <img src={activeChat.avatar_url} className="w-full h-full object-cover"/> : <Camera className="w-8 h-8 text-blue-500"/>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setUploadImage(e.target.files[0]); }}/>
                </label>
             </div>
             <input type="text" value={newChatName} onChange={e=>setNewChatName(e.target.value)} placeholder="Nomi..." className="w-full bg-[#0e1621] rounded-xl p-4 text-white outline-none focus:border-blue-500 border border-transparent mb-4" />
             <div className="flex gap-3">
               <button onClick={() => {setShowEditChatModal(false); setUploadImage(null);}} className="flex-1 py-3 text-[#708499] font-bold hover:bg-[#202b36] rounded-xl">Bekor qilish</button>
               <button onClick={handleUpdateChat} disabled={isUploading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">Saqlash</button>
             </div>
          </div>
        </div>
      )}

      {/* PROFILNI TAHRIRLASH MODALI */}
      {showProfileModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#0e1621]">
             <h3 className="font-bold text-xl mb-6 text-white flex items-center"><Settings className="w-5 h-5 mr-2 text-blue-500"/> Mening Profilim</h3>
             
             <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-[#0e1621] border border-[#2b5278] flex items-center justify-center overflow-hidden">
                    {uploadImage ? <img src={URL.createObjectURL(uploadImage)} className="w-full h-full object-cover"/> : student.avatar_url ? <img src={student.avatar_url} className="w-full h-full object-cover"/> : <Camera className="w-8 h-8 text-blue-500"/>}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full shadow-lg"><Camera className="w-4 h-4 text-white"/></div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files[0]) setUploadImage(e.target.files[0]); }}/>
                </label>
             </div>

             <div className="space-y-4 mb-6">
               <div>
                 <label className="text-xs text-[#708499] font-bold uppercase ml-1">Ism Sharifingiz</label>
                 <input type="text" value={profileName} onChange={e=>setProfileName(e.target.value)} className="w-full bg-[#0e1621] rounded-xl p-3 text-white outline-none focus:border-blue-500 border border-transparent mt-1" />
               </div>
               <div>
                 <label className="text-xs text-[#708499] font-bold uppercase ml-1">Foydalanuvchi nomi</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708499] font-bold">@</span>
                   <input type="text" value={profileUsername} onChange={e=>setProfileUsername(e.target.value)} placeholder="username" className="w-full bg-[#0e1621] rounded-xl p-3 pl-8 text-white outline-none focus:border-blue-500 border border-transparent mt-1" />
                 </div>
               </div>
             </div>
             
             <div className="flex gap-3">
               <button onClick={() => {setShowProfileModal(false); setUploadImage(null);}} className="flex-1 py-3 text-[#708499] font-bold hover:bg-[#202b36] rounded-xl">Bekor qilish</button>
               <button onClick={handleUpdateProfile} disabled={isUploading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                 {isUploading ? "Saqlanmoqda..." : "Saqlash"}
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

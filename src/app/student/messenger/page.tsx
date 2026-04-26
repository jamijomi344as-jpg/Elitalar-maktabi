"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, Paperclip, Send, Smile, Phone, Video, Users, Check, CheckCheck, Menu, Pin, Bookmark, User, Megaphone, Settings, Moon, ChevronDown, X, PlusCircle, Edit3, Type, Image as ImageIcon, Bell, Lock, MessageCircle, Folder, Sliders, Volume2, Battery, Languages, ArrowLeft } from "lucide-react";

export default function MessengerPage() {
  // ==========================================
  // ASOSIY STATE'LAR
  // ==========================================
  const [activeChat, setActiveChat] = useState<number>(6);
  const [messageInput, setMessageInput] = useState("");
  const [isDark, setIsDark] = useState(true);

  // Modallar va Stiker
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsView, setSettingsView] = useState("main"); // main, account, chat, language
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const [newChatName, setNewChatName] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactId, setNewContactId] = useState("");

  // ==========================================
  // BAZALAR
  // ==========================================
  const [settings, setSettings] = useState({ textSize: "medium", enterToSend: true, language: "English" });
  
  const [profile, setProfile] = useState({
    name: "Kiyotaka Ayanokoji",
    id: "S-8392",
    phone: "+998 90 123 45 67",
    bio: "IELTS 8.0 target 🎯",
    avatarUrl: ""
  });

  const [contacts, setContacts] = useState([
    { id: "T-1045", name: "Alimov B. (Matematika)", status: "Ustoz" },
    { id: "S-1122", name: "Asadova Parizod", status: "Sinfdosh" }
  ]);

  const [chats, setChats] = useState([
    { id: 0, name: "Saved Messages", type: "saved", avatar: <Bookmark className="w-5 h-5 text-white"/>, lastMsg: "Shaxsiy xotira...", time: "", unread: 0, isOnline: true, color: "bg-[#4a8ebf]" },
    { id: 1, name: "Saud Abdulwahed", type: "personal", avatar: "S", lastMsg: "Mana qo'shimcha roadmap...", time: "Thu", unread: 0, isOnline: false, color: "bg-pink-500" },
    { id: 2, name: "9-B 4-DIUM", type: "group", avatar: "9", lastMsg: "Domla: 🏞 Photo", time: "4:44 PM", unread: 2, isOnline: false, color: "bg-blue-500" },
    { id: 6, name: "Ozodbek's IELTS", type: "group", avatar: "O", lastMsg: "🚀", time: "8:53 PM", unread: 0, isOnline: true, color: "bg-indigo-500" }
  ]);

  const [chatMessages, setChatMessages] = useState<any>({
    0: [{ id: 1, sender: "Siz", text: "Bu yerga o'zingiz uchun kerakli ma'lumotlar, fayllar va eslatmalarni saqlab qo'yishingiz mumkin.", time: "10:00 AM", isMe: true }],
    6: [
      { id: 1, sender: "Ozodbek's IELTS", text: "Чудесная целительница Цзю 2 Shenyi Jiu Xiaojie.", time: "4:39 PM", isMe: false, avatar: "O" },
      { id: 2, sender: "3D Anime Dunxua", text: "Аниме ПУТЬ СВЯТОГО 4K", time: "6:43 PM", isMe: false, avatar: "3", isVideo: true },
      { id: 3, sender: "Siz", text: "Rahmat, bugun albatta ko'raman! 🚀", time: "6:45 PM", isMe: true },
    ]
  });

  const stickers = ["👍", "😂", "❤️", "🔥", "🎉", "😢", "👀", "🚀", "😎", "💯"];

  // ==========================================
  // FUNKSIYALAR
  // ==========================================
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleNightMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;
    const newMessage = { id: Date.now(), sender: "Siz", text: messageInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true };
    setChatMessages((prev: any) => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMessage] }));
    setMessageInput("");
  };

  const handleSendSticker = (sticker: string) => {
    const newStickerMsg = { id: Date.now(), sender: "Siz", text: sticker, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true, isSticker: true };
    setChatMessages((prev: any) => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newStickerMsg] }));
    setShowStickerPicker(false);
  };

  const handleCreateChat = (type: "group" | "channel") => {
    if (!newChatName.trim()) return;
    const newChat = { id: Date.now(), name: newChatName, type: type, avatar: newChatName.charAt(0).toUpperCase(), lastMsg: `${type === 'group' ? 'Guruh' : 'Kanal'} yaratildi`, time: "Now", unread: 0, isOnline: true, color: type === 'group' ? 'bg-purple-500' : 'bg-amber-500' };
    setChats([newChat, ...chats]); setActiveChat(newChat.id); setShowNewGroupModal(false); setShowNewChannelModal(false); setNewChatName("");
  };

  const activeChatData = chats.find(c => c.id === activeChat);
  const currentMessages = chatMessages[activeChat] || [];
  const textSizeClass = settings.textSize === "small" ? "text-[13px]" : settings.textSize === "large" ? "text-[17px]" : "text-[15px]";

  const ProfileAvatar = ({ className, charSize }: { className: string, charSize: string }) => {
    if (profile.avatarUrl) return <img src={profile.avatarUrl} alt="Profile" className={`object-cover ${className}`} />;
    return <div className={`flex items-center justify-center font-bold text-white bg-blue-500 ${className} ${charSize}`}>{profile.name.charAt(0)}</div>;
  };

  // Ayrim sozlamalar ustiga bosganda "Tez kunda" alerti
  const showComingSoon = () => alert("Supabase ulangach ishlaydi!");

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#9bb3c8] dark:bg-[#0e1621] text-gray-900 dark:text-white flex overflow-hidden relative transition-colors duration-300">
      
      {/* ========================================================== */}
      {/* TELEGRAM DRAWER (YON MENYU) */}
      {/* ========================================================== */}
      {isDrawerOpen && <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>}
      
      <div className={`absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-[#17212b] z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-blue-500 text-white shadow-sm relative">
           <ProfileAvatar className="w-14 h-14 rounded-full mb-3 border border-white/30 shadow-lg" charSize="text-2xl" />
           <div className="flex justify-between items-center cursor-pointer">
              <div>
                 <h3 className="font-bold text-[15px]">{profile.name}</h3>
                 <p className="text-xs text-blue-100">ID: {profile.id}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-blue-200" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 text-gray-700 dark:text-[#708499]">
           {/* Mening Profilim endi Settings -> Account ga yo'naltiradi */}
           <div onClick={() => {setSettingsView("account"); setShowSettingsModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors">
              <User className="w-5 h-5" /> <span className="font-medium text-[15px]">Mening Profilim</span>
           </div>
           <div className="h-[1px] bg-gray-200 dark:bg-[#0e1621] my-1 mx-2"></div>
           <div onClick={() => {setShowNewGroupModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors">
              <Users className="w-5 h-5" /> <span className="font-medium text-[15px]">Yangi Guruh</span>
           </div>
           <div onClick={() => {setShowNewChannelModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" /> <span className="font-medium text-[15px]">Yangi Kanal</span>
           </div>
           <div onClick={() => {setShowContactsModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors">
              <User className="w-5 h-5" /> <span className="font-medium text-[15px]">Kontaktlar</span>
           </div>
           <div onClick={() => {setActiveChat(0); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" /> <span className="font-medium text-[15px]">Saqlangan Xabarlar</span>
           </div>
           <div onClick={() => {setSettingsView("main"); setShowSettingsModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors">
              <Settings className="w-5 h-5" /> <span className="font-medium text-[15px]">Sozlamalar</span>
           </div>
           <div onClick={toggleNightMode} className="flex items-center justify-between px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors mt-4 border-t border-gray-200 dark:border-[#0e1621]">
              <div className="flex items-center gap-4"><Moon className="w-5 h-5" /> <span className="font-medium text-[15px]">Tungi Rejim</span></div>
              <div className={`w-9 h-5 rounded-full relative transition-colors ${isDark ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDark ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
           </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* CHAP TOMON: CHATLAR RO'YXATI */}
      {/* ========================================================== */}
      <div className="w-full md:w-[340px] bg-white dark:bg-[#17212b] flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-[#0e1621] z-10 transition-colors duration-300">
        <div className="p-3 flex items-center gap-3">
          <Menu onClick={() => setIsDrawerOpen(true)} className="w-6 h-6 text-gray-500 dark:text-[#708499] cursor-pointer hover:text-blue-500 dark:hover:text-white transition-colors" />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#708499]" />
            <input type="text" placeholder="Qidiruv" className="w-full bg-gray-100 dark:bg-[#242f3d] rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 border border-transparent transition-colors text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#708499]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {chats.map(chat => {
            if(chat.id === 0 && activeChat !== 0) return null;
            const isActive = activeChat === chat.id;
            return (
              <div key={chat.id} onClick={() => setActiveChat(chat.id)} className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${isActive ? 'bg-blue-500 text-white dark:bg-[#2b5278]' : 'hover:bg-gray-100 dark:hover:bg-[#202b36]'}`}>
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${chat.color}`}>{chat.avatar}</div>
                  {chat.isOnline && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#17212b] rounded-full"></div>}
                </div>
                <div className={`flex-1 min-w-0 border-b pb-2 ${isActive ? 'border-transparent' : 'border-gray-100 dark:border-[#0e1621]'}`}>
                  <div className="flex justify-between items-center mb-0.5 mt-1">
                    <h3 className={`font-bold text-[15px] truncate pr-2 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{chat.name}</h3>
                    <span className={`text-xs whitespace-nowrap ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-[#708499]'}`}>{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[13px] truncate pr-2 ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-[#4a8ebf]'}`}>{chat.lastMsg}</p>
                    {chat.unread > 0 && <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[22px] text-center ${isActive ? 'bg-white text-blue-500' : 'bg-gray-300 dark:bg-[#4a8ebf] text-white'}`}>{chat.unread}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================== */}
      {/* O'NG TOMON: ASOSIY CHAT OYNASI */}
      {/* ========================================================== */}
      <div className="flex-1 flex flex-col min-w-0 hidden md:flex relative">
        <div className="h-[60px] bg-white dark:bg-[#17212b] flex items-center justify-between px-4 z-10 shadow-sm border-b border-gray-200 dark:border-[#0e1621] transition-colors">
          <div className="flex items-center gap-3 cursor-pointer">
            <div>
              <h2 className="font-bold text-[15px] text-gray-900 dark:text-white flex items-center">{activeChatData?.name}</h2>
              <p className="text-[13px] text-gray-500 dark:text-[#708499]">{activeChatData?.type === 'saved' ? 'Shaxsiy xotirangiz' : activeChatData?.type === 'group' ? '15 ta a\'zo' : activeChatData?.isOnline ? 'Onlayn' : 'Yaqinda kirdi'}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-gray-500 dark:text-[#708499]">
            <Search className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
            <Phone className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 flex flex-col scrollbar-thin">
          <div className="text-center my-2">
            <span className="text-xs font-bold bg-white/50 dark:bg-[#17212b]/50 text-gray-500 dark:text-[#708499] px-3 py-1 rounded-full shadow-sm">Bugun</span>
          </div>

          {currentMessages.map((msg: any) => (
            <div key={msg.id} className={`flex max-w-xl ${msg.isMe ? 'self-end' : 'self-start'} group`}>
              {!msg.isMe && (
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm text-white font-bold mt-auto mr-3 flex-shrink-0 shadow-sm">
                  {msg.avatar}
                </div>
              )}
              
              <div className={`flex flex-col`}>
                {!msg.isMe && <span className="text-[13px] font-bold text-blue-600 dark:text-[#4a8ebf] mb-1 ml-1">{msg.sender}</span>}
                
                {msg.isSticker ? (
                  <div className="text-6xl animate-in zoom-in-90 mb-1 drop-shadow-xl">{msg.text}</div>
                ) : (
                  <div className={`rounded-2xl p-2 relative shadow-md ${msg.isVideo ? 'bg-black p-0 overflow-hidden' : msg.isMe ? 'bg-[#efffde] dark:bg-[#2b5278] text-gray-900 dark:text-white rounded-br-sm' : 'bg-white dark:bg-[#182533] text-gray-900 dark:text-white rounded-bl-sm'}`}>
                    
                    {msg.isVideo && (
                      <div className="relative w-[320px] h-[180px] flex items-center justify-center group-hover:opacity-90 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=640" alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10"><div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div></div>
                      </div>
                    )}

                    <div className={`${msg.isVideo ? 'p-3 bg-white dark:bg-[#182533]' : 'p-1'}`}>
                      <p className={`${textSizeClass} leading-relaxed break-words whitespace-pre-wrap`}>{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMe ? 'text-emerald-500 dark:text-blue-200' : 'text-gray-400 dark:text-[#708499]'}`}>
                        <span className="text-[11px] font-medium">{msg.time}</span>
                        {msg.isMe && <CheckCheck className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 pt-2 bg-transparent z-10 relative">
          {showStickerPicker && (
            <div className="absolute bottom-20 right-4 w-72 bg-white dark:bg-[#17212b] border border-gray-200 dark:border-[#0e1621] shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-bottom-2">
               <p className="text-xs font-bold text-gray-400 dark:text-[#708499] mb-3 uppercase tracking-wider">Stikerlar</p>
               <div className="grid grid-cols-4 gap-3">
                  {stickers.map(st => (
                    <button key={st} onClick={() => handleSendSticker(st)} className="text-4xl hover:scale-110 transition-transform active:scale-95 text-center flex justify-center drop-shadow-md">{st}</button>
                  ))}
               </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-white dark:bg-[#17212b] rounded-xl px-2 py-1 shadow-sm border border-gray-200 dark:border-transparent transition-colors">
            <button type="button" className="p-3 text-gray-400 dark:text-[#708499] hover:text-blue-500 transition-colors rounded-full"><Paperclip className="w-6 h-6" /></button>
            <div className="flex-1">
              <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Xabar yozing..." className="w-full bg-transparent border-none py-3 outline-none text-gray-900 dark:text-white text-[15px] placeholder-gray-400 dark:placeholder-[#708499]" onKeyDown={(e) => { if(e.key === 'Enter' && settings.enterToSend) handleSendMessage(e) }} />
            </div>
            <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className={`p-3 transition-colors rounded-full ${showStickerPicker ? 'text-blue-500 bg-blue-50 dark:bg-[#2b5278]/30' : 'text-gray-400 dark:text-[#708499] hover:text-blue-500'}`}><Smile className="w-6 h-6" /></button>
            {messageInput.trim() ? (
              <button type="submit" className="p-3 text-blue-500 dark:text-[#4a8ebf] hover:text-blue-600 dark:hover:text-white transition-colors rounded-full"><Send className="w-6 h-6" /></button>
            ) : (
              <button type="button" className="p-3 text-gray-400 dark:text-[#708499] hover:text-blue-500 transition-colors rounded-full"><Phone className="w-6 h-6" /></button>
            )}
          </form>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TELEGRAM SETTINGS MODAL (MUKAMMAL) */}
      {/* ========================================================== */}
      {showSettingsModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17212b] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 h-[80vh] flex flex-col border border-gray-200 dark:border-[#0e1621]">
             
             {/* Header */}
             <div className="h-[60px] px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#0e1621] bg-gray-50 dark:bg-[#17212b]">
               <div className="flex items-center gap-4">
                 {settingsView !== "main" && (
                   <button onClick={() => setSettingsView("main")} className="text-gray-500 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white"><ArrowLeft className="w-5 h-5"/></button>
                 )}
                 <h3 className="font-bold text-[17px] text-gray-900 dark:text-white">
                   {settingsView === "main" ? "Settings" : settingsView === "account" ? "My Account" : settingsView === "chat" ? "Chat Settings" : "Language"}
                 </h3>
               </div>
               <div className="flex items-center gap-4 text-gray-500 dark:text-[#708499]">
                 {settingsView === "main" && <Search className="w-5 h-5 cursor-pointer hover:text-white" />}
                 {settingsView === "main" && <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />}
                 <button onClick={() => setShowSettingsModal(false)} className="hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5"/></button>
               </div>
             </div>

             {/* Boshqaruv Ekranlari */}
             <div className="flex-1 overflow-y-auto scrollbar-thin">
                
                {/* 1. ASOSIY EKRAN (MAIN VIEW - Rasmdagidek) */}
                {settingsView === "main" && (
                  <div>
                    {/* Prompt Box */}
                    <div className="p-4 bg-gray-50 dark:bg-[#182533] border-b border-gray-200 dark:border-[#0e1621]">
                      <p className="text-[#4a8ebf] font-bold text-sm mb-2">Is {profile.phone} still your number?</p>
                      <p className="text-[13px] text-gray-600 dark:text-[#708499] leading-snug mb-3">Keep your number up to date to ensure you can always log into Messenger. <span className="text-[#4a8ebf] cursor-pointer">Learn More</span></p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-blue-500 dark:bg-[#2b5278] hover:bg-blue-600 dark:hover:bg-[#3d7ca8] text-white font-bold py-2 rounded-lg text-sm transition-colors">Yes</button>
                        <button className="flex-1 bg-blue-500 dark:bg-[#2b5278] hover:bg-blue-600 dark:hover:bg-[#3d7ca8] text-white font-bold py-2 rounded-lg text-sm transition-colors">No</button>
                      </div>
                    </div>
                    
                    {/* Settings List */}
                    <div className="py-2">
                      <div onClick={() => setSettingsView("account")} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <User className="w-5 h-5" /> <span className="font-medium text-[15px]">My Account</span>
                      </div>
                      <div onClick={showComingSoon} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Bell className="w-5 h-5" /> <span className="font-medium text-[15px]">Notifications and Sounds</span>
                      </div>
                      <div onClick={showComingSoon} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Lock className="w-5 h-5" /> <span className="font-medium text-[15px]">Privacy and Security</span>
                      </div>
                      <div onClick={() => setSettingsView("chat")} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5" /> <span className="font-medium text-[15px]">Chat Settings</span>
                      </div>
                      <div onClick={showComingSoon} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Folder className="w-5 h-5" /> <span className="font-medium text-[15px]">Folders</span>
                      </div>
                      <div onClick={showComingSoon} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Sliders className="w-5 h-5" /> <span className="font-medium text-[15px]">Advanced</span>
                      </div>
                      <div onClick={showComingSoon} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Volume2 className="w-5 h-5" /> <span className="font-medium text-[15px]">Speakers and Camera</span>
                      </div>
                      <div onClick={showComingSoon} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Battery className="w-5 h-5" /> <span className="font-medium text-[15px]">Battery and Animations</span>
                      </div>
                      <div onClick={() => setSettingsView("language")} className="flex items-center justify-between px-5 py-3 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer text-gray-600 dark:text-[#708499] hover:text-gray-900 dark:hover:text-white transition-colors">
                        <div className="flex items-center gap-4"><Languages className="w-5 h-5" /> <span className="font-medium text-[15px]">Language</span></div>
                        <span className="text-sm text-[#4a8ebf]">{settings.language}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ACCOUNT VIEW (Eski Profil Modali shu yerga ko'chdi) */}
                {settingsView === "account" && (
                  <div className="p-6 space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="relative group cursor-pointer">
                        <ProfileAvatar className="w-28 h-28 rounded-full shadow-lg border-2 border-transparent group-hover:border-blue-500 transition-colors" charSize="text-4xl" />
                        <div className="absolute bottom-0 right-0 bg-white dark:bg-[#17212b] rounded-full p-2 shadow-md border border-gray-100 dark:border-transparent">
                          <ImageIcon className="w-5 h-5 text-blue-500 dark:text-[#4a8ebf]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 dark:text-[#708499] uppercase">Profil rasmi URL manzili (silka)</label>
                      <input type="text" value={profile.avatarUrl} onChange={e=>setProfile({...profile, avatarUrl: e.target.value})} placeholder="https://rasm-silkasi.com/rasm.jpg" className="w-full bg-gray-100 dark:bg-[#242f3d] rounded-lg p-3 outline-none text-sm text-gray-900 dark:text-white border border-transparent focus:border-blue-500 mt-1" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 dark:text-[#708499] uppercase">Ism-Sharif</label>
                      <input type="text" value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} className="w-full bg-gray-100 dark:bg-[#242f3d] rounded-lg p-3 outline-none text-gray-900 dark:text-white font-bold border border-transparent focus:border-blue-500 mt-1" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 dark:text-[#708499] uppercase">Bio (O'zingiz haqingizda)</label>
                      <input type="text" value={profile.bio} onChange={e=>setProfile({...profile, bio: e.target.value})} className="w-full bg-gray-100 dark:bg-[#242f3d] rounded-lg p-3 outline-none text-gray-900 dark:text-white border border-transparent focus:border-blue-500 mt-1" />
                    </div>
                  </div>
                )}

                {/* 3. CHAT SETTINGS VIEW */}
                {settingsView === "chat" && (
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center"><Type className="w-4 h-4 mr-2"/> Xabarlar hajmi</p>
                      <div className="flex gap-2">
                        <button onClick={() => setSettings({...settings, textSize: 'small'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${settings.textSize === 'small' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-[#242f3d] text-gray-600 dark:text-[#708499]'}`}>Kichik</button>
                        <button onClick={() => setSettings({...settings, textSize: 'medium'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${settings.textSize === 'medium' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-[#242f3d] text-gray-600 dark:text-[#708499]'}`}>O'rta</button>
                        <button onClick={() => setSettings({...settings, textSize: 'large'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${settings.textSize === 'large' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-[#242f3d] text-gray-600 dark:text-[#708499]'}`}>Katta</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-[#0e1621] pt-6">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Enter bilan yuborish</p>
                        <p className="text-xs text-gray-500 dark:text-[#708499]">Enter bosilganda xabar jo'natiladi</p>
                      </div>
                      <div onClick={() => setSettings({...settings, enterToSend: !settings.enterToSend})} className={`w-10 h-6 rounded-full cursor-pointer relative transition-colors ${settings.enterToSend ? 'bg-blue-500' : 'bg-gray-300 dark:bg-[#0e1621]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enterToSend ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. LANGUAGE VIEW */}
                {settingsView === "language" && (
                  <div className="py-2">
                    {["English", "O'zbek", "Русский"].map(lang => (
                       <div key={lang} onClick={() => setSettings({...settings, language: lang})} className="flex items-center justify-between px-5 py-4 hover:bg-gray-100 dark:hover:bg-[#202b36] cursor-pointer transition-colors">
                         <span className="font-medium text-[15px] text-gray-900 dark:text-white">{lang}</span>
                         {settings.language === lang && <Check className="w-5 h-5 text-blue-500" />}
                       </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

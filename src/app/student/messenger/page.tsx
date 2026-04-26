"use client";

import { useState } from "react";
import { Search, MoreVertical, Paperclip, Send, Smile, Phone, Video, Hash, Users, Check, CheckCheck, Menu, Pin, Bookmark, User, Megaphone, Settings, Moon, ChevronDown, X, PlusCircle } from "lucide-react";

export default function MessengerPage() {
  const [activeChat, setActiveChat] = useState<number>(6);
  const [messageInput, setMessageInput] = useState("");
  
  // ==========================================
  // DRAWER VA MODALLAR STATE
  // ==========================================
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);

  // Chatlar bazasi (0 ID bu Saqlangan xabarlar uchun)
  const chats = [
    { id: 0, name: "Saved Messages", type: "saved", avatar: <Bookmark className="w-6 h-6 text-white"/>, lastMsg: "Shaxsiy xotira...", time: "", unread: 0, isOnline: true, color: "bg-[#4a8ebf]" },
    { id: 1, name: "Saud Abdulwahed", type: "personal", avatar: "S", lastMsg: "Mana qo'shimcha roadmap...", time: "Thu", unread: 0, isOnline: false, color: "bg-pink-500" },
    { id: 2, name: "9-B 4-DIUM", type: "group", avatar: "9", lastMsg: "Domla: 🏞 Photo", time: "4:44 PM", unread: 2, isOnline: false, color: "bg-blue-500" },
    { id: 3, name: "IELTS 1ST | Tues 15:30", type: "group", avatar: "I", lastMsg: "نحن رجال مسلمون: Focusing on...", time: "5:15 PM", unread: 0, isOnline: false, color: "bg-amber-500" },
    { id: 4, name: "Abror Rahmatullayev", type: "personal", avatar: "A", lastMsg: "DIQQAT BUGUN General English...", time: "6:57 PM", unread: 332, isOnline: true, color: "bg-orange-500" },
    { id: 5, name: "Ulugbek Davlatov | IELTS 8.5", type: "channel", avatar: "U", lastMsg: "❓ \"ARTICLE o'qisam zerikaman\"...", time: "6:37 PM", unread: 56, isOnline: false, color: "bg-red-500" },
    { id: 6, name: "Ozodbek's IELTS", type: "group", avatar: "O", lastMsg: "3D Аниме Дунхуа video yuklandi", time: "8:53 PM", unread: 0, isOnline: true, color: "bg-indigo-500" }
  ];

  // Xabarlar bazasi (Har bir chat ID siga qarab)
  const [chatMessages, setChatMessages] = useState<any>({
    0: [
      { id: 1, sender: "Siz", text: "Bu yerga o'zingiz uchun kerakli ma'lumotlar, fayllar va eslatmalarni saqlab qo'yishingiz mumkin.", time: "10:00 AM", isMe: true, avatar: "K" }
    ],
    6: [
      { id: 1, sender: "Ozodbek's IELTS", text: "Чудесная целительница Цзю 2 Shenyi Jiu Xiaojie 2nd Season Great Doctor Miss Nine 2. В этом продолжении зрители...", time: "4:39 PM", isMe: false, avatar: "O" },
      { id: 2, sender: "3D Anime Dunxua", text: "За гранью времени 19 серия 4K AniSTAR / Вне времени\n#За_гранью_времени", time: "4:39 PM", isMe: false, avatar: "3", isVideo: true },
      { id: 3, sender: "3D Anime Dunxua", text: "Аниме ПУТЬ СВЯТОГО 4K\n@protivostoyaniesvyatogo", time: "6:43 PM", isMe: false, avatar: "3", isVideo: true },
      { id: 4, sender: "Siz", text: "Rahmat, bugun albatta ko'raman! 🚀", time: "6:45 PM", isMe: true, avatar: "K" },
    ]
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: "Siz",
      text: messageInput,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isMe: true,
      avatar: "K"
    };

    setChatMessages((prev: any) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));
    
    setMessageInput("");
  };

  const activeChatData = chats.find(c => c.id === activeChat);
  const currentMessages = chatMessages[activeChat] || [];

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0e1621] text-white flex overflow-hidden relative">
      
      {/* ========================================================== */}
      {/* TELEGRAM DRAWER (YON MENYU) */}
      {/* ========================================================== */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-40 bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>
      )}
      
      <div className={`absolute top-0 left-0 h-full w-[280px] bg-[#17212b] z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drawer Header (Profil) */}
        <div className="p-4 border-b border-[#0e1621] bg-[#242f3d]/30">
           <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center font-bold text-2xl mb-3 shadow-lg">K</div>
           <div className="flex justify-between items-center cursor-pointer">
              <div>
                 <h3 className="font-bold text-[15px] text-white">Kiyotaka Ayanokoji</h3>
                 <p className="text-xs text-[#4a8ebf]">Set Emoji Status</p>
              </div>
              <ChevronDown className="w-5 h-5 text-[#708499]" />
           </div>
        </div>
        
        {/* Drawer Menyulari */}
        <div className="flex-1 overflow-y-auto py-2">
           <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <User className="w-5 h-5" /> <span className="font-medium text-[15px]">My Profile</span>
           </div>
           
           <div className="h-[1px] bg-[#0e1621] my-1 mx-2"></div>

           <div onClick={() => {setShowNewGroupModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <Users className="w-5 h-5" /> <span className="font-medium text-[15px]">New Group</span>
           </div>
           <div onClick={() => {setShowNewChannelModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" /> <span className="font-medium text-[15px]">New Channel</span>
           </div>
           <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <User className="w-5 h-5" /> <span className="font-medium text-[15px]">Contacts</span>
           </div>
           <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <Phone className="w-5 h-5" /> <span className="font-medium text-[15px]">Calls</span>
           </div>
           
           {/* SAQLANGAN XABARLAR */}
           <div onClick={() => {setActiveChat(0); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" /> <span className="font-medium text-[15px]">Saved Messages</span>
           </div>
           
           <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors">
              <Settings className="w-5 h-5" /> <span className="font-medium text-[15px]">Settings</span>
           </div>
           
           <div className="flex items-center justify-between px-5 py-3 hover:bg-[#202b36] cursor-pointer text-[#708499] hover:text-white transition-colors mt-4 border-t border-[#0e1621]">
              <div className="flex items-center gap-4">
                <Moon className="w-5 h-5" /> <span className="font-medium text-[15px]">Night Mode</span>
              </div>
              <div className="w-8 h-4 bg-[#4a8ebf] rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
           </div>
        </div>
        
        <div className="p-4 text-center border-t border-[#0e1621]">
          <p className="text-xs text-[#708499]">Elita Messenger<br/>Version 1.0.0 - About</p>
        </div>
      </div>


      {/* ========================================================== */}
      {/* CHAP TOMON: CHATLAR RO'YXATI (#17212b) */}
      {/* ========================================================== */}
      <div className="w-full md:w-[340px] bg-[#17212b] flex flex-col flex-shrink-0 border-r border-[#0e1621]">
        
        {/* Qidiruv Qismi */}
        <div className="p-3 flex items-center gap-3">
          <Menu onClick={() => setIsDrawerOpen(true)} className="w-6 h-6 text-[#708499] cursor-pointer hover:text-white transition-colors" />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#708499]" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#242f3d] rounded-full py-2 pl-10 pr-4 outline-none focus:border-[#2b5278] border border-transparent transition-colors text-sm text-white placeholder-[#708499]"
            />
          </div>
        </div>

        {/* Chatlar */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#242f3d]">
          {chats.map(chat => {
            if(chat.id === 0 && activeChat !== 0) return null; // Saqlangan xabarlar faqat active bo'lsa chat ro'yxatida ko'rinadi (Telegram kabi)
            return (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat.id)}
                className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${activeChat === chat.id ? 'bg-[#2b5278]' : 'hover:bg-[#202b36]'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${chat.color}`}>
                    {chat.avatar}
                  </div>
                  {chat.isOnline && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#17212b] rounded-full"></div>}
                </div>
                
                <div className="flex-1 min-w-0 border-b border-[#0e1621] pb-2">
                  <div className="flex justify-between items-center mb-0.5 mt-1">
                    <h3 className="font-bold text-[15px] text-white truncate pr-2">{chat.name}</h3>
                    <span className={`text-xs whitespace-nowrap text-[#708499]`}>{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-[#4a8ebf] truncate pr-2">{chat.lastMsg}</p>
                    {chat.unread > 0 && (
                      <span className="bg-[#4a8ebf] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[22px] text-center">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================== */}
      {/* O'NG TOMON: ASOSIY CHAT (#0e1621) */}
      {/* ========================================================== */}
      <div className="flex-1 flex flex-col min-w-0 hidden md:flex relative bg-[#0e1621]">
        
        {/* Chat Header */}
        <div className="h-[60px] bg-[#17212b] flex items-center justify-between px-4 z-10 shadow-sm border-b border-[#0e1621]">
          <div className="flex items-center gap-3 cursor-pointer">
            <div>
              <h2 className="font-bold text-[15px] text-white flex items-center">
                {activeChatData?.name}
              </h2>
              <p className="text-[13px] text-[#708499]">
                {activeChatData?.type === 'saved' ? 'Sizning xotirangiz' : activeChatData?.type === 'group' ? '15 subscribers' : activeChatData?.isOnline ? 'online' : 'last seen recently'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[#708499]">
            <Search className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Phone className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {activeChatData?.id === 6 && (
          <div className="bg-[#17212b] px-4 py-2 border-b border-[#0e1621] flex items-center gap-3 cursor-pointer hover:bg-[#202b36]">
            <Pin className="w-5 h-5 text-[#4a8ebf]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#4a8ebf] font-bold">Pinned message</p>
              <p className="text-sm text-[#708499] truncate">Чудесная целительница Цзю 2 Shenyi Jiu Xiaojie...</p>
            </div>
          </div>
        )}

        {/* Chat Xabarlari */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 flex flex-col scrollbar-thin scrollbar-thumb-[#242f3d]">
          <div className="text-center my-2">
            <span className="text-xs font-bold bg-[#17212b]/50 text-[#708499] px-3 py-1 rounded-full">Bugun</span>
          </div>

          {currentMessages.map((msg: any) => (
            <div key={msg.id} className={`flex max-w-xl ${msg.isMe ? 'self-end' : 'self-start'} group`}>
              {!msg.isMe && (
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold mt-auto mr-3 flex-shrink-0 cursor-pointer">
                  {msg.avatar}
                </div>
              )}
              
              <div className={`flex flex-col`}>
                {!msg.isMe && (
                  <span className="text-[13px] font-bold text-[#4a8ebf] mb-1 ml-1">{msg.sender}</span>
                )}
                <div className={`rounded-2xl p-2 relative shadow-sm ${msg.isVideo ? 'bg-[#17212b] p-0 overflow-hidden' : msg.isMe ? 'bg-[#2b5278] text-white rounded-br-sm' : 'bg-[#182533] text-white rounded-bl-sm'}`}>
                  {msg.isVideo && (
                    <div className="relative w-[320px] h-[180px] bg-black flex items-center justify-center group-hover:opacity-90 cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=640" alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">20:02</div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-bold px-2 py-0.5 shadow-black text-shadow">1752.2 MB</div>
                    </div>
                  )}

                  <div className={`${msg.isVideo ? 'p-3' : 'p-1'}`}>
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isVideo ? 'text-[#708499]' : 'text-blue-200'}`}>
                      <span className="text-[11px]">{msg.time}</span>
                      {msg.isMe && <CheckCheck className="w-4 h-4 text-[#53bdeb]" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Xabar yozish qismi */}
        <div className="px-4 pb-4 pt-2 bg-[#0e1621] z-10">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-[#17212b] rounded-xl px-2 py-1">
            <button type="button" className="p-3 text-[#708499] hover:text-[#4a8ebf] transition-colors rounded-full"><Paperclip className="w-6 h-6" /></button>
            <div className="flex-1">
              <input 
                type="text" 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message..." 
                className="w-full bg-transparent border-none py-3 outline-none text-white text-[15px] placeholder-[#708499]"
              />
            </div>
            <button type="button" className="p-3 text-[#708499] hover:text-[#4a8ebf] transition-colors rounded-full"><Smile className="w-6 h-6" /></button>
            {messageInput.trim() ? (
              <button type="submit" className="p-3 text-[#4a8ebf] hover:text-white transition-colors rounded-full"><Send className="w-6 h-6" /></button>
            ) : (
              <button type="button" className="p-3 text-[#708499] hover:text-[#4a8ebf] transition-colors rounded-full"><Phone className="w-6 h-6" /></button>
            )}
          </form>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODALLAR (Yangi Guruh va Kanal yaratish uchun) */}
      {/* ========================================================== */}
      
      {/* YANGI GURUH */}
      {showNewGroupModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
             <div className="p-4 border-b border-[#0e1621] flex justify-between items-center">
                <h3 className="text-white font-bold text-[17px]">New Group</h3>
                <button onClick={() => setShowNewGroupModal(false)} className="text-[#708499] hover:text-white"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 text-center">
                <div className="w-20 h-20 bg-[#2b5278] rounded-full mx-auto mb-4 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                   <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <input type="text" placeholder="Group name" className="w-full bg-transparent border-b-2 border-[#2b5278] focus:border-[#4a8ebf] outline-none py-2 text-white text-center mb-6" />
                <button onClick={() => setShowNewGroupModal(false)} className="w-full bg-[#4a8ebf] hover:bg-[#3d7ca8] text-white py-3 rounded-lg font-bold transition-colors">Yaratish</button>
             </div>
          </div>
        </div>
      )}

      {/* YANGI KANAL */}
      {showNewChannelModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
             <div className="p-4 border-b border-[#0e1621] flex justify-between items-center">
                <h3 className="text-white font-bold text-[17px]">New Channel</h3>
                <button onClick={() => setShowNewChannelModal(false)} className="text-[#708499] hover:text-white"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 text-center">
                <div className="w-20 h-20 bg-[#2b5278] rounded-full mx-auto mb-4 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                   <Megaphone className="w-8 h-8 text-white" />
                </div>
                <input type="text" placeholder="Channel name" className="w-full bg-transparent border-b-2 border-[#2b5278] focus:border-[#4a8ebf] outline-none py-2 text-white text-center mb-4" />
                <input type="text" placeholder="Description (optional)" className="w-full bg-transparent border-b-2 border-[#2b5278] focus:border-[#4a8ebf] outline-none py-2 text-[#708499] text-sm text-center mb-6" />
                <button onClick={() => setShowNewChannelModal(false)} className="w-full bg-[#4a8ebf] hover:bg-[#3d7ca8] text-white py-3 rounded-lg font-bold transition-colors">Kanalni yaratish</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

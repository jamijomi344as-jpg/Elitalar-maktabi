"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, Paperclip, Send, Smile, Phone, Video, Users, CheckCheck, Menu, Bookmark, User, Megaphone, Settings, Moon, ChevronDown, X, Trash2, BellOff, Ban, Image as ImageIcon, Camera, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MessengerPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Modallar
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  
  // Yangi Yaratish uchun statelar
  const [newChatName, setNewChatName] = useState("");
  const [newChatImage, setNewChatImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) { router.push('/'); return; }

    const loadData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if(profile) setStudent(profile);

      fetchChats(studentId);
      fetchContacts(studentId);
    };
    loadData();
  }, [router]);

  const fetchChats = async (userId: string) => {
    const { data } = await supabase.from('chats').select('*').order('created_at', { ascending: false });
    setChats(data || []);
  };

  const fetchContacts = async (userId: string) => {
    const { data } = await supabase.from('contacts').select('*').eq('owner_id', userId);
    setContacts(data || []);
  };

  const fetchMessages = async (chatId: number) => {
    const { data } = await supabase.from('messages').select('*').eq('receiver_id', chatId).order('created_at', { ascending: true });
    setMessages(data || []);
  };

  // RASM YUKLASH FUNKSIYASI (Supabase Storage)
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // KANAL YOKI GURUH YARATISH
  const handleCreateChat = async (type: "group" | "channel") => {
    if (!newChatName.trim()) return alert("Nomini yozing!");
    setIsUploading(true);

    let avatarUrl = "";
    if (newChatImage) {
      try {
        avatarUrl = await uploadImage(newChatImage);
      } catch (err) {
        alert("Rasm yuklashda xatolik!");
        setIsUploading(false); return;
      }
    }

    const { data, error } = await supabase.from('chats').insert([{ 
      name: newChatName, type: type, avatar_url: avatarUrl, created_by: student.id 
    }]).select().single();

    if (!error && data) {
      setChats([data, ...chats]);
      setActiveChat(data);
      setShowNewGroupModal(false); setShowNewChannelModal(false);
      setNewChatName(""); setNewChatImage(null);
    }
    setIsUploading(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const newMsg = { sender_id: student.id, receiver_id: activeChat.id, text: messageInput };
    
    setMessages([...messages, { ...newMsg, id: Date.now(), created_at: new Date().toISOString() }]);
    setMessageInput("");

    await supabase.from('messages').insert([newMsg]);
  };

  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!student) return <div className="p-10 text-slate-500">Yuklanmoqda...</div>;

  return (
    <div className="w-full h-full bg-[#0e1621] text-white flex overflow-hidden relative">
      
      {/* YON MENYU (DRAWER) */}
      {isDrawerOpen && <div className="absolute inset-0 z-40 bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>}
      <div className={`absolute top-0 left-0 h-full w-[280px] bg-[#17212b] z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-blue-600 text-white shadow-sm relative">
           <div className="w-14 h-14 rounded-full mb-3 bg-blue-500 flex items-center justify-center font-black text-2xl shadow-lg border border-white/20">
             {student.full_name.charAt(0)}
           </div>
           <div className="flex justify-between items-center cursor-pointer">
              <div>
                 <h3 className="font-bold text-[15px]">{student.full_name}</h3>
                 <p className="text-xs text-blue-200">ID: {student.id}</p>
              </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 text-[#708499]">
           <div onClick={() => {setShowNewGroupModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <Users className="w-5 h-5" /> <span className="font-medium text-[15px]">Yangi Guruh</span>
           </div>
           <div onClick={() => {setShowNewChannelModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" /> <span className="font-medium text-[15px]">Yangi Kanal</span>
           </div>
           <div onClick={() => {setShowContactsModal(true); setIsDrawerOpen(false);}} className="flex items-center gap-4 px-5 py-3 hover:bg-[#202b36] cursor-pointer hover:text-white transition-colors">
              <User className="w-5 h-5" /> <span className="font-medium text-[15px]">Kontaktlar</span>
           </div>
        </div>
      </div>

      {/* CHAP TOMON: CHATLAR RO'YXATI */}
      <div className="w-full md:w-[340px] bg-[#17212b] flex flex-col flex-shrink-0 border-r border-[#0e1621] z-10">
        <div className="p-3 flex items-center gap-3">
          <Menu onClick={() => setIsDrawerOpen(true)} className="w-6 h-6 text-[#708499] cursor-pointer hover:text-white transition-colors" />
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#708499]" />
            <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Qidiruv" className="w-full bg-[#242f3d] rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-[#708499]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredChats.length === 0 ? (
             <p className="text-center text-[#708499] mt-10 text-sm">Hali chatlar yo'q. Yangi guruh oching!</p>
          ) : (
            filteredChats.map(chat => {
              const isActive = activeChat?.id === chat.id;
              return (
                <div key={chat.id} onClick={() => {setActiveChat(chat); fetchMessages(chat.id);}} className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${isActive ? 'bg-[#2b5278]' : 'hover:bg-[#202b36]'}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white bg-blue-500 overflow-hidden flex-shrink-0">
                    {chat.avatar_url ? <img src={chat.avatar_url} className="w-full h-full object-cover"/> : chat.name.charAt(0)}
                  </div>
                  <div className={`flex-1 min-w-0 border-b pb-2 ${isActive ? 'border-transparent' : 'border-[#0e1621]'}`}>
                    <div className="flex justify-between items-center mb-0.5 mt-1">
                      <h3 className={`font-bold text-[15px] truncate pr-2 ${isActive ? 'text-white' : 'text-white'}`}>{chat.name}</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[13px] truncate pr-2 text-[#4a8ebf]">{chat.type}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* O'NG TOMON: ASOSIY CHAT OYNASI */}
      <div className="flex-1 flex flex-col min-w-0 hidden md:flex relative bg-[#0e1621]">
        {activeChat ? (
          <>
            <div className="h-[60px] bg-[#17212b] flex items-center justify-between px-4 z-10 border-b border-[#0e1621]">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-bold text-[15px] text-white flex items-center">{activeChat.name}</h2>
                  <p className="text-[13px] text-[#708499] capitalize">{activeChat.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-[#708499] relative">
                <Search className="w-5 h-5 cursor-pointer hover:text-white" />
                <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
                
                <MoreVertical onClick={() => setShowChatMenu(!showChatMenu)} className="w-5 h-5 cursor-pointer hover:text-white" />
                {showChatMenu && (
                  <div className="absolute right-0 top-10 w-48 bg-[#17212b] rounded-xl shadow-2xl border border-slate-800 py-2 z-50">
                    <button className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-[#202b36]"><Trash2 className="w-4 h-4 mr-3"/> Tarixni tozalash</button>
                    <button className="w-full flex items-center px-4 py-2.5 text-sm text-white hover:bg-[#202b36]"><BellOff className="w-4 h-4 mr-3 text-[#708499]"/> Ovozsiz</button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 flex flex-col scrollbar-thin">
              {messages.length === 0 ? (
                <div className="text-center mt-20 text-[#708499]">Bu yerda hali xabarlar yo'q.</div>
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
          <div className="flex-1 flex flex-col items-center justify-center text-[#708499]">
            <div className="w-20 h-20 bg-[#17212b] rounded-full flex items-center justify-center mb-4"><MessageCircle className="w-10 h-10"/></div>
            <p className="font-bold text-lg">Yozishish uchun chatni tanlang</p>
          </div>
        )}
      </div>

      {/* MODALLAR: GURUH VA KANAL OCHISH (RASM YUKLASH BILAN) */}
      {(showNewGroupModal || showNewChannelModal) && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#0e1621]">
             <h3 className="font-bold text-xl mb-6 text-white">{showNewGroupModal ? "Yangi Guruh" : "Yangi Kanal"}</h3>
             
             {/* Rasm yuklash joyi */}
             <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-dashed border-blue-500 flex items-center justify-center overflow-hidden">
                    {newChatImage ? (
                      <img src={URL.createObjectURL(newChatImage)} className="w-full h-full object-cover" alt="Preview"/>
                    ) : (
                      <Camera className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform"/>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                     if (e.target.files && e.target.files[0]) setNewChatImage(e.target.files[0]);
                  }}/>
                </label>
             </div>

             <input type="text" value={newChatName} onChange={e=>setNewChatName(e.target.value)} placeholder="Nomi..." className="w-full bg-[#0e1621] rounded-xl p-4 text-white outline-none focus:border-blue-500 border border-transparent mb-4" />
             
             <div className="flex gap-3 mt-2">
               <button onClick={() => {setShowNewGroupModal(false); setShowNewChannelModal(false);}} className="flex-1 py-3 text-[#708499] font-bold hover:bg-[#202b36] rounded-xl">Bekor qilish</button>
               <button onClick={() => handleCreateChat(showNewGroupModal ? 'group' : 'channel')} disabled={isUploading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                 {isUploading ? "Yuklanmoqda..." : "Yaratish"}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* KONTAKTLAR MODALI */}
      {showContactsModal && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#17212b] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border border-[#0e1621]">
             <h3 className="font-bold text-xl mb-4 text-white">Kontaktlar</h3>
             <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
               {contacts.length === 0 ? <p className="text-center text-[#708499]">Kontaktlar yo'q.</p> : contacts.map(c => (
                 <div key={c.id} className="p-3 bg-[#0e1621] rounded-xl text-white">
                   <p className="font-bold">{c.contact_name}</p><p className="text-xs text-[#708499]">{c.contact_id}</p>
                 </div>
               ))}
             </div>
             <button onClick={() => setShowContactsModal(false)} className="w-full py-3 bg-[#202b36] text-white font-bold rounded-xl hover:bg-[#2a3947]">Yopish</button>
          </div>
        </div>
      )}

    </div>
  );
}

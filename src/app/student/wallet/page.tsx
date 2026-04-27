"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Wallet, Send, History, ArrowRight, ShieldCheck, X, AlertCircle, CheckCircle2, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function WalletPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) { router.push('/'); return; }

    const loadData = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
      if(profile) setStudent(profile);

      const { data: trx } = await supabase.from('transactions').select('*').or(`sender_id.eq.${studentId},receiver_id.eq.${studentId}`).order('created_at', { ascending: false });
      if(trx) setTransactions(trx);
    };
    loadData();
  }, [router]);

  const handleTransferInit = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    const transferAmount = Number(amount);
    const formattedId = recipientId.trim().toUpperCase();

    if (transferAmount <= 0) return setError("Summa noldan katta bo'lishi kerak!");
    if (transferAmount > (student?.pp_balance || 0)) return setError("Hisobingizda mablag' yetarli emas!");
    if (formattedId === student?.id) return setError("O'zingizga pul o'tkaza olmaysiz!");
    
    setIsPinModalOpen(true);
  };

  const handlePinSubmit = async () => {
    setError(""); setIsProcessing(true);

    if (pin !== student.password) { // Parolni PIN kod sifatida ishlatamiz
      setError("Parolingiz noto'g'ri kiritildi!");
      setIsProcessing(false); setPin(""); return;
    }

    const transferAmount = Number(amount);
    const formattedId = recipientId.trim().toUpperCase();

    const { data: receiver } = await supabase.from('profiles').select('*').eq('id', formattedId).single();
    if (!receiver) {
      setError("Bunday ID raqamli foydalanuvchi topilmadi!");
      setIsProcessing(false); setPin(""); setIsPinModalOpen(false); return;
    }

    const myNewBalance = (student.pp_balance || 0) - transferAmount;
    const receiverNewBalance = (receiver.pp_balance || 0) + transferAmount;

    await supabase.from('profiles').update({ pp_balance: myNewBalance }).eq('id', student.id);
    await supabase.from('profiles').update({ pp_balance: receiverNewBalance }).eq('id', receiver.id);
    await supabase.from('transactions').insert([{ sender_id: student.id, receiver_id: receiver.id, amount: transferAmount }]);

    setStudent({ ...student, pp_balance: myNewBalance });
    setSuccess(`${amount} PP muvaffaqiyatli o'tkazildi!`);
    
    const { data: trx } = await supabase.from('transactions').select('*').or(`sender_id.eq.${student.id},receiver_id.eq.${student.id}`).order('created_at', { ascending: false });
    if(trx) setTransactions(trx);

    setIsPinModalOpen(false); setIsProcessing(false); setPin(""); setRecipientId(""); setAmount("");
  };

  if (!student) return <div className="p-10 text-center text-slate-500">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="relative z-10 w-full mb-6 md:mb-0">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-medium">Hamyon (Shaxsiy Ball)</p>
          <div className="text-5xl font-black tracking-tight mb-2">{(student.pp_balance || 0).toLocaleString()} <span className="text-2xl text-blue-400 font-bold">PP</span></div>
          <p className="text-slate-400 text-sm flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-green-400" /> Tranzaksiyalar himoyalangan</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-auto text-center md:text-left">
          <p className="text-sm text-slate-300">Sizning ID raqamingiz:</p>
          <p className="text-2xl font-mono font-bold text-blue-300 tracking-widest">{student.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#17212b] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-xl flex items-center mb-6 dark:text-white"><Send className="w-6 h-6 mr-3 text-blue-500" /> O'tkazma qilish</h3>
          <form onSubmit={handleTransferInit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qabul qiluvchining ID raqami</label>
              <input type="text" placeholder="Masalan: S-8393" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0e1621] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono text-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">O'tkaziladigan summa (PP)</label>
              <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0e1621] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg" />
            </div>
            {error && !isPinModalOpen && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center text-sm font-medium"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{error}</div>}
            {success && <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center text-sm font-medium"><CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />{success}</div>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center text-lg shadow-lg">Davom etish <ArrowRight className="w-5 h-5 ml-2" /></button>
          </form>
        </div>

        <div className="bg-white dark:bg-[#17212b] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-xl flex items-center mb-6 dark:text-white"><History className="w-6 h-6 mr-3 text-gray-500" /> Tarix</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {transactions.length === 0 ? <p className="text-center text-slate-500 py-10">Tarix bo'sh</p> : transactions.map((tx) => {
              const isSent = tx.sender_id === student.id;
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isSent ? 'bg-red-100 dark:bg-red-500/20 text-red-600' : 'bg-green-100 dark:bg-green-500/20 text-green-600'}`}>{isSent ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}</div>
                    <div><p className="font-bold text-gray-900 dark:text-white">{isSent ? `O'tkazildi: ${tx.receiver_id}` : `Qabul qilindi: ${tx.sender_id}`}</p><p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString('uz-UZ')}</p></div>
                  </div>
                  <div className={`font-bold text-lg ${isSent ? 'text-gray-900 dark:text-white' : 'text-green-600 dark:text-green-400'}`}>{isSent ? '-' : '+'}{tx.amount}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#17212b] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-6 text-center relative">
              <button onClick={() => { setIsPinModalOpen(false); setPin(""); setError(""); }} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><ShieldCheck className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold dark:text-white mb-2">Tasdiqlash</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6"><span className="font-bold text-gray-900 dark:text-white">{amount} PP</span> miqdoridagi pulni o'tkazish uchun shaxsiy parolingizni kiriting.</p>
              <input type="password" autoFocus placeholder="Parol" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full text-center text-xl py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0e1621] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none mb-4" />
              {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}
              <button onClick={handlePinSubmit} disabled={!pin || isProcessing} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50">{isProcessing ? "Tasdiqlanmoqda..." : "Tasdiqlash"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

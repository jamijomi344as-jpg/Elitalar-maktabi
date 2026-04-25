"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/mockData";
import { Wallet, Send, History, ArrowRight, ShieldCheck, X, AlertCircle, CheckCircle2, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function WalletPage() {
  // Hozirgi foydalanuvchi (Vaqtincha Kiyotaka)
  const currentUser = mockUsers.find(u => u.id === "S-8392");
  
  // State (Holatlar)
  const [balance, setBalance] = useState(currentUser?.balancePP || 0);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // PIN Modal holatlari
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Vaqtincha tarix ro'yxati
  const [transactions, setTransactions] = useState([
    { id: 1, type: "in", name: "O'qituvchi: Ismailova Y.", amount: 5000, date: "Bugun, 14:30" },
    { id: 2, type: "out", name: "O'quvchi: Suzune H. (S-8393)", amount: 1500, date: "Kecha, 09:15" },
  ]);

  // Pul o'tkazishni tekshirish
  const handleTransferInit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const transferAmount = Number(amount);
    const formattedId = recipientId.trim().toUpperCase();

    if (transferAmount <= 0) {
      return setError("Summa noldan katta bo'lishi kerak!");
    }
    if (transferAmount > balance) {
      return setError("Hisobingizda mablag' yetarli emas!");
    }
    if (formattedId === currentUser?.id) {
      return setError("O'zingizga pul o'tkaza olmaysiz!");
    }

    const recipient = mockUsers.find(u => u.id === formattedId);
    if (!recipient) {
      return setError("Bunday ID raqamli foydalanuvchi topilmadi!");
    }

    // Hamma tekshiruvdan o'tsa, PIN kod so'raymiz
    setIsPinModalOpen(true);
  };

  // PIN kodni tasdiqlash va pulni yechish
  const handlePinSubmit = () => {
    setError("");
    setIsProcessing(true);

    setTimeout(() => {
      if (pin !== "1234") {
        setError("Noto'g'ri PIN-kod kiritildi! (Test PIN: 1234)");
        setIsProcessing(false);
        setPin("");
        return;
      }

      // Muvaffaqiyatli o'tkazma
      setBalance(prev => prev - Number(amount));
      setTransactions(prev => [
        { 
          id: Date.now(), 
          type: "out", 
          name: `ID: ${recipientId.toUpperCase()}`, 
          amount: Number(amount), 
          date: "Hozirgina" 
        },
        ...prev
      ]);
      
      setSuccess(`${amount} PP muvaffaqiyatli o'tkazildi!`);
      setIsPinModalOpen(false);
      setIsProcessing(false);
      setPin("");
      setRecipientId("");
      setAmount("");
    }, 1500); // 1.5 soniya "o'ylash" effekti
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* 1. Asosiy Balans Kartochkasi */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="relative z-10 w-full mb-6 md:mb-0">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-medium">Hamyon (Shaxsiy Ball)</p>
          <div className="text-5xl font-black tracking-tight mb-2">
            {balance.toLocaleString()} <span className="text-2xl text-blue-400 font-bold">PP</span>
          </div>
          <p className="text-slate-400 text-sm flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-green-400" />
            Tranzaksiyalar himoyalangan
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-full md:w-auto text-center md:text-left">
          <p className="text-sm text-slate-300">Sizning ID raqamingiz:</p>
          <p className="text-2xl font-mono font-bold text-blue-300 tracking-widest">{currentUser?.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. Pul o'tkazish formasi */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-xl flex items-center mb-6 dark:text-white">
            <Send className="w-6 h-6 mr-3 text-blue-500" />
            O'tkazma qilish
          </h3>

          <form onSubmit={handleTransferInit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qabul qiluvchining ID raqami
              </label>
              <input
                type="text"
                placeholder="Masalan: S-8393"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase font-mono text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                O'tkaziladigan summa (PP)
              </label>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-lg"
              />
            </div>

            {error && !isPinModalOpen && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center text-sm font-medium">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center text-lg shadow-lg shadow-blue-500/30"
            >
              Davom etish
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>

        {/* 3. Tranzaksiyalar Tarixi */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-xl flex items-center mb-6 dark:text-white">
            <History className="w-6 h-6 mr-3 text-gray-500" />
            Tarix
          </h3>
          
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    tx.type === 'in' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'in' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{tx.name}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${tx.type === 'in' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {tx.type === 'in' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PIN-KOD MODAL OYNASI */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-6 text-center relative">
              <button 
                onClick={() => { setIsPinModalOpen(false); setPin(""); setError(""); }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold dark:text-white mb-2">Tasdiqlash</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                <span className="font-bold text-gray-900 dark:text-white">{amount} PP</span> miqdoridagi pulni o'tkazish uchun 4 xonali PIN kodingizni kiriting.
              </p>

              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Faqat raqamlar
                className="w-full text-center text-4xl tracking-[1em] py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono mb-4"
              />

              {error && (
                <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>
              )}

              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4 || isProcessing}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

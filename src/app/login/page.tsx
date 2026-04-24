"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockUsers } from "@/lib/mockData";
import { BookOpen, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Kiritilgan ID ni qolipsizlashtirish (probel va kichik harflarni to'g'rilash)
    const formattedId = userId.trim().toUpperCase();

    // ID ga qarab rolini tezkor aniqlash (Faqat xato yozilishining oldini olish uchun)
    if (!formattedId.startsWith("D-") && !formattedId.startsWith("T-") && !formattedId.startsWith("S-")) {
      setError("Noto'g'ri ID formati. (Masalan: S-8392)");
      setIsLoading(false);
      return;
    }

    // Soxta bazadan qidirish (mockData)
    // Haqiqiy loyihada bu yerda Supabase ga so'rov ketadi
    setTimeout(() => {
      const user = mockUsers.find((u) => u.id === formattedId);

      if (!user) {
        setError("Bunday ID raqamli foydalanuvchi topilmadi.");
        setIsLoading(false);
        return;
      }

      if (password !== "1234") { // Hozircha hamma uchun test parol 1234
        setError("Noto'g'ri parol kiritildi. (Test parol: 1234)");
        setIsLoading(false);
        return;
      }

      // Login muvaffaqiyatli! Roliga qarab yo'naltirish:
      if (user.role === "student") {
        router.push("/student/dashboard");
      } else {
        // Director va Moderatorlar (O'qituvchilar) bitta panelga boradi
        router.push("/teacher/dashboard");
      }
    }, 1000); // 1 soniya o'ylanib turish effekti (UX uchun)
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Tepa qism: Logo va Sarlavha */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="mx-auto bg-white/10 w-16 h-16 flex items-center justify-center rounded-xl mb-4 backdrop-blur-sm border border-white/20">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ELITA eMAKTAB</h1>
          <p className="text-slate-400 text-sm mt-1">Yopiq ta'lim va moliya platformasi</p>
        </div>

        {/* Asosiy Forma */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shaxsiy ID Raqam
              </label>
              <input
                type="text"
                placeholder="Masalan: S-8392"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all uppercase placeholder:normal-case"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parol
              </label>
              <input
                type="password"
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Xatolik xabari joyi */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center text-sm border border-red-100 dark:border-red-800">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Kirish...
                </>
              ) : (
                "Tizimga kirish"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              *Tizimga kirish huquqi faqat maktab rahbariyati tomonidan tasdiqlangan ID orqali amalga oshiriladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { mockUsers, mockTimetable } from "@/lib/mockData";
import { Wallet, Clock, Bell, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  // Hozircha statik ravishda bitta o'quvchini (Kiyotakani) olamiz
  const user = mockUsers.find(u => u.id === "S-8392");
  const nextClass = mockTimetable[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Xush kelibsiz va Balans kartochkasi */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h2 className="text-slate-300 mb-1">Xush kelibsiz,</h2>
          <h1 className="text-3xl font-bold mb-6">{user?.name}</h1>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 inline-block border border-white/20">
            <p className="text-slate-300 text-sm mb-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
              Joriy Balans (PP)
            </p>
            <div className="text-4xl font-extrabold tracking-tight">
              {user?.balancePP?.toLocaleString()} <span className="text-lg text-slate-300 font-normal">PP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 2. Keyingi Dars Vidjeti */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center dark:text-white">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Keyingi Dars
            </h3>
            <Link href="/student/timetable" className="text-sm text-blue-500 hover:underline">
              Jadvalni ko'rish
            </Link>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-xl text-blue-900 dark:text-blue-100">{nextClass?.subject}</p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">{nextClass?.teacher}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-900 dark:text-blue-100">{nextClass?.time}</p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">{nextClass?.room}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. So'nggi Faolliklar (Tarix) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-bold text-lg flex items-center mb-4 dark:text-white">
            <Bell className="w-5 h-5 mr-2 text-orange-500" />
            So'nggi faollik
          </h3>
          <div className="space-y-4">
            
            <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-gray-50 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mr-4">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-gray-200">ID: T-1045 dan PP qabul qilindi</p>
                <p className="text-xs text-gray-500">+ 5,000 PP</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-gray-50 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mr-4">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-gray-200">Matematika bahosi yangilandi</p>
                <p className="text-xs text-gray-500">Baho: 5</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

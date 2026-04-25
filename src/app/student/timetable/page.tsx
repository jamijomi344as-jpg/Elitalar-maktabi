"use client";

import { useState } from "react";
import { mockTimetable } from "@/lib/mockData";
import { Calendar, Clock, MapPin, User as UserIcon, BookOpen, CheckCircle, AlertCircle } from "lucide-react";

const WEEKDAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

export default function TimetablePage() {
  // Hozirgi tanlangan kun (Boshlang'ich qiymat: Dushanba)
  const [activeDay, setActiveDay] = useState("Dushanba");

  // Faqat tanlangan kundagi darslarni ajratib olish
  const todaysClasses = mockTimetable.filter(c => c.day === activeDay);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Sahifa Sarlavhasi */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-blue-500" />
            Dars Jadvali
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Joriy hafta uchun tasdiqlangan jadval</p>
        </div>
      </div>

      {/* 2. Kunlar menyusi (Tabs) */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2 min-w-max">
          {WEEKDAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeDay === day
                  ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Darslar ro'yxati */}
      <div className="space-y-4">
        {todaysClasses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Bu kunda darslar yo'q</h3>
            <p className="text-gray-500 dark:text-gray-400">Dam olish kuni yoki jadval hali kiritilmagan.</p>
          </div>
        ) : (
          todaysClasses.map((cls, index) => (
            <div 
              key={cls.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col xl:flex-row gap-6 items-start xl:items-center relative overflow-hidden transition-all hover:shadow-md"
            >
              {/* Chap qism: Vaqt va Fan nomi */}
              <div className="flex items-center gap-6 xl:w-1/3 z-10">
                <div className="flex flex-col items-center justify-center min-w-[100px] h-full border-r border-gray-100 dark:border-slate-800 pr-6">
                  <div className="text-xl font-black text-gray-900 dark:text-white">{cls.time.split(' - ')[0]}</div>
                  <div className="text-sm font-medium text-gray-400">{cls.time.split(' - ')[1]}</div>
                  <div className="mt-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
                    {index + 1}-dars
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cls.subject}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <UserIcon className="w-4 h-4 mr-2" />
                    {cls.teacher}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {cls.room}
                  </div>
                </div>
              </div>

              {/* O'rta qism: Uy vazifasi */}
              <div className="xl:w-1/3 z-10 bg-blue-50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/10 w-full">
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Uy vazifasi</div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {cls.homework || "Vazifa kiritilmagan"}
                </p>
              </div>

              {/* O'ng qism: Baho */}
              <div className="xl:w-1/3 flex justify-end w-full z-10">
                {cls.grade ? (
                  <div className="flex items-center bg-green-50 dark:bg-green-500/10 px-6 py-4 rounded-2xl border border-green-100 dark:border-green-500/20">
                    <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
                    <div>
                      <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Baho</div>
                      <div className="text-3xl font-black text-green-700 dark:text-green-300">{cls.grade}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center bg-orange-50 dark:bg-orange-500/10 px-6 py-4 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                    <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      Baho qo'yilmagan
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

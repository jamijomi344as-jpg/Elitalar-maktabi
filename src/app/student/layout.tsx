"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, BookA, Trophy } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Yon panel menyulari ro'yxati
  const menuItems = [
    { 
      name: "Asosiy", 
      icon: LayoutDashboard, 
      path: "/student/dashboard" 
    },
    { 
      name: "Hamyon (PP)", 
      icon: Wallet, 
      path: "/student/wallet" 
    },
    { 
      name: "Ta'lim", 
      icon: BookA, 
      path: "/student/education" 
    },
    { 
      name: "Reyting", 
      icon: Trophy, 
      path: "/student/ranking" 
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. CHAP TOMON: YON PANEL (SIDEBAR) */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen flex-shrink-0 z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
            E
          </div>
          <span className="text-xl font-black tracking-widest text-slate-900">ELITA</span>
        </div>

        <div className="p-4 flex flex-col gap-2 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.name} href={item.path}>
                <div
                  className={`flex items-center px-4 py-3.5 rounded-xl font-bold text-[15px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. O'NG TOMON: ASOSIY SAHIFALAR CHIQADIGAN JOY (Mana shu joy yo'qolib qolgan edi!) */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        {children}
      </div>

    </div>
  );
}

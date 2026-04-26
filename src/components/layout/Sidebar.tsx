"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Calendar, Trophy, LogOut } from "lucide-react";

const navItems = [
  { name: "Asosiy", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Hamyon (PP)", href: "/student/wallet", icon: Wallet },
  { name: "Dars Jadvali", href: "/student/ta'lim", icon: Calendar },
  { name: "Sinf Reytingi", href: "/student/rankings", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 fixed left-0 top-0 z-40">
      {/* Logotip qismi */}
      <div className="p-6 flex items-center">
        <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wider">ELITA</h2>
      </div>
      
      {/* Menyu tugmalari */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-slate-900 text-white dark:bg-blue-600 shadow-md" 
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Chiqish tugmasi */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <Link 
          href="/login"
          className="flex items-center px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Chiqish</span>
        </Link>
      </div>
    </aside>
  );
}

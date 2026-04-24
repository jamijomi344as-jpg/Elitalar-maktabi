"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Calendar, Trophy } from "lucide-react";

const navItems = [
  { name: "Asosiy", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Hamyon", href: "/student/wallet", icon: Wallet },
  { name: "Jadval", href: "/student/timetable", icon: Calendar },
  { name: "Reyting", href: "/student/rankings", icon: Trophy },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              <div className={`p-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-slate-100 dark:bg-slate-800" : ""}`}>
                <Icon className={`w-6 h-6 ${isActive ? "text-slate-900 dark:text-blue-500" : "text-gray-400 dark:text-gray-500"}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-slate-900 dark:text-blue-500" : "text-gray-400 dark:text-gray-500"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

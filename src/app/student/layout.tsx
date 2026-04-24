import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/layout/TopBar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      {/* Chap tomondagi menyu (Faqat kompyuterda ko'rinadi) */}
      <Sidebar />

      {/* O'ng tomondagi asosiy qism (Menyudan qolgan joyni egallaydi) */}
      <div className="flex-1 flex flex-col md:ml-64 relative pb-16 md:pb-0">
        
        {/* Tepadagi qism */}
        <TopBar />

        {/* Bu yerda o'zgarib turadigan sahifalar (Dushbord, Hamyon, Jadval) ochiladi */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

        {/* Pastki menyu (Faqat telefonda ko'rinadi) */}
        <BottomNav />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Chiroyli xabarnomalar uchun

// Sayt shriftini o'rnatish
const inter = Inter({ subsets: ["latin"] });

// Saytning SEO va brauzer tepadagi nomi
export const metadata: Metadata = {
  title: "Elita eMaktab",
  description: "Yopiq ta'lim va moliya platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="light">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        {/* Butun sayt sahifalari shu yerda ochiladi */}
        {children}
        
        {/* Tizimdagi xabarnomalar (Masalan: "Pul o'tkazildi") uchun qobiq */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

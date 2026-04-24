import { redirect } from "next/navigation";

export default function Home() {
  // Saytning asosiy manziliga kirgan foydalanuvchini 
  // avtomatik ravishda Login sahifasiga yo'naltiramiz
  redirect("/login");
}

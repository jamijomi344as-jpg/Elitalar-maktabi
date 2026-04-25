// 1. Rollar va Foydalanuvchilar (Prefiksli ID lar bilan)
export const mockUsers = [
  {
    id: "D-0001",
    name: "Tursunov Ergashali",
    role: "director",
  },
  {
    id: "T-1045",
    name: "Ismailova Yulduz",
    role: "moderator",
    assignedClass: "10-A",
  },
  {
    id: "S-8392",
    name: "Kiyotaka Ayanokoji",
    role: "student",
    class: "10-A",
    balancePP: 100000,
  },
  {
    id: "S-8393",
    name: "Suzune Horikita",
    role: "student",
    class: "10-A",
    balancePP: 100000,
  },
];

// 2. Sinf Reytinglari (S-Tizimi)
export const mockClasses = [
  { className: "10-A", pointsCP: 1004 },
  { className: "10-B", pointsCP: 650 },
  { className: "10-C", pointsCP: 492 },
  { className: "10-D", pointsCP: 0 },
];

// 3. Haftalik Dars Jadvali 
export const mockTimetable = [
  {
    id: 1,
    day: "Dushanba",
    subject: "Matematika",
    teacher: "Ismailova Yulduz",
    room: "302-xona",
    time: "08:00 - 08:45",
    grade: 5,
    homework: "Tenglamalar",
  },
  {
    id: 2,
    day: "Dushanba",
    subject: "Fizika",
    teacher: "Hakimov X.",
    room: "104-xona",
    time: "08:50 - 09:35",
    grade: null, 
    homework: "Nyuton qonunlari",
  },
];

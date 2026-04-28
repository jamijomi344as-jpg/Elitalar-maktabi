export type LessonRequest = {
  className: string;
  subject: string;
  teacherId: string;
  hoursPerWeek: number;
};

export type TimetableCell = { subject: string; teacherId: string } | null;
export type Timetable = Record<string, Record<number, Record<string, TimetableCell>>>;

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
// 7-soat butunlay olib tashlandi, faqat 6 soat!
const PERIODS = [1, 2, 3, 4, 5, 6]; 

export function generateTimetable(lessonRequests: LessonRequest[]): any[] {
  const timetable: Timetable = {};
  
  for (const day of DAYS) {
    timetable[day] = {};
    for (const period of PERIODS) { timetable[day][period] = {}; }
  }

  let allLessons: { className: string; subject: string; teacherId: string }[] = [];
  for (const req of lessonRequests) {
    for (let i = 0; i < req.hoursPerWeek; i++) {
      allLessons.push({ className: req.className, subject: req.subject, teacherId: req.teacherId });
    }
  }

  // Optimal jadval tuzish uchun darslar aralashtiriladi
  allLessons = allLessons.sort(() => Math.random() - 0.5);

  const finalSchedule: any[] = [];

  for (const lesson of allLessons) {
    let placed = false;

    for (const day of DAYS) {
      if (placed) break;

      // ==========================================
      // YAngi QOIDA: Ustoz bir kunda maksimal 4 soat dars o'tadi
      // ==========================================
      let teacherDailyHours = 0;
      for (const p of PERIODS) {
        for (const cls in timetable[day][p]) {
          if (timetable[day][p][cls]?.teacherId === lesson.teacherId) {
            teacherDailyHours++;
          }
        }
      }
      // Agar o'qituvchining bu kundagi darsi 4 soatga yetgan bo'lsa, bu kunni o'tkazib yuboramiz!
      if (teacherDailyHours >= 4) continue;

      for (const period of PERIODS) {
        if (placed) break;

        // Sinf bu soatda bo'shmi?
        if (timetable[day][period][lesson.className]) continue;
        
        // Ustoz boshqa sinfda band emasmi?
        let teacherBusy = false;
        for (const cls in timetable[day][period]) {
          if (timetable[day][period][cls]?.teacherId === lesson.teacherId) {
            teacherBusy = true; break;
          }
        }
        if (teacherBusy) continue;

        // YAngi QOIDA: Darslar orasi (Oyna) 2 soatdan oshib ketmadimi?
        if (!isTeacherGapValid(timetable, day, period, lesson.teacherId)) continue;

        // Barcha qoidalardan o'tdi -> Joylaymiz!
        timetable[day][period][lesson.className] = { subject: lesson.subject, teacherId: lesson.teacherId };
        finalSchedule.push({
          class_name: lesson.className,
          day_of_week: day,
          lesson_number: period,
          subject: lesson.subject,
          teacher_id: lesson.teacherId,
          room: "Belgilanmagan"
        });
        placed = true;
      }
    }
    if (!placed) {
      console.warn(`Ogohlantirish: ${lesson.className} ga ${lesson.subject} darsini tiqishga joy yetmadi!`);
    }
  }

  return finalSchedule;
}

// "Oyna" (Darssiz qolish) vaqtini nazorat qilish
function isTeacherGapValid(timetable: Timetable, targetDay: string, targetPeriod: number, teacherId: string): boolean {
  const teacherPeriods: number[] = [];
  
  for (const p of PERIODS) {
    let hasLesson = false;
    for (const cls in timetable[targetDay][p]) {
      if (timetable[targetDay][p][cls]?.teacherId === teacherId) { hasLesson = true; break; }
    }
    if (hasLesson) teacherPeriods.push(p);
  }

  // Agar bu kun hali hech qanday darsi bo'lmasa, ixtiyoriy vaqtga qo'yish mumkin (oyna qoidasi buzilmaydi)
  if (teacherPeriods.length === 0) return true;

  // Darslarni ketma-ketlikda taxlaymiz
  const proposedPeriods = [...teacherPeriods, targetPeriod].sort((a, b) => a - b);
  let maxGap = 0;
  
  for (let i = 0; i < proposedPeriods.length - 1; i++) {
    const gap = proposedPeriods[i + 1] - proposedPeriods[i] - 1;
    if (gap > maxGap) maxGap = gap;
  }

  // Oyna maksimal 2 soat bo'lishiga ruxsat!
  return maxGap <= 2; 
}

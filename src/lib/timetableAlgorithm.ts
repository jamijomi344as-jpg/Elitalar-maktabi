export type LessonRequest = {
  className: string;
  subject: string;
  teacherId: string;
  hoursPerWeek: number;
};

export type TimetableCell = { subject: string; teacherId: string } | null;
export type Timetable = Record<string, Record<number, Record<string, TimetableCell>>>;

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const PERIODS = [1, 2, 3, 4, 5, 6]; // Faqat 6 soat qoldirilgan

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

  // Darslarni aralashtiramiz
  allLessons = allLessons.sort(() => Math.random() - 0.5);

  const finalSchedule: any[] = [];

  for (const lesson of allLessons) {
    let placed = false;

    // 1-QOIDA: Kunlarni tartiblash (Sochish va Muvozanat algoritmi)
    const sortedDays = [...DAYS].sort((dayA, dayB) => {
      let subjCountA = 0; let subjCountB = 0;
      let totalCountA = 0; let totalCountB = 0;

      for (const p of PERIODS) {
        if (timetable[dayA][p][lesson.className]) totalCountA++;
        if (timetable[dayB][p][lesson.className]) totalCountB++;
        if (timetable[dayA][p][lesson.className]?.subject === lesson.subject) subjCountA++;
        if (timetable[dayB][p][lesson.className]?.subject === lesson.subject) subjCountB++;
      }

      // 1. Eng avvalo: Shu fandan darsi YO'Q kunlarga ustunlik beramiz (Turli kunlarga sochish uchun)
      if (subjCountA !== subjCountB) {
        return subjCountA - subjCountB; 
      }
      // 2. Agar fanlar soni teng bo'lsa, darsi umuman KAMOQ kunni tanlaymiz (Kunlik 5 soat muvozanati uchun)
      return totalCountA - totalCountB;
    });

    for (const day of sortedDays) {
      if (placed) break;

      // Bu kunda ushbu fandan qaysi soatlarda dars borligini topamiz
      let existingPeriodsWithSubject: number[] = [];
      for (const p of PERIODS) {
        if (timetable[day][p][lesson.className]?.subject === lesson.subject) {
          existingPeriodsWithSubject.push(p);
        }
      }

      // 2-QOIDA: Algebra / Geometriya maksimal 1 soat, Boshqalari maksimal 2 soat
      const isMath = lesson.subject.toLowerCase().includes("algebra") || lesson.subject.toLowerCase().includes("geometriya");
      if (isMath && existingPeriodsWithSubject.length >= 1) continue;
      if (!isMath && existingPeriodsWithSubject.length >= 2) continue;

      // 3-QOIDA: O'qituvchi kuniga maksimal 4 soat dars o'tadi
      let teacherDailyHours = 0;
      for (const p of PERIODS) {
        for (const cls in timetable[day][p]) {
          if (timetable[day][p][cls]?.teacherId === lesson.teacherId) {
            teacherDailyHours++;
          }
        }
      }
      if (teacherDailyHours >= 4) continue;

      for (const period of PERIODS) {
        if (placed) break;

        // Sinf shu soatda bo'shmi?
        if (timetable[day][period][lesson.className]) continue;

        // ==========================================
        // 4-QOIDA: KETMA-KETLIK (Consecutive rule)
        // Agar bir kunda shu fandan 1 ta bo'lsa, ikkinchisi faqat yoniga qo'yilishi shart!
        // ==========================================
        if (existingPeriodsWithSubject.length === 1) {
          const existingPeriod = existingPeriodsWithSubject[0];
          // Agar tanlanayotgan soat va oldingi dars soati orasi 1 ga teng bo'lmasa (yonma-yon bo'lmasa)
          if (Math.abs(existingPeriod - period) !== 1) {
            continue; // Boshqa dars aralashmasligi uchun buni o'tkazib yuboramiz
          }
        }

        // O'qituvchi boshqa sinfda dars o'tmayaptimi?
        let teacherBusy = false;
        for (const cls in timetable[day][period]) {
          if (timetable[day][period][cls]?.teacherId === lesson.teacherId) {
            teacherBusy = true; break;
          }
        }
        if (teacherBusy) continue;

        // 5-QOIDA: O'qituvchining oynasi 2 soatdan oshmadimi?
        if (!isTeacherGapValid(timetable, day, period, lesson.teacherId)) continue;

        // HAMMA QOIDALARDAN O'TDI -> JADVALGA Yozamiz!
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
      console.warn(`Diqqat: ${lesson.className} ga ${lesson.subject} darsini qo'yishni iloji bo'lmadi (Qoidalar haddan tashqari qat'iy).`);
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

  if (teacherPeriods.length === 0) return true;

  const proposedPeriods = [...teacherPeriods, targetPeriod].sort((a, b) => a - b);
  let maxGap = 0;
  
  for (let i = 0; i < proposedPeriods.length - 1; i++) {
    const gap = proposedPeriods[i + 1] - proposedPeriods[i] - 1;
    if (gap > maxGap) maxGap = gap;
  }

  return maxGap <= 2; 
}

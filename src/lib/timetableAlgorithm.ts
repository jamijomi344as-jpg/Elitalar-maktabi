export type LessonRequest = {
  className: string;
  subject: string;
  teacherId: string;
  hoursPerWeek: number;
  groupType: string;
};

export type TimetableCell = { subject: string; teacherId: string; groupType: string };
export type Timetable = Record<string, Record<number, Record<string, TimetableCell[]>>>;

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export function generateTimetable(lessonRequests: LessonRequest[]): any[] {
  const timetable: Timetable = {};
  for (const day of DAYS) {
    timetable[day] = {};
    for (const period of PERIODS) { timetable[day][period] = {}; }
  }

  // Darslarni "Blok"larga birlashtirish 
  type LessonBlock = { className: string; subject: string; hours: number; parts: { teacherId: string, groupType: string }[] };
  const blocksMap = new Map<string, LessonBlock>();
  
  for (const req of lessonRequests) {
    const key = `${req.className}-${req.subject}`;
    if (!blocksMap.has(key)) {
        blocksMap.set(key, { className: req.className, subject: req.subject, hours: req.hoursPerWeek, parts: [] });
    }
    blocksMap.get(key)!.parts.push({ teacherId: req.teacherId, groupType: req.groupType });
  }

  let allSlots: LessonBlock[] = [];
  for (const block of Array.from(blocksMap.values())) {
    for (let i = 0; i < block.hours; i++) {
        allSlots.push({ ...block }); 
    }
  }

  const kelajakSlots = allSlots.filter(s => s.subject === "Kelajak soati");
  const normalSlots = allSlots.filter(s => s.subject !== "Kelajak soati");

  const finalSchedule: any[] = [];

  // ==========================================
  // 1-QADAM: KELAJAK SOATINI DUSHANBA 1-SOATGA QAT'IY JOYLASHTIRISH
  // ==========================================
  for (const slot of kelajakSlots) {
    if (!timetable["Du"][1][slot.className]) timetable["Du"][1][slot.className] = [];
    for (const part of slot.parts) {
        timetable["Du"][1][slot.className].push({ subject: slot.subject, teacherId: part.teacherId, groupType: part.groupType });
        finalSchedule.push({
          class_name: slot.className,
          day_of_week: "Du",
          lesson_number: 1,
          subject: slot.subject,
          teacher_id: part.teacherId,
          group_type: part.groupType,
          room: "Belgilanmagan"
        });
    }
  }

  // ==========================================
  // 2-QADAM: QOLGAN DARSLAR (O'QUVCHILAR UCHUN OYNA QOLDIRMASLIK)
  // ==========================================
  normalSlots.sort((a, b) => b.parts.length - a.parts.length);

  for (const slot of normalSlots) {
    let placed = false;

    const sortedDays = [...DAYS].sort((dayA, dayB) => {
      let countA = 0; let countB = 0;
      let subjA = 0; let subjB = 0;
      for (const p of PERIODS) {
        if (timetable[dayA][p][slot.className] && timetable[dayA][p][slot.className].length > 0) countA++;
        if (timetable[dayB][p][slot.className] && timetable[dayB][p][slot.className].length > 0) countB++;
        if (timetable[dayA][p][slot.className]?.some(c => c.subject === slot.subject)) subjA++;
        if (timetable[dayB][p][slot.className]?.some(c => c.subject === slot.subject)) subjB++;
      }
      if (subjA !== subjB) return subjA - subjB;
      return countA - countB;
    });

    for (const day of sortedDays) {
      if (placed) break;

      // 🚨 O'QUVCHILAR UCHUN OYNA (BO'SHLIQ) QOLDIRMASLIK ALGORITMI
      let nextPeriod = 1;
      while (nextPeriod <= 6 && timetable[day][nextPeriod][slot.className] && timetable[day][nextPeriod][slot.className].length > 0) {
        nextPeriod++;
      }

      if (nextPeriod > 6) continue; // Bu kunda sinf uchun umuman joy qolmadi
      if (day === "Du" && nextPeriod === 1) nextPeriod = 2; // Dushanba 1-soat "Kelajak soati"ga band!

      const period = nextPeriod; // Dars faqatgina aynan shu navbatdagi soatga tushishi SHART

      let subjCount = 0;
      for(const p of PERIODS) {
          if (timetable[day][p][slot.className]?.some(c => c.subject === slot.subject)) subjCount++;
      }
      const isMath = slot.subject.toLowerCase().includes("algebra") || slot.subject.toLowerCase().includes("geometriya");
      if (isMath && subjCount >= 1) continue; 
      if (!isMath && subjCount >= 2) continue;
      
      if (subjCount === 1) {
         const prevPeriodHasIt = timetable[day][period - 1]?.[slot.className]?.some(c => c.subject === slot.subject);
         if (!prevPeriodHasIt) continue; 
      }

      let teachersBusy = false;
      for (const part of slot.parts) {
         for (const cls in timetable[day][period]) {
            if (timetable[day][period][cls]?.some(c => c.teacherId === part.teacherId)) {
               teachersBusy = true; break;
            }
         }
         if (teachersBusy) break;

         let teacherDailyHours = 0;
         for (const p of PERIODS) {
           for (const cls in timetable[day][p]) {
             if (timetable[day][p][cls]?.some(c => c.teacherId === part.teacherId)) teacherDailyHours++;
           }
         }
         if (teacherDailyHours >= 6) { teachersBusy = true; break; }

         if (!isTeacherGapValid(timetable, day, period, part.teacherId)) { teachersBusy = true; break; }
      }

      if (teachersBusy) continue; // O'qituvchi band bo'lsa, ertasi kunga o'tib ko'radi

      if (!timetable[day][period][slot.className]) timetable[day][period][slot.className] = [];
      for (const part of slot.parts) {
         timetable[day][period][slot.className].push({ subject: slot.subject, teacherId: part.teacherId, groupType: part.groupType });
         finalSchedule.push({
           class_name: slot.className,
           day_of_week: day,
           lesson_number: period,
           subject: slot.subject,
           teacher_id: part.teacherId,
           group_type: part.groupType,
           room: "Belgilanmagan"
         });
      }
      placed = true;
    }
  }

  return finalSchedule;
}

function isTeacherGapValid(timetable: Timetable, targetDay: string, targetPeriod: number, teacherId: string): boolean {
  const teacherPeriods: number[] = [];
  const PERIODS = [1, 2, 3, 4, 5, 6];
  for (const p of PERIODS) {
    let hasLesson = false;
    for (const cls in timetable[targetDay][p]) {
      if (timetable[targetDay][p][cls]?.some(c => c.teacherId === teacherId)) { hasLesson = true; break; }
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

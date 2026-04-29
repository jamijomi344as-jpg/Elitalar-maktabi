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

  // 1. Darslarni "Blok"larga birlashtirish (Bir xil sinf va bir xil fanni biriktirish)
  // Bu guruhlarga bo'lingan darslarni (masalan: 1-guruh va 2-guruh) bir soatda bo'lishini kafolatlaydi!
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
  for (const block of blocksMap.values()) {
    for (let i = 0; i < block.hours; i++) {
        allSlots.push({ ...block }); // Soatiga qarab ko'paytirish
    }
  }

  // Kelajak soati va odatiy darslarni alohida ajratib olamiz
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
  // 2-QADAM: QOLGAN DARSLARNI JOYLASHTIRISH
  // ==========================================
  // Guruhga bo'lingan darslarni birinchi joylashtirish (chunki ular ko'proq ustozni band qiladi)
  normalSlots.sort((a, b) => b.parts.length - a.parts.length);

  for (const slot of normalSlots) {
    let placed = false;

    // Kunlarni teng taqsimlash uchun saralash
    const sortedDays = [...DAYS].sort((dayA, dayB) => {
      let subjCountA = 0; let subjCountB = 0;
      let totalCountA = 0; let totalCountB = 0;
      for (const p of PERIODS) {
        if (timetable[dayA][p][slot.className]) totalCountA += timetable[dayA][p][slot.className].length;
        if (timetable[dayB][p][slot.className]) totalCountB += timetable[dayB][p][slot.className].length;
        if (timetable[dayA][p][slot.className]?.some(c => c.subject === slot.subject)) subjCountA++;
        if (timetable[dayB][p][slot.className]?.some(c => c.subject === slot.subject)) subjCountB++;
      }
      if (subjCountA !== subjCountB) return subjCountA - subjCountB; 
      return totalCountA - totalCountB;
    });

    for (const day of sortedDays) {
      if (placed) break;

      let existingPeriodsWithSubject: number[] = [];
      for (const p of PERIODS) {
        if (timetable[day][p][slot.className]?.some(c => c.subject === slot.subject)) {
          existingPeriodsWithSubject.push(p);
        }
      }

      // Aniq fanlar bir kunda 1 martadan oshmasligi, qolganlar 2 martadan oshmasligi kerak
      const isMath = slot.subject.toLowerCase().includes("algebra") || slot.subject.toLowerCase().includes("geometriya");
      if (isMath && existingPeriodsWithSubject.length >= 1) continue; 
      if (!isMath && existingPeriodsWithSubject.length >= 2) continue;

      for (const period of PERIODS) {
        if (placed) break;

        // Dushanba 1-soatga umuman tegilmaydi!
        if (day === "Du" && period === 1) continue;

        // Ikkita ketma-ket fan bo'lsa, yonma-yon bo'lishi shart
        if (existingPeriodsWithSubject.length === 1) {
          if (Math.abs(existingPeriodsWithSubject[0] - period) !== 1) continue;
        }

        // Agar bu soatda sinf band bo'lsa, joylash mumkin emas
        const classCell = timetable[day][period][slot.className] || [];
        if (classCell.length > 0) continue; 

        // IKKALA O'QITUVCHI HAM BO'SHLIGINI TEKSHIRISH
        let teachersBusy = false;
        for (const part of slot.parts) {
            for (const cls in timetable[day][period]) {
                if (timetable[day][period][cls]?.some(c => c.teacherId === part.teacherId)) {
                    teachersBusy = true;
                    break;
                }
            }
            if (teachersBusy) break;

            let teacherDailyHours = 0;
            for (const p of PERIODS) {
              for (const cls in timetable[day][p]) {
                if (timetable[day][p][cls]?.some(c => c.teacherId === part.teacherId)) teacherDailyHours++;
              }
            }
            if (teacherDailyHours >= 5) { teachersBusy = true; break; } // Kunlik 5 soat limit

            if (!isTeacherGapValid(timetable, day, period, part.teacherId)) { teachersBusy = true; break; }
        }

        if (teachersBusy) continue;

        // Agar hamma shartlardan o'tsa -> BUTUN BLOKNI (ikkala ustozni ham) bitta soatga yozamiz
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

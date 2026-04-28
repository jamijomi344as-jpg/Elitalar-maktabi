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

  let allLessons: { className: string; subject: string; teacherId: string; groupType: string }[] = [];
  for (const req of lessonRequests) {
    for (let i = 0; i < req.hoursPerWeek; i++) {
      allLessons.push({ className: req.className, subject: req.subject, teacherId: req.teacherId, groupType: req.groupType });
    }
  }

  // Darslarni aralashtirish va KELAJAK SOATI ni eng birinchiga o'tkazish (To'qnashuv bo'lmasligi uchun)
  allLessons = allLessons.sort(() => Math.random() - 0.5);
  allLessons.sort((a, b) => (a.subject === "Kelajak soati" ? -1 : (b.subject === "Kelajak soati" ? 1 : 0)));

  const finalSchedule: any[] = [];

  for (const lesson of allLessons) {
    let placed = false;

    const sortedDays = [...DAYS].sort((dayA, dayB) => {
      let subjCountA = 0; let subjCountB = 0;
      let totalCountA = 0; let totalCountB = 0;
      for (const p of PERIODS) {
        if (timetable[dayA][p][lesson.className]) totalCountA += timetable[dayA][p][lesson.className].length;
        if (timetable[dayB][p][lesson.className]) totalCountB += timetable[dayB][p][lesson.className].length;
        if (timetable[dayA][p][lesson.className]?.some(c => c.subject === lesson.subject)) subjCountA++;
        if (timetable[dayB][p][lesson.className]?.some(c => c.subject === lesson.subject)) subjCountB++;
      }
      if (subjCountA !== subjCountB) return subjCountA - subjCountB; 
      return totalCountA - totalCountB;
    });

    for (const day of sortedDays) {
      if (placed) break;

      // 1. KELAJAK SOATI QOIDASI (Faqat Dushanba, 1-soat)
      if (lesson.subject === "Kelajak soati" && day !== "Du") continue;

      let existingPeriodsWithSubject: number[] = [];
      for (const p of PERIODS) {
        if (timetable[day][p][lesson.className]?.some(c => c.subject === lesson.subject && c.groupType === lesson.groupType)) {
          existingPeriodsWithSubject.push(p);
        }
      }

      const isMath = lesson.subject.toLowerCase().includes("algebra") || lesson.subject.toLowerCase().includes("geometriya");
      if (isMath && existingPeriodsWithSubject.length >= 1) continue;
      if (!isMath && existingPeriodsWithSubject.length >= 2) continue;

      let teacherDailyHours = 0;
      for (const p of PERIODS) {
        for (const cls in timetable[day][p]) {
          if (timetable[day][p][cls]?.some(c => c.teacherId === lesson.teacherId)) teacherDailyHours++;
        }
      }
      if (teacherDailyHours >= 4) continue;

      for (const period of PERIODS) {
        if (placed) break;

        // KELAJAK SOATI faqat 1-soatga tushadi
        if (lesson.subject === "Kelajak soati" && period !== 1) continue;

        if (existingPeriodsWithSubject.length === 1) {
          if (Math.abs(existingPeriodsWithSubject[0] - period) !== 1) continue;
        }

        // =====================================
        // SINF GURUHLARIGA BO'LINISHINI NAZORAT QILISH
        // =====================================
        if (!timetable[day][period][lesson.className]) timetable[day][period][lesson.className] = [];
        const currentCell = timetable[day][period][lesson.className];
        
        let isClassBusy = false;
        if (currentCell.length > 0) {
            if (lesson.groupType === 'Barchasi' || currentCell.some(c => c.groupType === 'Barchasi')) {
                isClassBusy = true; 
            } else {
                const hasSameGroup = currentCell.some(c => c.groupType === lesson.groupType);
                const hasGroup1 = currentCell.some(c => c.groupType === '1-guruh');
                const hasGroup2 = currentCell.some(c => c.groupType === '2-guruh');
                const hasBoys = currentCell.some(c => c.groupType === 'O\'g\'il bolalar');
                const hasGirls = currentCell.some(c => c.groupType === 'Qizlar');

                if (hasSameGroup) isClassBusy = true;
                else if (lesson.groupType === '1-guruh' && (hasBoys || hasGirls)) isClassBusy = true;
                else if (lesson.groupType === '2-guruh' && (hasBoys || hasGirls)) isClassBusy = true;
                else if (lesson.groupType === 'O\'g\'il bolalar' && (hasGroup1 || hasGroup2)) isClassBusy = true;
                else if (lesson.groupType === 'Qizlar' && (hasGroup1 || hasGroup2)) isClassBusy = true;
            }
        }
        if (isClassBusy) continue;

        // O'QITUVCHI BO'SHMI?
        let teacherBusy = false;
        for (const cls in timetable[day][period]) {
          if (timetable[day][period][cls]?.some(c => c.teacherId === lesson.teacherId)) {
            teacherBusy = true; break;
          }
        }
        if (teacherBusy) continue;

        // OYNA QOIDASI (2 soatdan oshmasligi)
        if (!isTeacherGapValid(timetable, day, period, lesson.teacherId)) continue;

        // HAMMASI YAXSHI -> JADVALGA JOYLAYMIZ!
        timetable[day][period][lesson.className].push({ subject: lesson.subject, teacherId: lesson.teacherId, groupType: lesson.groupType });
        finalSchedule.push({
          class_name: lesson.className,
          day_of_week: day,
          lesson_number: period,
          subject: lesson.subject,
          teacher_id: lesson.teacherId,
          group_type: lesson.groupType,
          room: "Belgilanmagan"
        });
        placed = true;
      }
    }
  }

  return finalSchedule;
}

function isTeacherGapValid(timetable: Timetable, targetDay: string, targetPeriod: number, teacherId: string): boolean {
  const teacherPeriods: number[] = [];
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

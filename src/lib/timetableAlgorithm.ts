export type LessonRequest = {
  className: string;
  subject: string;
  teacherId: string;
  hoursPerWeek: number;
};

export type TimetableCell = { subject: string; teacherId: string } | null;
export type Timetable = Record<string, Record<number, Record<string, TimetableCell>>>;

const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

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

  // Darslarni tasodifiy aralashtirish (Optimal variant topish osonlashadi)
  allLessons = allLessons.sort(() => Math.random() - 0.5);

  const finalSchedule: any[] = [];

  for (const lesson of allLessons) {
    let placed = false;

    for (const day of DAYS) {
      if (placed) break;
      for (const period of PERIODS) {
        if (placed) break;

        // 1. Sinf shu soatda bo'shmi?
        if (timetable[day][period][lesson.className]) continue;
        
        // 2. Ustoz shu soatda boshqa sinfda bandmi?
        let teacherBusy = false;
        for (const cls in timetable[day][period]) {
          if (timetable[day][period][cls]?.teacherId === lesson.teacherId) {
            teacherBusy = true; break;
          }
        }
        if (teacherBusy) continue;

        // 3. Ustozning bo'sh vaqti (oynasi) 2 soatdan oshib ketmadimi?
        if (!isTeacherGapValid(timetable, day, period, lesson.teacherId)) continue;

        // Barcha qoidalardan o'tsa -> Joylaymiz!
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
  }

  return finalSchedule;
}

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

  return maxGap <= 2; // Oyna uzog'i 2 soat bo'ladi
}

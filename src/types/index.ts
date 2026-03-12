export interface Course {
  id: string;
  name: string;
  teacher: string;
  location: string;
  color: string;
  dayOfWeek: number; // 1-7 周一到周日
  startSection: number; // 开始节次 1-12
  endSection: number; // 结束节次 1-12
  startWeek: number; // 开始周次
  endWeek: number; // 结束周次
  weekType: 'all' | 'odd' | 'even'; // 单双周
  credit: number; // 学分
  remark?: string;
}

export interface Semester {
  id: string;
  name: string;
  startDate: string; // 学期开始日期
  totalWeeks: number; // 总周数
  courses: Course[];
}

export interface TimeSlot {
  section: number;
  startTime: string;
  endTime: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currentSemesterId: string | null;
  timeSlots: TimeSlot[];
  enableNotification: boolean;
  notificationAdvance: number; // 提前多少分钟提醒
}

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { section: 1, startTime: '08:00', endTime: '08:45' },
  { section: 2, startTime: '08:55', endTime: '09:40' },
  { section: 3, startTime: '10:00', endTime: '10:45' },
  { section: 4, startTime: '10:55', endTime: '11:40' },
  { section: 5, startTime: '14:00', endTime: '14:45' },
  { section: 6, startTime: '14:55', endTime: '15:40' },
  { section: 7, startTime: '16:00', endTime: '16:45' },
  { section: 8, startTime: '16:55', endTime: '17:40' },
  { section: 9, startTime: '19:00', endTime: '19:45' },
  { section: 10, startTime: '19:55', endTime: '20:40' },
  { section: 11, startTime: '20:50', endTime: '21:35' },
  { section: 12, startTime: '21:45', endTime: '22:30' },
];

export const COURSE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // sky
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#78716c', // stone
];

export const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

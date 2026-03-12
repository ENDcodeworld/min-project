import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import type { Semester, AppSettings, Course, TimeSlot } from '../types';
import { v4 as uuidv4 } from 'uuid';

// 自定义存储适配器
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await localforage.getItem(name);
    return value as string | null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

interface AppState {
  // 数据
  semesters: Semester[];
  settings: AppSettings;
  
  // 当前状态
  currentWeek: number;
  viewMode: 'week' | 'month';
  
  // Actions - Semester
  addSemester: (semester: Omit<Semester, 'id' | 'courses'>) => string;
  updateSemester: (id: string, data: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;
  setCurrentSemester: (id: string | null) => void;
  
  // Actions - Course
  addCourse: (semesterId: string, course: Omit<Course, 'id'>) => string;
  updateCourse: (semesterId: string, courseId: string, data: Partial<Course>) => void;
  deleteCourse: (semesterId: string, courseId: string) => void;
  
  // Actions - Settings
  updateSettings: (data: Partial<AppSettings>) => void;
  setTimeSlots: (slots: TimeSlot[]) => void;
  
  // Actions - View
  setCurrentWeek: (week: number) => void;
  setViewMode: (mode: 'week' | 'month') => void;
  
  // Helpers
  getCurrentSemester: () => Semester | null;
  getCoursesByWeek: (week: number) => Course[];
  getTodayCourses: () => Course[];
}

const defaultSettings: AppSettings = {
  theme: 'system',
  currentSemesterId: null,
  timeSlots: [
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
  ],
  enableNotification: false,
  notificationAdvance: 10,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始数据
      semesters: [],
      settings: defaultSettings,
      currentWeek: 1,
      viewMode: 'week',
      
      // Semester Actions
      addSemester: (semesterData) => {
        const id = uuidv4();
        const newSemester: Semester = {
          ...semesterData,
          id,
          courses: [],
        };
        set((state) => ({
          semesters: [...state.semesters, newSemester],
          settings: state.settings.currentSemesterId === null 
            ? { ...state.settings, currentSemesterId: id }
            : state.settings,
        }));
        return id;
      },
      
      updateSemester: (id, data) => {
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        }));
      },
      
      deleteSemester: (id) => {
        set((state) => ({
          semesters: state.semesters.filter((s) => s.id !== id),
          settings: state.settings.currentSemesterId === id
            ? { ...state.settings, currentSemesterId: null }
            : state.settings,
        }));
      },
      
      setCurrentSemester: (id) => {
        set((state) => ({
          settings: { ...state.settings, currentSemesterId: id },
        }));
      },
      
      // Course Actions
      addCourse: (semesterId, courseData) => {
        const id = uuidv4();
        const newCourse: Course = { ...courseData, id };
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === semesterId
              ? { ...s, courses: [...s.courses, newCourse] }
              : s
          ),
        }));
        return id;
      },
      
      updateCourse: (semesterId, courseId, data) => {
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === semesterId
              ? {
                  ...s,
                  courses: s.courses.map((c) =>
                    c.id === courseId ? { ...c, ...data } : c
                  ),
                }
              : s
          ),
        }));
      },
      
      deleteCourse: (semesterId, courseId) => {
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === semesterId
              ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
              : s
          ),
        }));
      },
      
      // Settings Actions
      updateSettings: (data) => {
        set((state) => ({
          settings: { ...state.settings, ...data },
        }));
      },
      
      setTimeSlots: (slots) => {
        set((state) => ({
          settings: { ...state.settings, timeSlots: slots },
        }));
      },
      
      // View Actions
      setCurrentWeek: (week) => {
        set({ currentWeek: week });
      },
      
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
      
      // Helpers
      getCurrentSemester: () => {
        const state = get();
        return state.semesters.find(
          (s) => s.id === state.settings.currentSemesterId
        ) || null;
      },
      
      getCoursesByWeek: (week) => {
        const semester = get().getCurrentSemester();
        if (!semester) return [];
        
        return semester.courses.filter((course) => {
          // 检查周次范围
          if (week < course.startWeek || week > course.endWeek) return false;
          
          // 检查单双周
          if (course.weekType === 'odd' && week % 2 === 0) return false;
          if (course.weekType === 'even' && week % 2 === 1) return false;
          
          return true;
        });
      },
      
      getTodayCourses: () => {
        const state = get();
        const today = new Date().getDay(); // 0-6, 0是周日
        const dayOfWeek = today === 0 ? 7 : today; // 转换为 1-7
        
        return state.getCoursesByWeek(state.currentWeek).filter(
          (course) => course.dayOfWeek === dayOfWeek
        );
      },
    }),
    {
      name: 'course-schedule-storage',
      storage: createJSONStorage(() => customStorage),
    }
  )
);

// 初始化主题
export const initTheme = () => {
  const settings = useAppStore.getState().settings;
  const root = window.document.documentElement;
  
  if (settings.theme === 'dark') {
    root.classList.add('dark');
  } else if (settings.theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', isDark);
  }
};

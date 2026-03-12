import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import type { Course } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

interface MonthViewProps {
  onCourseClick?: (course: Course) => void;
}

export default function MonthView({ onCourseClick }: MonthViewProps) {
  const { getCurrentSemester, setCurrentWeek } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  
  const semester = getCurrentSemester();
  
  // 获取当月的日历数据
  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDay = startOfMonth.day(); // 0-6, 0是周日
    const daysInMonth = endOfMonth.date();
    
    const days: {
      date: dayjs.Dayjs;
      isCurrentMonth: boolean;
      courses: Course[];
    }[] = [];
    
    // 上个月的日期填充
    for (let i = startDay - 1; i >= 0; i--) {
      const date = startOfMonth.subtract(i + 1, 'day');
      days.push({
        date,
        isCurrentMonth: false,
        courses: [],
      });
    }
    
    // 当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentMonth.date(i);
      const dayOfWeek = date.day() === 0 ? 7 : date.day();
      
      // 计算这是第几周
      let courses: Course[] = [];
      if (semester) {
        const semesterStart = dayjs(semester.startDate);
        const daysDiff = date.diff(semesterStart, 'day');
        
        if (daysDiff >= 0 && daysDiff < semester.totalWeeks * 7) {
          const week = Math.floor(daysDiff / 7) + 1;
          const weekCourses = useAppStore.getState().getCoursesByWeek(week);
          courses = weekCourses.filter(c => c.dayOfWeek === dayOfWeek);
        }
      }
      
      days.push({
        date,
        isCurrentMonth: true,
        courses,
      });
    }
    
    // 下个月的日期填充（补满6行）
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = endOfMonth.add(i, 'day');
      days.push({
        date,
        isCurrentMonth: false,
        courses: [],
      });
    }
    
    return days;
  }, [currentMonth, semester]);
  
  const goToPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const goToToday = () => setCurrentMonth(dayjs());
  
  const isToday = (date: dayjs.Dayjs) => date.isSame(dayjs(), 'day');
  
  const handleDayClick = (date: dayjs.Dayjs) => {
    if (!semester) return;
    
    const semesterStart = dayjs(semester.startDate);
    const daysDiff = date.diff(semesterStart, 'day');
    
    if (daysDiff >= 0 && daysDiff < semester.totalWeeks * 7) {
      const week = Math.floor(daysDiff / 7) + 1;
      setCurrentWeek(week);
    }
  };
  
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  
  if (!semester) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          还没有学期数据
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          请先在设置中创建学期
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 月份选择器 */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentMonth.format('YYYY年MM月')}
          </div>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      
      {/* 今天按钮 */}
      <div className="flex justify-center">
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          回到今天
        </button>
      </div>
      
      {/* 日历网格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* 星期表头 */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-medium ${
                index === 0 || index === 6
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期网格 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day.date)}
              className={`min-h-[80px] md:min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700/50 p-1 md:p-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isToday(day.date)
                      ? 'w-6 h-6 flex items-center justify-center bg-primary-500 text-white rounded-full'
                      : day.date.day() === 0 || day.date.day() === 6
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  } ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}`}
                >
                  {day.date.date()}
                </span>
              </div>
              
              {/* 课程列表 */}
              <div className="space-y-1">
                {day.courses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCourseClick?.(course);
                    }}
                    className="text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.name}
                  </div>
                ))}
                {day.courses.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5">
                    +{day.courses.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

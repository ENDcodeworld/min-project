import { useMemo } from 'react';
import { useAppStore } from '../store';
import { WEEKDAYS } from '../types';
import type { Course } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

interface WeekViewProps {
  onCourseClick?: (course: Course) => void;
}

export default function WeekView({ onCourseClick }: WeekViewProps) {
  const { 
    currentWeek, 
    setCurrentWeek, 
    getCurrentSemester,
    getCoursesByWeek,
    settings 
  } = useAppStore();
  
  const semester = getCurrentSemester();
  const weekCourses = getCoursesByWeek(currentWeek);
  const timeSlots = settings.timeSlots;
  
  // 计算当前周的开始日期
  const weekStartDate = useMemo(() => {
    if (!semester) return null;
    return dayjs(semester.startDate).add((currentWeek - 1) * 7, 'day');
  }, [semester, currentWeek]);
  
  // 按天和节次组织课程
  const courseGrid = useMemo(() => {
    const grid: (Course | null)[][] = Array(7).fill(null).map(() => 
      Array(timeSlots.length).fill(null)
    );
    
    weekCourses.forEach((course) => {
      for (let section = course.startSection; section <= course.endSection; section++) {
        if (section <= timeSlots.length) {
          grid[course.dayOfWeek - 1][section - 1] = course;
        }
      }
    });
    
    return grid;
  }, [weekCourses, timeSlots.length]);
  
  // 获取课程在网格中的跨度
  const getCourseSpan = (course: Course) => {
    return course.endSection - course.startSection + 1;
  };
  
  // 检查是否应该渲染这个课程（只在起始节次渲染）
  const shouldRenderCourse = (dayIndex: number, sectionIndex: number) => {
    const course = courseGrid[dayIndex][sectionIndex];
    if (!course) return false;
    return course.startSection === sectionIndex + 1;
  };
  
  if (!semester) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          还没有学期数据
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          请先创建一个学期，然后添加课程
        </p>
        <Link
          to="/semester/add"
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          创建学期
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 周选择器 */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <button
          onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
          disabled={currentWeek <= 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            第 {currentWeek} 周
          </div>
          {weekStartDate && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {weekStartDate.format('MM月DD日')} - {weekStartDate.add(6, 'day').format('MM月DD日')}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setCurrentWeek(Math.min(semester.totalWeeks, currentWeek + 1))}
          disabled={currentWeek >= semester.totalWeeks}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      
      {/* 快速跳转到今天 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: semester.totalWeeks }, (_, i) => i + 1).map((week) => {
          const weekStart = dayjs(semester.startDate).add((week - 1) * 7, 'day');
          const weekEnd = weekStart.add(6, 'day');
          const today = dayjs();
          const isCurrentWeek = today.isAfter(weekStart.subtract(1, 'day')) && today.isBefore(weekEnd.add(1, 'day'));
          
          return (
            <button
              key={week}
              onClick={() => setCurrentWeek(week)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentWeek === week
                  ? 'bg-primary-500 text-white'
                  : isCurrentWeek
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              第{week}周
            </button>
          );
        })}
      </div>
      
      {/* 课表网格 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* 表头 - 星期 */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              <div className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                节次
              </div>
              {WEEKDAYS.map((day, index) => {
                const date = weekStartDate?.add(index, 'day');
                const isToday = date?.isSame(dayjs(), 'day');
                
                return (
                  <div
                    key={day}
                    className={`p-3 text-center border-l border-gray-200 dark:border-gray-700 ${
                      isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {day}
                    </div>
                    {date && (
                      <div className={`text-xs ${isToday ? 'text-primary-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {date.format('MM/DD')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* 课程网格 */}
            <div className="relative">
              {timeSlots.map((slot, slotIndex) => (
                <div
                  key={slot.section}
                  className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700/50"
                  style={{ minHeight: '60px' }}
                >
                  {/* 节次时间 */}
                  <div className="p-2 text-center border-r border-gray-100 dark:border-gray-700/50 flex flex-col justify-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      第{slot.section}节
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {slot.startTime}
                    </div>
                  </div>
                  
                  {/* 每天的课程格子 */}
                  {WEEKDAYS.map((_, dayIndex) => {
                    const course = courseGrid[dayIndex][slotIndex];
                    const shouldRender = shouldRenderCourse(dayIndex, slotIndex);
                    
                    return (
                      <div
                        key={dayIndex}
                        className="relative border-l border-gray-100 dark:border-gray-700/50 p-1"
                      >
                        {shouldRender && course && (
                          <div
                            onClick={() => onCourseClick?.(course)}
                            className="course-card absolute inset-1 rounded-lg p-2 cursor-pointer overflow-hidden"
                            style={{
                              backgroundColor: course.color,
                              height: `calc(${getCourseSpan(course)} * 60px - 8px)`,
                              zIndex: 10,
                            }}
                          >
                            <div className="text-white text-sm font-medium truncate">
                              {course.name}
                            </div>
                            <div className="text-white/80 text-xs truncate">
                              {course.location}
                            </div>
                            <div className="text-white/70 text-xs truncate">
                              {course.teacher}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 添加课程按钮（移动端浮动） */}
      <Link
        to="/course/add"
        className="lg:hidden fixed right-4 bottom-20 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}

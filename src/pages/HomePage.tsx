import { useState } from 'react';
import { useAppStore } from '../store';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import CourseModal from '../components/CourseModal';
import type { Course } from '../types';
import { Grid3X3, CalendarDays } from 'lucide-react';

export default function HomePage() {
  const { viewMode, setViewMode, deleteCourse, getCurrentSemester } = useAppStore();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const semester = getCurrentSemester();
  
  const handleDeleteCourse = () => {
    if (selectedCourse && semester) {
      deleteCourse(semester.id, selectedCourse.id);
      setSelectedCourse(null);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* 视图切换 */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm flex gap-1">
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'week'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="text-sm font-medium">周视图</span>
          </button>
          
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-medium">月视图</span>
          </button>
        </div>
      </div>
      
      {/* 视图内容 */}
      {viewMode === 'week' ? (
        <WeekView onCourseClick={setSelectedCourse} />
      ) : (
        <MonthView onCourseClick={setSelectedCourse} />
      )}
      
      {/* 课程详情弹窗 */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEdit={() => setSelectedCourse(null)}
          onDelete={handleDeleteCourse}
        />
      )}
    </div>
  );
}

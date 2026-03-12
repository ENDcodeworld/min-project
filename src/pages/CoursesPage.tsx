import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { WEEKDAYS } from '../types';
import type { Course } from '../types';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseModal from '../components/CourseModal';

export default function CoursesPage() {
  const { getCurrentSemester, deleteCourse } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const semester = getCurrentSemester();
  
  // 过滤和搜索课程
  const filteredCourses = useMemo(() => {
    if (!semester) return [];
    
    return semester.courses.filter((course) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !course.name.toLowerCase().includes(query) &&
          !course.teacher.toLowerCase().includes(query) &&
          !course.location.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      
      // 颜色过滤
      if (selectedColor && course.color !== selectedColor) {
        return false;
      }
      
      // 星期过滤
      if (selectedDay !== null && course.dayOfWeek !== selectedDay) {
        return false;
      }
      
      return true;
    });
  }, [semester, searchQuery, selectedColor, selectedDay]);
  
  // 按星期分组
  const groupedCourses = useMemo(() => {
    const groups: Record<number, Course[]> = {};
    WEEKDAYS.forEach((_, index) => {
      groups[index + 1] = [];
    });
    
    filteredCourses.forEach((course) => {
      groups[course.dayOfWeek].push(course);
    });
    
    return groups;
  }, [filteredCourses]);
  
  // 获取所有使用的颜色
  const usedColors = useMemo(() => {
    if (!semester) return [];
    const colors = new Set(semester.courses.map((c) => c.color));
    return Array.from(colors);
  }, [semester]);
  
  const handleDeleteCourse = () => {
    if (selectedCourse && semester) {
      deleteCourse(semester.id, selectedCourse.id);
      setSelectedCourse(null);
    }
  };
  
  if (!semester) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          还没有学期数据
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          请先在设置中创建学期
        </p>
        <Link
          to="/settings"
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          前往设置
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索课程、教师、地点..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters || selectedColor || selectedDay
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
          
          <Link
            to="/course/add"
            className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
        
        {/* 筛选器 */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* 星期筛选 */}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">按星期</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDay(null)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedDay === null
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  全部
                </button>
                {WEEKDAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(index + 1)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedDay === index + 1
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 颜色筛选 */}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">按颜色</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedColor(null)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedColor === null
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  全部
                </button>
                {usedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 统计信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            共 {semester.courses.length} 门课程
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredCourses.length} 门符合筛选
          </div>
        </div>
      </div>
      
      {/* 课程列表 */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedColor || selectedDay ? '没有找到符合条件的课程' : '还没有添加课程'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedCourses).map(([day, courses]) => {
            if (courses.length === 0) return null;
            
            return (
              <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {WEEKDAYS[Number(day) - 1]}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {courses
                    .sort((a, b) => a.startSection - b.startSection)
                    .map((course) => (
                      <div
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* 颜色条 */}
                        <div
                          className="w-1.5 h-12 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        
                        {/* 课程信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {course.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {course.location} · {course.teacher}
                          </div>
                        </div>
                        
                        {/* 时间信息 */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            第{course.startSection}-{course.endSection}节
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            第{course.startWeek}-{course.endWeek}周
                            {course.weekType === 'odd' && ' (单)'}
                            {course.weekType === 'even' && ' (双)'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
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

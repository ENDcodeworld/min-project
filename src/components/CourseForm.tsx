import { useState, useEffect } from 'react';
import { COURSE_COLORS, WEEKDAYS } from '../types';
import { useAppStore } from '../store';
import { X, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface CourseFormProps {
  mode: 'add' | 'edit';
}

export default function CourseForm({ mode }: CourseFormProps) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { 
    getCurrentSemester, 
    addCourse, 
    updateCourse,
    settings 
  } = useAppStore();
  
  const semester = getCurrentSemester();
  const timeSlots = settings.timeSlots;
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    location: '',
    color: COURSE_COLORS[0],
    dayOfWeek: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 16,
    weekType: 'all' as 'all' | 'odd' | 'even',
    credit: 2,
    remark: '',
  });
  
  // 编辑模式时加载课程数据
  useEffect(() => {
    if (mode === 'edit' && courseId && semester) {
      const course = semester.courses.find((c) => c.id === courseId);
      if (course) {
        setFormData({
          name: course.name,
          teacher: course.teacher,
          location: course.location,
          color: course.color,
          dayOfWeek: course.dayOfWeek,
          startSection: course.startSection,
          endSection: course.endSection,
          startWeek: course.startWeek,
          endWeek: course.endWeek,
          weekType: course.weekType,
          credit: course.credit,
          remark: course.remark || '',
        });
      }
    }
  }, [mode, courseId, semester]);
  
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!semester) {
      alert('请先创建学期');
      return;
    }
    
    if (!formData.name.trim()) {
      alert('请输入课程名称');
      return;
    }
    
    if (mode === 'add') {
      addCourse(semester.id, formData);
    } else if (mode === 'edit' && courseId) {
      updateCourse(semester.id, courseId, formData);
    }
    
    navigate(-1);
  };
  
  if (!semester) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          还没有学期数据
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          请先创建一个学期
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          前往设置
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? '添加课程' : '编辑课程'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              基本信息
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                课程名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="如：高等数学"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  授课教师
                </label>
                <input
                  type="text"
                  value={formData.teacher}
                  onChange={(e) => handleChange('teacher', e.target.value)}
                  placeholder="如：张老师"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  上课地点
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="如：教学楼A101"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                学分
              </label>
              <input
                type="number"
                value={formData.credit}
                onChange={(e) => handleChange('credit', Number(e.target.value))}
                min="0"
                max="10"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {/* 上课时间 */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              上课时间
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                星期
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleChange('dayOfWeek', index + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      formData.dayOfWeek === index + 1
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开始节次
                </label>
                <select
                  value={formData.startSection}
                  onChange={(e) => handleChange('startSection', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.section} value={slot.section}>
                      第{slot.section}节 ({slot.startTime})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束节次
                </label>
                <select
                  value={formData.endSection}
                  onChange={(e) => handleChange('endSection', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {timeSlots.filter(s => s.section >= formData.startSection).map((slot) => (
                    <option key={slot.section} value={slot.section}>
                      第{slot.section}节 ({slot.endTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开始周次
                </label>
                <input
                  type="number"
                  value={formData.startWeek}
                  onChange={(e) => handleChange('startWeek', Number(e.target.value))}
                  min="1"
                  max={semester.totalWeeks}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结束周次
                </label>
                <input
                  type="number"
                  value={formData.endWeek}
                  onChange={(e) => handleChange('endWeek', Number(e.target.value))}
                  min={formData.startWeek}
                  max={semester.totalWeeks}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                周次类型
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '每周' },
                  { value: 'odd', label: '单周' },
                  { value: 'even', label: '双周' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleChange('weekType', item.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      formData.weekType === item.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 外观设置 */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              外观设置
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                课程颜色
              </label>
              <div className="flex flex-wrap gap-2">
                {COURSE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange('color', color)}
                    className={`w-10 h-10 rounded-full transition-transform ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white dark:ring-offset-gray-800 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              备注
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="其他需要记录的信息..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
          
          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mode === 'add' ? '添加课程' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

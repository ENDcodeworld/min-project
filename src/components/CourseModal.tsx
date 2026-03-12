import { useState } from 'react';
import type { Course } from '../types';
import { COURSE_COLORS } from '../types';
import { X, Edit, Trash2, MapPin, Clock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseModalProps {
  course: Course;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseModal({ course, onClose, onDelete }: CourseModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleDelete = () => {
    onDelete();
    onClose();
  };
  
  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="modal-content bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="p-6 text-white relative"
          style={{ backgroundColor: course.color }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-2">{course.name}</h2>
          <p className="text-white/80">{course.teacher}</p>
        </div>
        
        {/* 内容 */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">地点</div>
              <div className="text-gray-900 dark:text-white">{course.location}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">时间</div>
              <div className="text-gray-900 dark:text-white">
                周{['一', '二', '三', '四', '五', '六', '日'][course.dayOfWeek - 1]} 
                第{course.startSection}-{course.endSection}节
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                第{course.startWeek}-{course.endWeek}周
                {course.weekType === 'odd' && ' (单周)'}
                {course.weekType === 'even' && ' (双周)'}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">学分</div>
              <div className="text-gray-900 dark:text-white">{course.credit} 学分</div>
            </div>
          </div>
          
          {course.remark && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">备注</div>
              <div className="text-gray-900 dark:text-white">{course.remark}</div>
            </div>
          )}
          
          {/* 颜色选择器显示 */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">课程颜色</div>
            <div className="flex gap-2">
              {COURSE_COLORS.map((color) => (
                <div
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    color === course.color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          <Link
            to={`/course/edit/${course.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-4 text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>编辑</span>
          </Link>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l border-gray-200 dark:border-gray-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>删除</span>
          </button>
        </div>
      </div>
      
      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              确认删除
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              确定要删除课程「{course.name}」吗？此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

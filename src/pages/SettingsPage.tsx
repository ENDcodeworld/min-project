import { useState } from 'react';
import { useAppStore } from '../store';
import { 
  Sun, 
  Moon, 
  Monitor,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Bell,
  Clock,
  Calendar
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Semester } from '../types';

export default function SettingsPage() {
  const { 
    semesters, 
    settings, 
    updateSettings,
    addSemester,
    deleteSemester,
    setCurrentSemester
  } = useAppStore();
  
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showTimeSlotsModal, setShowTimeSlotsModal] = useState(false);
  const [semesterForm, setSemesterForm] = useState({
    name: '',
    startDate: dayjs().format('YYYY-MM-DD'),
    totalWeeks: 16,
  });
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
    
    updateSettings({ theme });
  };
  
  const handleAddSemester = () => {
    if (!semesterForm.name.trim()) {
      alert('请输入学期名称');
      return;
    }
    
    const id = addSemester(semesterForm);
    setCurrentSemester(id);
    setShowSemesterModal(false);
    setSemesterForm({
      name: '',
      startDate: dayjs().format('YYYY-MM-DD'),
      totalWeeks: 16,
    });
  };
  
  const handleDeleteSemester = (id: string) => {
    if (confirm('确定要删除这个学期吗？相关课程数据也会被删除。')) {
      deleteSemester(id);
    }
  };
  
  const handleExport = () => {
    const data = {
      semesters,
      settings,
      exportTime: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `课程表备份_${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.semesters && Array.isArray(data.semesters)) {
            data.semesters.forEach((semester: Semester) => {
              const existingIds = semesters.map(s => s.id);
              if (!existingIds.includes(semester.id)) {
                addSemester({
                  name: semester.name,
                  startDate: semester.startDate,
                  totalWeeks: semester.totalWeeks,
                });
              }
            });
            alert('导入成功！');
          }
        } catch (error) {
          alert('导入失败，请确保文件格式正确');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 学期管理 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            学期管理
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {semesters.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              还没有创建学期
            </div>
          ) : (
            semesters.map((semester) => (
              <div
                key={semester.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {semester.name}
                    {settings.currentSemesterId === semester.id && (
                      <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 py-0.5 rounded">
                        当前
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {dayjs(semester.startDate).format('YYYY-MM-DD')} 起 · {semester.totalWeeks}周 · {semester.courses.length}门课程
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {settings.currentSemesterId !== semester.id && (
                    <button
                      onClick={() => setCurrentSemester(semester.id)}
                      className="text-sm text-primary-500 hover:text-primary-600"
                    >
                      设为当前
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSemester(semester.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowSemesterModal(true)}
            className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加学期
          </button>
        </div>
      </section>
      
      {/* 外观设置 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            外观设置
          </h2>
        </div>
        
        <div className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">主题模式</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', icon: Sun, label: '浅色' },
              { value: 'dark', icon: Moon, label: '深色' },
              { value: 'system', icon: Monitor, label: '跟随系统' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => handleThemeChange(item.value as 'light' | 'dark' | 'system')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  settings.theme === item.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <item.icon className={`w-6 h-6 mx-auto mb-2 ${
                  settings.theme === item.value ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div className={`text-sm ${
                  settings.theme === item.value ? 'text-primary-500 font-medium' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* 时间设置 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            时间设置
          </h2>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => setShowTimeSlotsModal(true)}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            编辑上课时间表
          </button>
        </div>
      </section>
      
      {/* 提醒设置 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            课程提醒
          </h2>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 dark:text-gray-300">启用提醒</span>
            <button
              onClick={() => updateSettings({ enableNotification: !settings.enableNotification })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableNotification ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                settings.enableNotification ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          {settings.enableNotification && (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">提前提醒时间</span>
              <select
                value={settings.notificationAdvance}
                onChange={(e) => updateSettings({ notificationAdvance: Number(e.target.value) })}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={5}>5 分钟</option>
                <option value={10}>10 分钟</option>
                <option value={15}>15 分钟</option>
                <option value={30}>30 分钟</option>
              </select>
            </div>
          )}
        </div>
      </section>
      
      {/* 数据管理 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            数据管理
          </h2>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出数据
          </button>
          
          <button
            onClick={handleImport}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            导入数据
          </button>
        </div>
      </section>
      
      {/* 关于 */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>课程表 App v1.0.0</p>
          <p className="mt-1">Made with ❤️ by 小葵</p>
        </div>
      </section>
      
      {/* 添加学期弹窗 */}
      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                添加学期
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  学期名称
                </label>
                <input
                  type="text"
                  value={semesterForm.name}
                  onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                  placeholder="如：2026年春季学期"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  开学日期
                </label>
                <input
                  type="date"
                  value={semesterForm.startDate}
                  onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  总周数
                </label>
                <input
                  type="number"
                  value={semesterForm.totalWeeks}
                  onChange={(e) => setSemesterForm({ ...semesterForm, totalWeeks: Number(e.target.value) })}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex p-4 border-t border-gray-200 dark:border-gray-700 gap-3">
              <button
                onClick={() => setShowSemesterModal(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddSemester}
                className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 时间表编辑弹窗 */}
      {showTimeSlotsModal && (
        <TimeSlotsModal onClose={() => setShowTimeSlotsModal(false)} />
      )}
    </div>
  );
}

// 时间表编辑组件
function TimeSlotsModal({ onClose }: { onClose: () => void }) {
  const { settings, setTimeSlots } = useAppStore();
  const [slots, setSlots] = useState(settings.timeSlots);
  
  const handleSave = () => {
    setTimeSlots(slots);
    onClose();
  };
  
  const updateSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            编辑上课时间
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {slots.map((slot, index) => (
            <div key={slot.section} className="flex items-center gap-3">
              <div className="w-16 text-sm font-medium text-gray-700 dark:text-gray-300">
                第{slot.section}节
              </div>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          ))}
        </div>
        
        <div className="flex p-4 border-t border-gray-200 dark:border-gray-700 gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

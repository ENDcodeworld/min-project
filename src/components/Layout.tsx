import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  BookOpen, 
  Settings, 
  Menu,
  Sun,
  Moon,
  Plus
} from 'lucide-react';
import { useAppStore } from '../store';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { settings, updateSettings } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleTheme = () => {
    const root = document.documentElement;
    const currentTheme = settings.theme;
    let newTheme: 'light' | 'dark' | 'system';
    
    if (currentTheme === 'light') {
      newTheme = 'dark';
      root.classList.add('dark');
    } else if (currentTheme === 'dark') {
      newTheme = 'system';
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      newTheme = 'light';
      root.classList.remove('dark');
    }
    
    updateSettings({ theme: newTheme });
  };
  
  const navItems = [
    { path: '/', icon: Calendar, label: '课表' },
    { path: '/courses', icon: BookOpen, label: '课程' },
    { path: '/settings', icon: Settings, label: '设置' },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 移动端头部 */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            课程表
          </h1>
          
          <div className="flex items-center gap-2">
            <Link
              to="/course/add"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : settings.theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* 移动端侧边栏 */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="w-64 h-full bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                课程表
              </h2>
            </div>
            <nav className="p-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            课程表
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">主题</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : settings.theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </aside>
      
      {/* 主内容区 */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
      
      {/* 移动端底部导航 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-bottom">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 ${
                isActive(item.path)
                  ? 'text-primary-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

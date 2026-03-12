import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import SettingsPage from './pages/SettingsPage';
import CourseForm from './components/CourseForm';
import { useEffect } from 'react';
import { initTheme } from './store';

function App() {
  useEffect(() => {
    initTheme();
  }, []);
  
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/course/add" element={<CourseForm mode="add" />} />
          <Route path="/course/edit/:courseId" element={<CourseForm mode="edit" />} />
          <Route path="/semester/add" element={<SemesterAddRedirect />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

// 重定向到设置页面的学期添加
function SemesterAddRedirect() {
  return <SettingsPage />;
}

export default App;

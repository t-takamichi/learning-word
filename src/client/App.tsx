import { useState, useEffect } from 'react';
import { StudyPage } from './pages/StudyPage';
import { AdminPage } from './pages/AdminPage';
import { AtomsShowcase } from './pages/AtomsShowcase';
import { UserSelectPage } from './pages/UserSelectPage';
import { WordSetSelectPage } from './pages/WordSetSelectPage';

export function App(): React.ReactElement {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin and Atoms bypass guards
  if (currentPath.startsWith('/admin')) {
    return <AdminPage />;
  }
  if (currentPath.startsWith('/atoms')) {
    return <AtomsShowcase />;
  }

  const activeUserId = localStorage.getItem('active_user_id');
  const activeWordSetId = localStorage.getItem('active_word_set_id');

  if (currentPath.startsWith('/users')) {
    return <UserSelectPage />;
  }

  if (!activeUserId) {
    if (currentPath !== '/users') {
      window.location.replace('/users');
      return <></>;
    }
    return <UserSelectPage />;
  }

  if (currentPath.startsWith('/levels')) {
    return <WordSetSelectPage />;
  }

  if (!activeWordSetId) {
    if (currentPath !== '/levels') {
      window.location.replace('/levels');
      return <></>;
    }
    return <WordSetSelectPage />;
  }

  return <StudyPage />;
}

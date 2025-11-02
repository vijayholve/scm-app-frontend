import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AdminNavigation } from './AdminNavigation';
import { TeacherNavigation } from './TeacherNavigation';
import { StudentNavigation } from './StudentNavigation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }
  

  return (
    <NavigationContainer>
      {user.role === 'admin' && <AdminNavigation />}
      {user.role === 'teacher' && <TeacherNavigation />}
      {user.role === 'student' && <StudentNavigation />}
    </NavigationContainer>
  );
};

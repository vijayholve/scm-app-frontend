import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { StudentsScreen } from '../screens/admin/StudentsScreen';
import { AssignmentsScreen } from '../screens/common/AssignmentsScreen';
import { AttendanceScreen } from '../screens/common/AttendanceScreen';
import { AnnouncementsScreen } from '../screens/common/AnnouncementsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Drawer = createDrawerNavigator();

export const AdminNavigation: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#6200ee',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          drawerIcon: ({ color }) => '📊',
        }}
      />
      <Drawer.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          drawerIcon: ({ color }) => '👨‍🎓',
        }}
      />
      <Drawer.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          drawerIcon: ({ color }) => '📚',
        }}
      />
      <Drawer.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          drawerIcon: ({ color }) => '📅',
        }}
      />
      <Drawer.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          drawerIcon: ({ color }) => '📢',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color }) => '👤',
        }}
      />
    </Drawer.Navigator>
  );
};

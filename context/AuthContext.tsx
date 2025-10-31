import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// Note: In a real React Native environment, you would use '@react-native-async-storage/async-storage'
// We use a conceptual import here for demonstration.
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importing mock types/services from your existing project structure
import { User, Permission, ActionPermissions } from '../types'; 
import { apiService } from '../api/apiService';

// --- STORAGE KEYS ---
const API_KEY_STORAGE = '@authToken';
const USER_STORAGE = '@currentUser';

// --- INTERFACE DEFINITIONS (Updated to match API response and usage) ---

// Define the shape of the actions property within a permission
export interface ActionPermissions {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

// Define the shape of a single permission object
export interface Permission {
  entityName: string; // e.g., 'TEACHER', 'EXAM'
  name: string;
  id: number;
  actions: ActionPermissions;
}

// Define the final User object stored in state/AsyncStorage
export interface User {
  // Authentication/Session Data
  accessToken: string;
  // User Profile Data (from response.data)
  userId: number; // mapped from data.id
  userName: string;
  type: 'STUDENT' | 'ADMIN' | 'TEACHER';
  firstName: string;
  lastName: string;
  accountId: number;
  // Authorization Data (from response.role)
  roleName: string; // mapped from role.name
  permissions: Permission[]; // mapped from role.permissions
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  // CORRECTED: Login now accepts the full successful API response data
  login: (responseData: any) => Promise<void>; 
  logout: () => Promise<void>;
  // CORRECTED: Permission check now takes entity name and action type
  hasPermission: (entityName: string, action: keyof ActionPermissions) => boolean;
  // Removed setUser from context exposure (state should be managed internally via login/logout)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);


  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(API_KEY_STORAGE);
      const storedUser = await AsyncStorage.getItem(USER_STORAGE);

      if (storedUser && storedToken) {
        // Rehydrate user state
        const userObj = JSON.parse(storedUser) as User;
        setUser({ ...userObj, accessToken: storedToken });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accepts the successful API response, extracts key data, stores it in AsyncStorage, and updates state.
   * @param responseData The parsed JSON body from the successful login API call.
   */
  // CORRECTED: Login function now handles the received API data
  const login = async (responseData: any) => {
    try {
      // **CRITICAL FIX: Explicitly check for accessToken and required data structure.**
      if (responseData.status !== 'SUCCESS' || !responseData.accessToken || !responseData.data || !responseData.role) {
        // This ensures if the API status is 'SUCCESS' but crucial fields are missing, it throws.
        // However, this check should ideally be sufficient for the LoginScreen's failure check.
        throw new Error(responseData.message || 'Login API response indicates failure or missing data.');
      }

      const token = responseData.accessToken;
      const userData = responseData.data;
      const roleData = responseData.role;

      // 1. Consolidate data into the final User object structure
      const finalUser: User = {
        accessToken: token,
        userId: userData.id,
        userName: userData.userName,
        type: userData.type,
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountId: userData.accountId,
        roleName: roleData.name,
        permissions: roleData.permissions,
      };

      // 2. Persist data (AsyncStorage equivalent for React Native)
      // Note: We save the token separately and the user object separately.
      await AsyncStorage.setItem(API_KEY_STORAGE, token);
      await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(finalUser));

      // 3. Update state
      setUser(finalUser);

    } catch (error) {
      console.error('Error during AuthContext login processing:', error);
      throw error; // Re-throw so LoginScreen can catch and show Snackbar
    }
  };

  const logout = async () => {
    try {
      // Clear persistence store
      // Assuming apiService clears the keys
      await AsyncStorage.removeItem(API_KEY_STORAGE);
      await AsyncStorage.removeItem(USER_STORAGE);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * Checks if the current user has a specific permission action for an entity.
   * @param entityName The name of the entity (e.g., 'TEACHER', 'EXAM').
   * @param action The action type (e.g., 'view', 'edit', 'add', 'delete').
   */
  // CORRECTED: Implementation based on the nested permission structure
  const hasPermission = (entityName: string, action: keyof ActionPermissions): boolean => {
    if (!user) return false;
    
    // Find the specific permission object by its entityName (case insensitive check)
    const permission = user.permissions.find(
      (p) => p.entityName.toUpperCase() === entityName.toUpperCase()
    );
    
    // Check if the permission exists and if the specific action is true
    return permission ? permission.actions[action] === true : false;
  };

  return (
    <AuthContext.Provider
      // CORRECTED: Removed setUser from the value object
      value={{ user, loading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import axios, { AxiosInstance } from 'axios';
import { storage } from '../utils/storage';
import {
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_TEACHERS,
  MOCK_CLASSES,
  MOCK_ATTENDANCE,
  MOCK_ASSIGNMENTS,
  MOCK_ANNOUNCEMENTS,
  MOCK_FEES,
  MOCK_ROLES,
} from './mockData';
import { AuthResponse, User, Student, Teacher, Class, Attendance, Assignment, Announcement, Fee, Role } from '../types';

const TOKEN_KEY = 'auth_token';

class ApiService {
  private api: AxiosInstance;
  private students = [...MOCK_STUDENTS];
  private teachers = [...MOCK_TEACHERS];
  private classes = [...MOCK_CLASSES];
  private attendance = [...MOCK_ATTENDANCE];
  private assignments = [...MOCK_ASSIGNMENTS];
  private announcements = [...MOCK_ANNOUNCEMENTS];
  private fees = [...MOCK_FEES];
  private roles = [...MOCK_ROLES];

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.school.com',
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await storage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await storage.removeItem(TOKEN_KEY);
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user || password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    const token = `mock_jwt_token_${user.id}_${Date.now()}`;
    await storage.setItem(TOKEN_KEY, token);

    return { token, user };
  }

  async logout(): Promise<void> {
    await storage.removeItem(TOKEN_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = await storage.getItem(TOKEN_KEY);
    if (!token) return null;

    const userId = token.split('_')[3];
    return MOCK_USERS.find((u) => u.id === userId) || null;
  }

  async getStudents(): Promise<Student[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.students];
  }

  async getStudent(id: string): Promise<Student> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const student = this.students.find((s) => s.id === id);
    if (!student) throw new Error('Student not found');
    return student;
  }

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newStudent = { ...student, id: `s${Date.now()}` };
    this.students.push(newStudent);
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found');
    this.students[index] = { ...this.students[index], ...student };
    return this.students[index];
  }

  async deleteStudent(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.students = this.students.filter((s) => s.id !== id);
  }

  async getTeachers(): Promise<Teacher[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.teachers];
  }

  async getTeacher(id: string): Promise<Teacher> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const teacher = this.teachers.find((t) => t.id === id);
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  }

  async createTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newTeacher = { ...teacher, id: `t${Date.now()}` };
    this.teachers.push(newTeacher);
    return newTeacher;
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.teachers.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Teacher not found');
    this.teachers[index] = { ...this.teachers[index], ...teacher };
    return this.teachers[index];
  }

  async deleteTeacher(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.teachers = this.teachers.filter((t) => t.id !== id);
  }

  async getClasses(): Promise<Class[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.classes];
  }

  async getClass(id: string): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const classData = this.classes.find((c) => c.id === id);
    if (!classData) throw new Error('Class not found');
    return classData;
  }

  async createClass(classData: Omit<Class, 'id'>): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newClass = { ...classData, id: `c${Date.now()}` };
    this.classes.push(newClass);
    return newClass;
  }

  async updateClass(id: string, classData: Partial<Class>): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found');
    this.classes[index] = { ...this.classes[index], ...classData };
    return this.classes[index];
  }

  async deleteClass(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.classes = this.classes.filter((c) => c.id !== id);
  }

  async getAttendance(filters?: { classId?: string; studentId?: string; date?: string }): Promise<Attendance[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...this.attendance];
    if (filters?.classId) result = result.filter((a) => a.classId === filters.classId);
    if (filters?.studentId) result = result.filter((a) => a.studentId === filters.studentId);
    if (filters?.date) result = result.filter((a) => a.date === filters.date);
    return result;
  }

  async createAttendance(attendance: Omit<Attendance, 'id'>): Promise<Attendance> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newAttendance = { ...attendance, id: `a${Date.now()}` };
    this.attendance.push(newAttendance);
    return newAttendance;
  }

  async updateAttendance(id: string, attendance: Partial<Attendance>): Promise<Attendance> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.attendance.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Attendance not found');
    this.attendance[index] = { ...this.attendance[index], ...attendance };
    return this.attendance[index];
  }

  async getAssignments(filters?: { classId?: string; teacherId?: string }): Promise<Assignment[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...this.assignments];
    if (filters?.classId) result = result.filter((a) => a.classId === filters.classId);
    if (filters?.teacherId) result = result.filter((a) => a.teacherId === filters.teacherId);
    return result;
  }

  async createAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newAssignment = { ...assignment, id: `as${Date.now()}` };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.assignments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Assignment not found');
    this.assignments[index] = { ...this.assignments[index], ...assignment };
    return this.assignments[index];
  }

  async deleteAssignment(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.assignments = this.assignments.filter((a) => a.id !== id);
  }

  async getAnnouncements(): Promise<Announcement[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.announcements];
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newAnnouncement = { ...announcement, id: `an${Date.now()}` };
    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.announcements.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    this.announcements[index] = { ...this.announcements[index], ...announcement };
    return this.announcements[index];
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.announcements = this.announcements.filter((a) => a.id !== id);
  }

  async getFees(studentId?: string): Promise<Fee[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (studentId) {
      return this.fees.filter((f) => f.studentId === studentId);
    }
    return [...this.fees];
  }

  async updateFee(id: string, fee: Partial<Fee>): Promise<Fee> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.fees.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Fee not found');
    this.fees[index] = { ...this.fees[index], ...fee };
    return this.fees[index];
  }

  async getRoles(): Promise<Role[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.roles];
  }

  async updateRole(id: string, role: Partial<Role>): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = this.roles.findIndex((r) => r.roleId === id);
    if (index === -1) throw new Error('Role not found');
    this.roles[index] = { ...this.roles[index], ...role };
    return this.roles[index];
  }
}

export const apiService = new ApiService();

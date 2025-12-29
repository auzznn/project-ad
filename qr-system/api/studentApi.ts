import { apiRequest } from './axiosClient';
import { User } from '@/context/AuthContext';

export interface Student {
  id: string;
  name: string;
  class: string;
  grade?: string;
  timestamp?: string;
  section?: string;
  rmt_elligible?: boolean;
  program?: string;
  eligible_rmt?: boolean;
}

export interface AttendanceRecord {
  id: string;
  timestamp: string;
}

export interface AttendancePayload {
  id: string;
  timestamp: string;
}

export interface SahsiahRecord {
  timestamp: string;
  migrate_student_id: number;
  sahsiah_type: number;
}

export interface SahsiahType {
  id: string;
  name: string;
  points: number;
  tag: string;
  icon?: string;
  color?: string;
}

export interface SahsiahCategory {
  tag: string;
  name: string;
  icon?: string;
  color?: string;
  types: SahsiahType[];
}

export interface DisciplineRecord {
  timestamp: string | null;
  student_id: number | null;
  discipline_type: number | null;
}

export interface DisciplineType {
  id: string;
  name: string;
  points: number;
  tag: string;
  icon?: string;
  color?: string;
}

export interface DisciplineCategory {
  tag: string;
  name: string;
  icon?: string;
  color?: string;
  types: DisciplineType[]; 
}

export interface StudentDetails {
  id: string;
  name: string;
  grade: string;
  section: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  discipline: {
    points: number;
    incidents: number;
  };
  sahsiah: {
    points: number;
    achievements: number;
  };
  rmt: {
    eligible: boolean;
    claimed: boolean;
    lastClaim: string;
  };
  recentActivity: Array<{
    type: 'attendance' | 'discipline' | 'sahsiah' | 'rmt';
    description: string;
    date: string;
    points?: number;
  }>;
}

export const studentApi = {

  getChildren: async (userId: string): Promise<User[]> => {
    try {
      const response = await apiRequest.get(`/authentication/user/${userId}/`);
      return response.children || [];
    } catch (error) {
      throw error;
    }
  },
  // Get student data by ID
  getStudent: async (studentId: string): Promise<Student> => {
    return apiRequest.get(`/authentication/student/${studentId}`);
  },
  
  // Get detailed student information including attendance, discipline, etc.
  getStudentDetails: async (studentId: string): Promise<StudentDetails> => {
    return apiRequest.get(`/authentication/student/${studentId}`);
  },
  
  // Mark attendance for a student
  markAttendance: async (payload: AttendancePayload): Promise<any> => {
    try {
      console.log('markAttendance - payload:', payload);
      console.log('markAttendance - student_id (raw):', payload.id);
      console.log('markAttendance - student_id (parsed):', parseInt(payload.id, 10));
      console.log('markAttendance - timestamp:', payload.timestamp);
      
      const requestData = {
        student_id: parseInt(payload.id, 10),
        timestamp: payload.timestamp
      };
      console.log('markAttendance - request data:', requestData);
      
      const response = await apiRequest.patch('/student_attendance/record/', requestData);
      console.log('markAttendance - response:', response);
      return response;
    } catch (error) {
      console.error('markAttendance - error:', error);
      console.error('markAttendance - error response:', (error as any).response?.data);
      throw error;
    }
  },
  
  // Check if student already has attendance for today
  checkAttendanceStatus: async (studentId: string): Promise<any> => {
    // Get all attendance for today and filter by student_id on the client side
    const response = await apiRequest.get('student_attendance/daily/');
    console.log(response)
    
    // Create a hash map for O(1) lookups
    const attendanceMap: { [key: string]: any } = {};
    response.entry.forEach((record: any) => {
      if (record.student && record.student.id) {
        attendanceMap[record.student.id.toString()] = record;
      }
    });
    
    // Direct lookup for the specific student - O(1) complexity
    const studentRecord = attendanceMap[studentId] || null;
    
    // This ensures students without attendance records can be marked
    if (!studentRecord) {
      return { status: "absent", id: studentId };
    }
    
    return studentRecord;
  },
  
  // Check attendance status for multiple children at once
  checkChildrenAttendance: async (childrenIds: string[]): Promise<any[]> => {
    try {
      const response = await apiRequest.get('student_attendance/daily/');
      const attendanceData = response.entry || [];
      
      // Create a hash map for O(1) lookups
      const attendanceMap: { [key: string]: any } = {};
      attendanceData.forEach((record: any) => {
        if (record.student && record.student.id) {
          attendanceMap[record.student.id.toString()] = record;
        }
      });
      
      // Now lookup each child in O(1) time
      return childrenIds.map(childId => {
        const studentRecord = attendanceMap[childId] || null;
        
        if (!studentRecord) {
          return {
            studentId: childId,
            status: "absent",
            timestamp: null
          };
        }
        
        return {
          studentId: childId,
          status: studentRecord.status || "present",
          timestamp: studentRecord.timestamp
        };
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Record sahsiah (behavior/conduct) for a student
  recordSahsiah: async (data: SahsiahRecord): Promise<any> => {
    return apiRequest.post('/sahsiah/record/', data);
  },
  
  // Record RMT for a student
  recordRMT: async (data: { student_id: string; timestamp: string }): Promise<any> => {
    return apiRequest.patch('/rmt/record/', data);
  },
  
  // Check if student already has RMT for today
  checkRMTStatus: async (studentId: string): Promise<any> => {
    const response = await apiRequest.get('rmt/daily/');
    
    // Create a hash map for O(1) lookups
    const rmtMap: { [key: string]: any } = {};
    
    // Check if response.entry exists and is an array
    if (response && Array.isArray(response)) {
      response.forEach((record: any) => {
        if (record.student && record.student.id) {
          rmtMap[record.student.id.toString()] = record;
        }
      });
    }
    
    // Direct lookup for the specific student - O(1) complexity
    const studentRecord = rmtMap[studentId] || null;

    console.log(studentRecord);
    
    return studentRecord;
  },
  
  // Check RMT eligibility (though this will be determined from QR data)
  // checkRMTEligibility: async (studentId: string): Promise<any> => {
  //   return apiRequest.get(`/rmt/check/${studentId}`);
  // },
  
  // Get sahsiah types from API
  getSahsiahTypes: async (): Promise<SahsiahType[]> => {
    const response = await apiRequest.get('/sahsiah/type/')
    return response.entry;
  },
  
  // Reset all sahsiah data
  resetSahsiah: async (): Promise<any> => {
    return apiRequest.post('/sahsiah/reset');
  },
  
  // Get leaderboard data from sahsiah/leaderboard/
  getLeaderboard: async (): Promise<any> => {
    const response = await apiRequest.get('/sahsiah/leaderboard/');
    return response.entry;
  },
  
  // Record discipline for a student
  recordDiscipline: async (data: DisciplineRecord): Promise<any> => {
    return apiRequest.post('/discipline/record/', data);
  },
  
  // Get discipline types from API
  getDisciplineTypes: async (): Promise<DisciplineType[]> => {
    const response = await apiRequest.get('/discipline/type/')
    return response.entry;
  },
  
  // Reset all discipline data
  resetDiscipline: async (): Promise<any> => {
    return apiRequest.post('/discipline/reset');
  },
  
  // Get discipline leaderboard data from discipline/leaderboard/
  getDisciplineLeaderboard: async (): Promise<any> => {
    const response = await apiRequest.get('/discipline/leaderboard/');
    return response.entry;
  },
  
};

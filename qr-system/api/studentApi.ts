import { apiRequest } from './axiosClient';

export interface Student {
  student_id: string;
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
  student_id: string;
  timestamp: string;
}

export interface AttendancePayload {
  student_id: string;
  timestamp: string;
}

export interface SahsiahRecord {
  timestamp: string;
  student_id: number;
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

export const studentApi = {
  // Get student data by ID
  getStudent: async (studentId: string): Promise<Student> => {
    return apiRequest.get(`/authentication/user/${studentId}`);
  },
  
  // Mark attendance for a student
  markAttendance: async (payload: AttendancePayload): Promise<any> => {
    console.log('DEBUG: Marking attendance with payload:', {
      ...payload,
      local_time: new Date().toLocaleString()
    });
    
    try {
      const response = await apiRequest.patch('/student_attendance/record/', {
        student_id: payload.student_id,
       timestamp: payload.timestamp
      });
      console.log('DEBUG: Attendance marked successfully:', response);
      return response;
    } catch (error) {
      console.error('DEBUG: Failed to mark attendance:', error);
      throw error;
    }
  },
  
  // Check if student already has attendance for today
  checkAttendanceStatus: async (studentId: string): Promise<any> => {
    // Get all attendance for today and filter by student_id on the client side
    const response = await apiRequest.get('student_attendance/daily/');
    
    // Filter for the specific student - the student_id is nested inside a student object
    const studentRecord = response.find((record: any) => {
      return record.student && record.student.student_id === Number(studentId);
    }) || null;
    
    // This ensures students without attendance records can be marked
    if (!studentRecord) {
      return { status: "absent", student_id: studentId };
    }
    
    return studentRecord;
  },
  
  // Record sahsiah (behavior/conduct) for a student
  recordSahsiah: async (data: SahsiahRecord): Promise<any> => {
    return apiRequest.post('/sahsiah/record/', data);
  },
  
  // Check RMT eligibility (though this will be determined from QR data)
  checkRMTEligibility: async (studentId: string): Promise<any> => {
    return apiRequest.get(`/rmt/check/${studentId}`);
  },
  
  // Get sahsiah types from API
  getSahsiahTypes: async (): Promise<SahsiahType[]> => {
    return apiRequest.get('/sahsiah/type/');
  },
  
  // Reset all sahsiah data
  resetSahsiah: async (): Promise<any> => {
    return apiRequest.post('/sahsiah/reset');
  },
  
  // Get leaderboard data from sahsiah/leaderboard/
  getLeaderboard: async (): Promise<any> => {
    return apiRequest.get('/sahsiah/leaderboard/');
  }
};
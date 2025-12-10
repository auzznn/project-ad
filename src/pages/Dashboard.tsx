import React, { useState, useEffect } from "react";
import "./Dashboard.css";

interface Student {
  id: number;
  name: string;
  class: string;
  attendance_rate?: number;
  rmt_rate?: number;
}

interface ActivityLog {
  id: number;
  message: string;
  timestamp: string;
  status: "success" | "error" | "warning";
}

function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [rmtRate, setRmtRate] = useState(0);

  useEffect(() => {
    // Load students data
    fetch("/data/students.json")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setTotalStudents(data.length);
        
        // Calculate average attendance rate
        const avgAttendance = data.reduce((sum: number, s: Student) => sum + (s.attendance_rate || 0), 0) / data.length;
        setAttendanceRate(Math.round(avgAttendance));
        
        // Calculate average RMT rate
        const avgRmt = data.reduce((sum: number, s: Student) => sum + (s.rmt_rate || 0), 0) / data.length;
        setRmtRate(Math.round(avgRmt));

        // Generate mock activity logs
        const mockLogs: ActivityLog[] = [
          {
            id: 1,
            message: "Kehadiran dicipta untuk Ahmad Faris",
            timestamp: "06:45 AM, Feb 10, 2025",
            status: "success",
          },
          {
            id: 2,
            message: "RMT direkodkan untuk Tan Mei Ling",
            timestamp: "12:45 PM, Feb 10, 2025",
            status: "success",
          },
          {
            id: 3,
            message: "Tidak dapat mencipta rekod kehadiran (Ralat Sistem)",
            timestamp: "07:15 AM, Feb 10, 2025",
            status: "error",
          },
          {
            id: 4,
            message: "Tidak dapat merekodkan pelajar (Tidak dalam Senarai Putih RMT)",
            timestamp: "12:30 PM, Feb 10, 2025",
            status: "error",
          },
          {
            id: 5,
            message: "Kehadiran dicipta untuk Siti Nurhaliza",
            timestamp: "06:50 AM, Feb 10, 2025",
            status: "success",
          },
        ];
        setActivityLogs(mockLogs);
      })
      .catch((err) => console.error("Error loading students:", err));
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === "success") return "✓";
    if (status === "error") return "✕";
    return "!";
  };

  const getStatusClass = (status: string) => {
    if (status === "success") return "status-success";
    if (status === "error") return "status-error";
    return "status-warning";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Papan Pemuka</h1>
        <p>Ringkasan statistik dan log aktiviti terkini</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h3>Jumlah Pelajar</h3>
            <p className="stat-value">{totalStudents}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#10b981" }}>
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-content">
            <h3>Kadar Kehadiran</h3>
            <p className="stat-value" style={{ color: "#10b981" }}>
              {attendanceRate}%
            </p>
            <p className="stat-subtitle">39/40 pelajar</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#0891b2" }}>
            <i className="bi bi-gear"></i>
          </div>
          <div className="stat-content">
            <h3>Kadar Pengedaran RMT</h3>
            <p className="stat-value" style={{ color: "#0891b2" }}>
              {rmtRate}%
            </p>
            <p className="stat-subtitle">72/90 pelajar</p>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="activity-section">
        <h2>Log Aktiviti Terkini</h2>
        <div className="activity-list">
          {activityLogs.map((log) => (
            <div key={log.id} className={`activity-item ${getStatusClass(log.status)}`}>
              <div className="activity-icon">
                <i className={`bi ${log.status === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}></i>
              </div>
              <div className="activity-content">
                <p className="activity-message">{log.message}</p>
                <p className="activity-time">{log.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
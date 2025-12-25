import React, { useState, useEffect } from "react";
import "./Dashboard.css";

interface AttendanceStats {
  on_time_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate: number;
}

interface ClassroomBreakdown {
  class_name: string;
  stats: { status: string; count: number }[];
  count: number;
}

function Dashboard() {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [classroomBreakdown, setClassroomBreakdown] = useState<ClassroomBreakdown[]>([]);

  useEffect(() => {
    // Fetch attendance statistics
    fetch("http://localhost:8080/api/student_attendance/statistic/daily/dashboard/")
      .then((res) => res.json())
      .then((data: AttendanceStats) => setAttendanceStats(data))
      .catch((err) => console.error("Error loading attendance stats:", err));

    // Fetch classroom breakdown
    fetch("http://localhost:8080/api/student_attendance/statistic/daily/classroom_breakdown/")
      .then((res) => res.json())
      .then((data: ClassroomBreakdown[]) => setClassroomBreakdown(data))
      .catch((err) => console.error("Error loading classroom breakdown:", err));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Papan Pemuka</h1>
        <p>Ringkasan statistik harian</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h3>Kehadiran Tepat Masa</h3>
            <p className="stat-value">{attendanceStats?.on_time_count ?? "-"}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#f59e0b" }}>
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="stat-content">
            <h3>Kehadiran Lewat</h3>
            <p className="stat-value" style={{ color: "#f59e0b" }}>
              {attendanceStats?.late_count ?? "-"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#ef4444" }}>
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Tiada Kehadiran</h3>
            <p className="stat-value" style={{ color: "#ef4444" }}>
              {attendanceStats?.absent_count ?? "-"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#10b981" }}>
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-content">
            <h3>Kadar Kehadiran</h3>
            <p className="stat-value" style={{ color: "#10b981" }}>
              {attendanceStats ? attendanceStats.attendance_rate : "-"}%
            </p>
          </div>
        </div>
      </div>

      {/* Classroom Breakdown */}
      <div className="classroom-breakdown-section">
        <h2>Ringkasan Kelas</h2>
        {classroomBreakdown.length > 0 ? (
          <table className="classroom-table">
            <thead>
              <tr>
                <th>Kelas</th>
                <th>Tepat Masa</th>
                <th>Lewat</th>
                <th>Tiada Kehadiran</th>
                <th>Jumlah Pelajar</th>
              </tr>
            </thead>
            <tbody>
              {classroomBreakdown.map((cls, idx) => {
                const onTime = cls.stats.find((s) => s.status === "on_time")?.count ?? 0;
                const late = cls.stats.find((s) => s.status === "late")?.count ?? 0;
                const absent = cls.stats.find((s) => s.status === "absent")?.count ?? 0;

                return (
                  <tr key={idx}>
                    <td>{cls.class_name}</td>
                    <td>{onTime}</td>
                    <td>{late}</td>
                    <td>{absent}</td>
                    <td>{cls.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>Memuatkan data kelas...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from "react";
import "./Dashboard.css";

interface Student {
  id: number;
  name: string;
  class: string;
  attendance_rate?: number;
  rmt_rate?: number;
}

function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [rmtRate, setRmtRate] = useState(0);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("http://localhost:8080/api/authentication/user/");
        const data = await res.json();

        // total number of students
        setTotalStudents(data.length);

        // calculate average attendance
        const avgAttendance = data.reduce(
          (sum: number, s: Student) => sum + (s.attendance_rate || 0),
          0
        ) / data.length;

        setAttendanceRate(Math.round(avgAttendance));

        // calculate average RMT rate
        const avgRmt = data.reduce(
          (sum: number, s: Student) => sum + (s.rmt_rate || 0),
          0
        ) / data.length;

        setRmtRate(Math.round(avgRmt));
      } catch (err) {
        console.error("Error loading students:", err);
      }
    }

    loadStudents();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Papan Pemuka</h1>
        <p>Ringkasan statistik dan log aktiviti terkini</p>
      </div>

      <div className="stats-grid">

        {/* TOTAL STUDENTS */}
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-content">
            <h3>Jumlah Pelajar</h3>
            <p className="stat-value">{totalStudents}</p>
          </div>
        </div>

        {/* ATTENDANCE RATE */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#10b981" }}>
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-content">
            <h3>Kadar Kehadiran</h3>
            <p className="stat-value" style={{ color: "#10b981" }}>
              {attendanceRate}%
            </p>
          </div>
        </div>

        {/* RMT RATE */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#0891b2" }}>
            <i className="bi bi-gear"></i>
          </div>
          <div className="stat-content">
            <h3>Kadar Pengedaran RMT</h3>
            <p className="stat-value" style={{ color: "#0891b2" }}>
              {rmtRate}%
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

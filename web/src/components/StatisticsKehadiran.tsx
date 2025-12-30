import React, { useState, useEffect, useRef } from "react";
import "./StatisticsKehadiran.css";

interface AttendanceStats {
  on_time_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate: number;
  attendance_rate_distirbution: Record<string, number>;
}

interface ClassroomBreakdown {
  class_name: string;
  stats: { status: string; count: number }[];
  count: number;
}

function StatisticsKehadiran() {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [classroomBreakdown, setClassroomBreakdown] = useState<ClassroomBreakdown[]>([]);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartInstance = useRef<any>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/student_attendance/statistic/daily/dashboard/")
      .then((res) => res.json())
      .then((data: AttendanceStats) => setAttendanceStats(data))
      .catch((err) => console.error("Error loading attendance stats:", err));

    fetch("http://localhost:8080/api/student_attendance/statistic/daily/classroom_breakdown/")
      .then((res) => res.json())
      .then((data: ClassroomBreakdown[]) => setClassroomBreakdown(data))
      .catch((err) => console.error("Error loading classroom breakdown:", err));
  }, []);

  // Create/update pie chart
  useEffect(() => {
    if (!attendanceStats || !pieChartRef.current) return;

    const labels = Object.keys(attendanceStats.attendance_rate_distirbution);
    const data = Object.values(attendanceStats.attendance_rate_distirbution);
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

    if (pieChartInstance.current) pieChartInstance.current.destroy();

    pieChartInstance.current = new (window as any).Chart(pieChartRef.current, {
      type: "pie",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: "#fff", borderWidth: 1 }] },
      options: { responsive: false, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
    });
  }, [attendanceStats]);

  return (
    <div className="statistics-module">
      {/* Overall Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Kehadiran Tepat Masa</h3>
          <p className="stat-value">{attendanceStats?.on_time_count ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Kehadiran Lewat</h3>
          <p className="stat-value" style={{ color: "#f59e0b" }}>{attendanceStats?.late_count ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Tiada Kehadiran</h3>
          <p className="stat-value" style={{ color: "#ef4444" }}>{attendanceStats?.absent_count ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Kadar Kehadiran</h3>
          <p className="stat-value" style={{ color: "#10b981" }}>{attendanceStats?.attendance_rate ?? "-"}%</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="chart-section">
        <h2>Taburan Kadar Kehadiran</h2>
        {attendanceStats ? (
          <div className="chart-wrapper">
            <canvas ref={pieChartRef}></canvas>
          </div>
        ) : <p>Memuatkan data taburan...</p>}
      </div>

      {/* Classroom Cards */}
      <div className="classroom-cards-section">
        <h2>Ringkasan Kelas</h2>
            <div className="classroom-cards-grid">
            {classroomBreakdown.map((cls, idx) => {
                const onTime = cls.stats.find(s => s.status === "on_time")?.count ?? 0;
                const late = cls.stats.find(s => s.status === "late")?.count ?? 0;
                const absent = cls.stats.find(s => s.status === "absent")?.count ?? 0;

                const total = cls.count || 1; // avoid division by zero
                const attendanceRate = Math.round((onTime / total) * 100);

                // Determine card color
                let borderColor = "#ef4444"; // default red for poor
                if (attendanceRate >= 95) borderColor = "#3b82f6"; // blue
                else if (attendanceRate >= 85) borderColor = "#10b981"; // green
                else if (attendanceRate >= 75) borderColor = "#f59e0b"; // yellow

                return (
                <div className="class-card" key={idx} style={{ borderTop: `5px solid ${borderColor}` }}>
                    <h3>{cls.class_name}</h3>
                    <p><span style={{ color: "#10b981" }}>Tepat Masa:</span> {onTime}</p>
                    <p><span style={{ color: "#f59e0b" }}>Lewat:</span> {late}</p>
                    <p><span style={{ color: "#ef4444" }}>Tiada Kehadiran:</span> {absent}</p>
                    <p><strong>Jumlah Pelajar: {cls.count}</strong></p>

                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${attendanceRate}%`, backgroundColor: borderColor }}
                    ></div>
                    </div>
                    <p className="attendance-rate-text">{attendanceRate}% Kehadiran</p>
                </div>
                );
            })}
            </div>
      </div>
    </div>
  );
}

export default StatisticsKehadiran;

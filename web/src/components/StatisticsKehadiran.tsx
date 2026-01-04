import React, { useState, useEffect, useRef } from "react";
import "./StatisticsKehadiran.css";

interface AttendanceStats {
  on_time_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate: number; // decimal (0–1)
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
      .then(res => res.json())
      .then((data: AttendanceStats) => setAttendanceStats(data))
      .catch(err => console.error("Error loading attendance stats:", err));

    fetch("http://localhost:8080/api/student_attendance/statistic/daily/classroom_breakdown/")
      .then(res => res.json())
      .then((data: ClassroomBreakdown[]) => setClassroomBreakdown(data))
      .catch(err => console.error("Error loading classroom breakdown:", err));
  }, []);

  // Pie chart
  useEffect(() => {
    if (!attendanceStats || !pieChartRef.current) return;

    const labels = Object.keys(attendanceStats.attendance_rate_distirbution);
    const data = Object.values(attendanceStats.attendance_rate_distirbution);

    if (pieChartInstance.current) pieChartInstance.current.destroy();

    pieChartInstance.current = new (window as any).Chart(pieChartRef.current, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }, [attendanceStats]);

  return (
    <div className="statistics-module">
      {/* Overall Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Kehadiran Tepat Masa</h3>
          <p className="stat-value">{attendanceStats?.on_time_count ?? "-"}</p>
        </div>

        <div className="stat-card">
          <h3>Kehadiran Lewat</h3>
          <p className="stat-value" style={{ color: "#f59e0b" }}>
            {attendanceStats?.late_count ?? "-"}
          </p>
        </div>

        <div className="stat-card">
          <h3>Tiada Kehadiran</h3>
          <p className="stat-value" style={{ color: "#ef4444" }}>
            {attendanceStats?.absent_count ?? "-"}
          </p>
        </div>

        <div className="stat-card">
          <h3>Kadar Kehadiran</h3>
          <p className="stat-value" style={{ color: "#10b981" }}>
            {attendanceStats
              ? (attendanceStats.attendance_rate * 100).toFixed(2)
              : "-"}
            %
          </p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="chart-section">
        <h2>Taburan Kadar Kehadiran</h2>
        {attendanceStats ? (
          <div className="chart-wrapper">
            <canvas ref={pieChartRef}></canvas>
          </div>
        ) : (
          <p>Memuatkan data taburan...</p>
        )}
      </div>

      {/* Classroom Cards */}
      <div className="classroom-cards-section">
        <h2>Ringkasan Kelas</h2>

        <div className="classroom-cards-grid">
          {classroomBreakdown.map((cls, idx) => {
            const total = cls.count || 1;

            const late =
              cls.stats.find(s => s.status.toLowerCase().includes("late"))?.count ?? 0;

            const absent =
              cls.stats.find(s => s.status.toLowerCase().includes("absent"))?.count ?? 0;

            // 🔑 DERIVED (not guessed)
            const onTime = Math.max(total - absent - late, 0);
            const present = onTime + late;

            const attendanceRate = Number(((present / total) * 100).toFixed(2));

            // Progress bar segments (together = present)
            const onTimePercent = (onTime / total) * 100;
            const latePercent = (late / total) * 100;

            let borderColor = "#ef4444";
            if (attendanceRate >= 95) borderColor = "#3b82f6";
            else if (attendanceRate >= 85) borderColor = "#10b981";
            else if (attendanceRate >= 75) borderColor = "#f59e0b";

            return (
              <div
                key={idx}
                className="class-card"
                style={{ borderTop: `5px solid ${borderColor}` }}
              >
                <h3>{cls.class_name}</h3>

                <p>
                  <span style={{ color: "#10b981" }}>Tepat Masa:</span> {onTime}
                </p>
                <p>
                  <span style={{ color: "#f59e0b" }}>Lewat:</span> {late}
                </p>
                <p>
                  <span style={{ color: "#ef4444" }}>Tiada Kehadiran:</span> {absent}
                </p>

                {/* ✅ Progress Bar: ON-TIME + LATE */}
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-segment on-time"
                    style={{ width: `${onTimePercent}%` }}
                  />
                  <div
                    className="progress-bar-segment late"
                    style={{ width: `${latePercent}%` }}
                  />
                </div>

                <p className="attendance-rate-text">
                  {attendanceRate}% Kehadiran ({present}/{total})
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatisticsKehadiran;

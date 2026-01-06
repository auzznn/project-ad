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
  const distributionChartRef = useRef<HTMLCanvasElement>(null);
  const distributionChartInstance = useRef<any>(null);

  // ===== STATUS PIE (Kehadiran) =====
const STATUS_ORDER = ["on_time", "late", "absent"];

const STATUS_LABEL_MAP: Record<string, string> = {
  on_time: "Tepat Masa",
  late: "Lewat",
  absent: "Tiada Kehadiran",
};

const STATUS_COLOR_MAP: Record<string, string> = {
  on_time: "#10b981",
  late: "#f59e0b",
  absent: "#ef4444",
};

// ===== DISTRIBUTION PIE (Kadar Kehadiran) =====
const DISTRIBUTION_ORDER = ["Excellent", "Good", "Average", "Poor"];

const DISTRIBUTION_LABEL_MAP: Record<string, string> = {
  Excellent: "Cemerlang",
  Good: "Baik",
  Average: "Sederhana",
  Poor: "Lemah",
};

const DISTRIBUTION_COLOR_MAP: Record<string, string> = {
  Excellent: "#3b82f6",
  Good: "#10b981",
  Average: "#f59e0b",
  Poor: "#ef4444",
};

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

  const statusDataMap: Record<string, number> = {
    on_time: attendanceStats.on_time_count,
    late: attendanceStats.late_count,
    absent: attendanceStats.absent_count,
  };

  const labels = STATUS_ORDER.map(k => STATUS_LABEL_MAP[k]);
  const data = STATUS_ORDER.map(k => statusDataMap[k]);
  const backgroundColor = STATUS_ORDER.map(k => STATUS_COLOR_MAP[k]);

  if (pieChartInstance.current) pieChartInstance.current.destroy();

  pieChartInstance.current = new (window as any).Chart(pieChartRef.current, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}, [attendanceStats]);

useEffect(() => {
  if (!attendanceStats || !distributionChartRef.current) return;

  const rawDistribution = attendanceStats.attendance_rate_distirbution;

  const labels = DISTRIBUTION_ORDER.map(
    k => DISTRIBUTION_LABEL_MAP[k]
  );

  const data = DISTRIBUTION_ORDER.map(
    k => rawDistribution[k] ?? 0
  );

  const backgroundColor = DISTRIBUTION_ORDER.map(
    k => DISTRIBUTION_COLOR_MAP[k]
  );

  if (distributionChartInstance.current) {
    distributionChartInstance.current.destroy();
  }

  distributionChartInstance.current = new (window as any).Chart(
    distributionChartRef.current,
    {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    }
  );
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
          <h3>Kehadiran Lambat</h3>
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

      {/* Pie Charts */}
      <div className="chart-section">
        {attendanceStats ? (
          <div className="charts-row">
            {/* Status Pie */}
            <div className="chart-wrapper">
              <h4>Status Kehadiran</h4>
              <canvas ref={pieChartRef} width={300} height={300}></canvas>
            </div>

            {/* Distribution Pie */}
            <div className="chart-wrapper">
              <h4>Taburan Kadar Kehadiran</h4>
              <canvas ref={distributionChartRef} width={300} height={300}></canvas>
            </div>
          </div>
        ) : (
          <p>Memuatkan carta...</p>
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
                  <span style={{ color: "#f59e0b" }}>Lambat:</span> {late}
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

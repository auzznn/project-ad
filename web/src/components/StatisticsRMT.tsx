import React, { useState, useEffect } from "react";

// Using CDN Chart.js
declare global {
  interface Window {
    Chart: any;
  }
}

interface SummaryCards {
  present_rmt: number;
  not_present_rmt: number;
  rmt_percentage: number;
}

interface RMTTrends {
  [key: string]: { is_present_count: number; not_present_count: number };
}

interface Student {
  student_id: number;
  fullname: string;
  average_rmt_percentage: number;
  today_is_present: boolean;
  latest_present: string | null;
}

function StatisticsRMT() {
  const [summary, setSummary] = useState<SummaryCards | null>(null);
  const [trends, setTrends] = useState<RMTTrends>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("yearly");

  // Fetch Summary Cards
  useEffect(() => {
    fetch("http://localhost:8080/api/rmt/statistic/summary-cards/")
      .then(res => res.json())
      .then(setSummary)
      .catch(err => console.error(err));
  }, []);

  // Fetch Trends
  useEffect(() => {
    fetch(`http://localhost:8080/api/rmt/statistic/rmt_trends/${period}/`)
      .then(res => res.json())
      .then(setTrends)
      .catch(err => console.error(err));
  }, [period]);

  // Fetch Students
  useEffect(() => {
    fetch("http://localhost:8080/api/rmt/statistic/rmt-student/")
      .then(res => res.json())
      .then(setStudents)
      .catch(err => console.error(err));
  }, []);

  // Draw chart after trends loaded
  useEffect(() => {
    if (!window.Chart || !trends) return;
    const ctx = (document.getElementById("rmtChart") as HTMLCanvasElement)?.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if exists
    if ((window as any).rmtChartInstance) {
      (window as any).rmtChartInstance.destroy();
    }

    const labels = Object.keys(trends);
    const presentData = labels.map(l => trends[l].is_present_count);
    const notPresentData = labels.map(l => trends[l].not_present_count);

    (window as any).rmtChartInstance = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Present", data: presentData, backgroundColor: "#10b981" },
          { label: "Not Present", data: notPresentData, backgroundColor: "#ef4444" },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
      },
    });
  }, [trends]);

  return (
    <div className="rmt-container">
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Present RMT</h3>
            <p className="stat-value">{summary?.present_rmt ?? "-"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Not Present RMT</h3>
            <p className="stat-value">{summary?.not_present_rmt ?? "-"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>RMT %</h3>
            <p className="stat-value">{summary?.rmt_percentage ?? "-"}%</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div style={{ margin: "20px 0" }}>
        <button onClick={() => setPeriod("weekly")}>Weekly</button>
        <button onClick={() => setPeriod("monthly")}>Monthly</button>
        <button onClick={() => setPeriod("yearly")}>Yearly</button>
      </div>

      {/* Trends Chart */}
      <canvas id="rmtChart" style={{ maxHeight: "400px" }} />

      {/* Student List */}
      <div style={{ marginTop: "30px" }}>
        <h3>Students</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
              <th style={{ padding: "8px" }}>Avg %</th>
              <th style={{ padding: "8px" }}>Today Present</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.student_id} style={{ borderTop: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{s.fullname}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.average_rmt_percentage}%</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  {s.today_is_present ? "✅" : "❌"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatisticsRMT;

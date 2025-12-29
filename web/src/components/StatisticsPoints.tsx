import React, { useState, useEffect } from "react";

// Chart.js global type
declare global {
  interface Window {
    Chart: any;
  }
}

interface DashboardCards {
  monthly_record_count: number;
  monthly_total_point: number;
  monthly_average_point_per_student: number;
}

interface TrendPoint {
  month_name: string;
  total_points: number;
  record_count: number;
}

interface TagDistribution {
  total_records: number;
  distribution: { tag: string; record_count: number; percentage: number }[];
}

interface PointsByTag {
  tag_name: string;
  total_points_sum: number;
  total_records: number;
}

interface Props {
  moduleType: "sahsiah" | "disiplin";
}

function StatisticsPointsModule({ moduleType }: Props) {
  const [dashboardCards, setDashboardCards] = useState<DashboardCards | null>(null);
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([]);
  const [tagDistribution, setTagDistribution] = useState<TagDistribution | null>(null);
  const [pointsByTag, setPointsByTag] = useState<PointsByTag[]>([]);

  // Fetch dashboard cards
  useEffect(() => {
    fetch(`http://localhost:8080/api/${moduleType}/statistic/dashboard_cards/`)
      .then(res => res.json())
      .then(setDashboardCards)
      .catch(console.error);
  }, [moduleType]);

  // Fetch trend points
  useEffect(() => {
    fetch(`http://localhost:8080/api/${moduleType}/statistic/trend_points/`)
      .then(res => res.json())
      .then(setTrendPoints)
      .catch(console.error);
  }, [moduleType]);

  // Fetch tag distribution
  useEffect(() => {
    fetch(`http://localhost:8080/api/${moduleType}/statistic/tag_distribution/`)
      .then(res => res.json())
      .then(setTagDistribution)
      .catch(console.error);
  }, [moduleType]);

  // Fetch points by tag
  useEffect(() => {
    fetch(`http://localhost:8080/api/${moduleType}/statistic/points_by_tag/`)
      .then(res => res.json())
      .then(setPointsByTag)
      .catch(console.error);
  }, [moduleType]);

  // Draw charts
  useEffect(() => {
    // Monthly Trend Chart
    if (trendPoints.length > 0 && window.Chart) {
      const ctx = (document.getElementById(`${moduleType}-trendChart`) as HTMLCanvasElement)?.getContext("2d");
      if (!ctx) return;
      if ((window as any)[`${moduleType}TrendChart`]) {
        (window as any)[`${moduleType}TrendChart`].destroy();
      }

      const labels = trendPoints.map(tp => tp.month_name);
      const totalPoints = trendPoints.map(tp => tp.total_points);

      (window as any)[`${moduleType}TrendChart`] = new window.Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Total Points",
              data: totalPoints,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.3)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      });
    }

    // Tag Distribution Pie Chart
    if (tagDistribution && window.Chart) {
      const ctx = (document.getElementById(`${moduleType}-tagChart`) as HTMLCanvasElement)?.getContext("2d");
      if (!ctx) return;
      if ((window as any)[`${moduleType}TagChart`]) {
        (window as any)[`${moduleType}TagChart`].destroy();
      }

      const labels = tagDistribution.distribution.map(d => d.tag);
      const data = tagDistribution.distribution.map(d => d.record_count);

      (window as any)[`${moduleType}TagChart`] = new window.Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
            },
          ],
        },
        options: { responsive: true },
      });
    }
  }, [trendPoints, tagDistribution, moduleType]);

  return (
    <div className="points-module">
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Records this month</h3>
          <p className="stat-value">{dashboardCards?.monthly_record_count ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Total Points</h3>
          <p className="stat-value">{dashboardCards?.monthly_total_point ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Points per Student</h3>
          <p className="stat-value">{dashboardCards?.monthly_average_point_per_student ?? "-"}</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginTop: "20px" }}>
        <h3>Monthly Points Trend</h3>
        <canvas id={`${moduleType}-trendChart`} style={{ width: "100%", maxHeight: "300px" }} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Tag Distribution</h3>
        <canvas id={`${moduleType}-tagChart`} style={{ width: "100%", maxHeight: "300px" }} />
      </div>

      {/* Points by Tag */}
      <div style={{ marginTop: "20px" }}>
        <h3>Points by Tag</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>Tag</th>
              <th style={{ textAlign: "center", padding: "8px" }}>Total Points</th>
              <th style={{ textAlign: "center", padding: "8px" }}>Records</th>
            </tr>
          </thead>
          <tbody>
            {pointsByTag.map(p => (
              <tr key={p.tag_name} style={{ borderTop: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{p.tag_name}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{p.total_points_sum}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{p.total_records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatisticsPointsModule;

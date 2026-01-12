import { useState, useEffect } from "react";

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
  moduleType: "sahsiah" | "discipline";
}

function StatisticsPointsModule({ moduleType }: Props) {
  const [dashboardCards, setDashboardCards] = useState<DashboardCards | null>(null);
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([]);
  const [tagDistribution, setTagDistribution] = useState<TagDistribution | null>(null);
  const [pointsByTag, setPointsByTag] = useState<PointsByTag[]>([]);

  // Fetch dashboard cards
  useEffect(() => {
    fetch(`https://backend.eduqr.cloud/api/${moduleType}/statistic/dashboard_cards/`)
      .then(res => res.json())
      .then(setDashboardCards)
      .catch(console.error);
  }, [moduleType]);

  // Fetch trend points
  useEffect(() => {
    fetch(`https://backend.eduqr.cloud/api/${moduleType}/statistic/trend_points/`)
      .then(res => res.json())
      .then(data => setTrendPoints(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [moduleType]);

  // Fetch tag distribution
  useEffect(() => {
    fetch(`https://backend.eduqr.cloud/api/${moduleType}/statistic/tag_distribution/`)
      .then(res => res.json())
      .then(setTagDistribution)
      .catch(console.error);
  }, [moduleType]);

  // Fetch points by tag
  useEffect(() => {
    fetch(`https://backend.eduqr.cloud/api/${moduleType}/statistic/points_by_tag/`)
      .then(res => res.json())
      .then(data => setPointsByTag(Array.isArray(data) ? data : []))
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
    const totalPoints =
      moduleType === "discipline"
        ? trendPoints.map(tp => -tp.total_points)
        : trendPoints.map(tp => tp.total_points);

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
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            ticks: moduleType === "discipline"
              ? {
                  callback: (value: number) => -value, // only discipline
                }
              : undefined, // default for sahsiah
          },
        },
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });

    }

    // Tag Distribution Pie Chart
    if (
      tagDistribution &&
      Array.isArray(tagDistribution.distribution) &&
      tagDistribution.distribution.length > 0 &&
      window.Chart
    ) {
      const ctx = (document.getElementById(`${moduleType}-tagChart`) as HTMLCanvasElement)?.getContext("2d");
      if (!ctx) return;

      // Destroy previous chart if exists
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
        options: { 
          responsive: true,
          plugins: { 
            legend: { position: "bottom" }, 
          },
        }, 
      }); 
    }
  }, [trendPoints, tagDistribution, moduleType]);

  return (
    <div className="points-module">
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Rekod Bulan Ini</h3>
          <p className="stat-value">{dashboardCards?.monthly_record_count ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Mata Total</h3>
          <p className="stat-value">{dashboardCards?.monthly_total_point ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Rerata Mata Siswa</h3>
          <p className="stat-value">{dashboardCards?.monthly_average_point_per_student ?? "-"}</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginTop: "20px" }}>
        <h3>Mata Bulanan</h3>
        <canvas id={`${moduleType}-trendChart`} style={{ width: "100%", maxHeight: "300px" }} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Penyebaran Kategori</h3>
        <canvas id={`${moduleType}-tagChart`} style={{ width: "100%", maxHeight: "300px" }} />
      </div>

      {/* Points by Tag */}
      <div className="points-module">
        <h3>Mata Tiap Kategori</h3>
        <div className="table-wrapper">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Kategori</th>
                <th className="center">Mata Total</th>
                <th className="center">Rekod</th>
              </tr>
            </thead>
            <tbody>
              {pointsByTag.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={3}>Tiada rekod</td>
                </tr>
              ) : (
                pointsByTag.map(p => (
                  <tr key={p.tag_name}>
                    <td>{p.tag_name}</td>
                    <td className="center">{p.total_points_sum}</td>
                    <td className="center">{p.total_records}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StatisticsPointsModule;

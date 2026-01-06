import React, { useState, useEffect } from "react";
import Pagination from "../components/pagination";
import SearchBar from "../components/SearchBar";

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
  class_room: string;
}

function StatisticsRMT() {
  const [summary, setSummary] = useState<SummaryCards | null>(null);
  const [trends, setTrends] = useState<RMTTrends>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("yearly");

  // Table filters
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const studentsPerPage = 10;

  // Fetch summary cards
  useEffect(() => {
    fetch("http://localhost:8080/api/rmt/statistic/summary-cards/")
      .then(res => res.json())
      .then(setSummary)
      .catch(console.error);
  }, []);

  // Fetch trends
  useEffect(() => {
    fetch(`http://localhost:8080/api/rmt/statistic/rmt_trends/${period}/`)
      .then(res => res.json())
      .then(setTrends)
      .catch(console.error);
  }, [period]);

  // Fetch students
  useEffect(() => {
    fetch("http://localhost:8080/api/rmt/statistic/rmt-student/")
      .then(res => res.json())
      .then((data: Student[]) => setStudents(data))
      .catch(console.error);
  }, []);

  // Chart rendering
  useEffect(() => {
    if (!window.Chart || !trends) return;
    const ctx = (document.getElementById("rmtChart") as HTMLCanvasElement)?.getContext("2d");
    if (!ctx) return;

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
          { label: "Mengambil RMT", data: presentData, backgroundColor: "#10b981" },
          { label: "Belum Mengambil RMT", data: notPresentData, backgroundColor: "#ef4444" },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
      },
    });
  }, [trends]);

  // Filtering & Pagination
  const filteredStudents = students
    .filter(s => !classFilter || s.class_room === classFilter)
    .filter(s => s.fullname.toLowerCase().includes(searchTerm.toLowerCase()));

  const paginatedStudents = filteredStudents.slice(
    (page - 1) * studentsPerPage,
    page * studentsPerPage
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredStudents.length / studentsPerPage) || 1);
    setPage(1);
  }, [searchTerm, classFilter, students]);

  const uniqueClasses = Array.from(new Set(students.map(s => s.class_room))).sort();

  return (
    <div className="sahsiah-container">

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Mengambil RMT</h3>
          <p className="stat-value">{summary?.present_rmt ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Belum Mengambil RMT</h3>
          <p className="stat-value">{summary?.not_present_rmt ?? "-"}</p>
        </div>
        <div className="stat-card">
          <h3>Kadar Menerima RMT</h3>
          <p className="stat-value">{summary?.rmt_percentage ?? "-"}%</p>
        </div>
      </div>

      {/* Period Buttons */}
      <div className="action-buttons">
        {(["weekly", "monthly", "yearly"] as const).map(p => (
          <button
            key={p}
            className={`module-btn ${period === p ? "active" : ""}`}
            onClick={() => setPeriod(p)}
          >
            {p === "weekly" ? "Mingguan" : p === "monthly" ? "Bulanan" : "Tahunan"}
          </button>
        ))}
      </div>

      {/* Trends Chart */}
      <canvas id="rmtChart" style={{ maxHeight: "400px", marginTop: "20px" }} />

      {/* Table Filters */}
      <div className="controls-row">
        <SearchBar
          value={searchTerm}
          placeholder="Cari pelajar..."
          onChange={setSearchTerm}
        />
        <select
          className="form-control"
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
        >
          <option value="">Semua Kelas</option>
          {uniqueClasses.map(cls => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="section-box table-wrapper">
        <table className="table-custom">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kelas</th>
              <th style={{ textAlign: "center" }}>Purata</th>
              <th style={{ textAlign: "center" }}>Mengambil</th>
              <th style={{ textAlign: "center" }}>Tarikh Terakhir Hadir</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5}>Tiada rekod</td>
              </tr>
            ) : (
              paginatedStudents.map(s => (
                <tr key={s.student_id}>
                  <td>{s.fullname}</td>
                  <td>{s.class_room}</td>
                  <td style={{ textAlign: "center" }}>
                    {s.average_rmt_percentage}%
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={
                        s.today_is_present ? "status-present" : "status-absent"
                      }
                    >
                      {s.today_is_present ? "Telah Mengambil RMT" : "Belum Mengambil RMT"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {s.latest_present
                      ? new Date(s.latest_present).toLocaleDateString()
                      : "Tiada"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default StatisticsRMT;

import { useEffect, useState } from "react";
import "./AttendanceTable.css";
import Pagination from "../components/pagination";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";

/* ================= Interfaces ================= */

interface Student {
  id: number;
  name: string;
  grade: number;
  section: string;
  academic_year: string;
  rmt_elligible: boolean;
  qr_code: string;
}

interface RMTRecord {
  student: Student;
  date: string;
  timestamp: string;
  is_present: boolean;
}

interface Classroom {
  id: number;
  grade: number;
  class_section: string;
}

/* ================= Component ================= */

export default function RMTPage() {
  const [records, setRecords] = useState<RMTRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "">("");
  const [classFilter, setClassFilter] = useState<string>("");

  /* ===== Pagination ===== */
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  /* ================= Fetch ================= */

  const fetchRMT = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://72.62.65.202:8080/api/rmt/daily/");
      const data: RMTRecord[] = await res.json();

      let filtered = Array.isArray(data) ? data : [];

      if (gradeFilter !== "") {
        filtered = filtered.filter(
          (r) => r.student.grade === gradeFilter
        );
      }

      if (classFilter !== "") {
        filtered = filtered.filter(
          (r) => r.student.section === classFilter
        );
      }

      setRecords(filtered);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      setPage(1);
    } catch (err) {
      console.error("Fetch RMT error:", err);
      setRecords([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRMT();
  }, [gradeFilter, classFilter]);

  /* ================= Classroom List ================= */

  const fetchClassrooms = async () => {
    try {
      const res = await fetch(
        "http://72.62.65.202:8080/api/authentication/classroom/"
      );
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setClassrooms([]);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  /* ================= Helpers ================= */

  const formatTime = (ts: string) => {
    if (!ts) return "--";
    const time = ts.substring(11, 16);
    return time === "00:00" ? "--" : time;
  };

  const getStatusLabel = (present: boolean) =>
    present ? "Telah Menerima RMT" : "Belum Menerima RMT";

  const getStatusClass = (present: boolean) =>
    present ? "status-present" : "status-absent";

  /* ================= Derived ================= */

  const filtered = records.filter((r) =>
    r.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= Render ================= */

  return (
    <div className="page-container">
      <h1 className="page-title">Pengurusan RMT</h1>

      <div className="section-box">
        <div className="controls-row">
          <SearchBar
            value={searchTerm}
            placeholder="Cari pelajar..."
            onChange={setSearchTerm}
          />
        </div>

        <div className="controls-row">
          <FilterDropdown
            label="Tingkat"
            value={gradeFilter}
            onChange={(value) => {
              setGradeFilter(value === "" ? "" : Number(value));
              setClassFilter("");
            }}
            options={[
              { value: "", label: "Semua Tingkat" },
              ...[...new Set(classrooms.map((c) => c.grade))].map((g) => ({
                value: g,
                label: `Tingkat ${g}`,
              })),
            ]}
          />

          <FilterDropdown
            label="Kelas"
            value={classFilter}
            disabled={gradeFilter === ""}
            onChange={(value) => setClassFilter(String(value))}
            options={[
              { value: "", label: "Semua Kelas" },
              ...classrooms
                .filter((c) => c.grade === gradeFilter)
                .map((c) => ({
                  value: c.class_section,
                  label: c.class_section,
                })),
            ]}
          />
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Memuat...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    Tiada Rekod RMT
                  </td>
                </tr>
              ) : (
                paginated.map((rec, idx) => (
                  <tr key={`${rec.student.id}-${idx}`}>
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{rec.student.name}</td>
                    <td>
                      {rec.student.grade}-{rec.student.section}
                    </td>
                    <td>{formatTime(rec.timestamp)}</td>
                    <td>
                      <span
                        className={`status-box ${getStatusClass(
                          rec.is_present
                        )}`}
                      >
                        {getStatusLabel(rec.is_present)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

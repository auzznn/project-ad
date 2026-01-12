import { useEffect, useState } from "react";
import "./AttendanceTable.css";
import Pagination from "../components/pagination";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import { authFetch } from "../services/authFetch";

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
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "">("");
  const [classFilter, setClassFilter] = useState<string>("");

  const [showAllStudents, setShowAllStudents] = useState(false);

  /* ===== Pagination ===== */
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= Fetch RMT Records ================= */

  const fetchRMT = async () => {
    setLoading(true);
    try {
      const res = await authFetch("https://backend.eduqr.cloud/api/rmt/daily/");
      const data: RMTRecord[] = await res.json();

      let filtered = Array.isArray(data) ? data : [];
      if (gradeFilter !== "") filtered = filtered.filter(r => r.student.grade === gradeFilter);
      if (classFilter !== "") filtered = filtered.filter(r => r.student.section === classFilter);

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
    if (!showAllStudents) fetchRMT();
  }, [gradeFilter, classFilter, showAllStudents]);

  /* ================= Fetch All Students ================= */

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      const res = await authFetch("https://backend.eduqr.cloud/api/authentication/student/");
      const data: Student[] = await res.json();
      setAllStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch all students error:", err);
      setAllStudents([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Fetch Classrooms ================= */

  const fetchClassrooms = async () => {
    try {
      const res = await authFetch("https://backend.eduqr.cloud/api/authentication/classroom/");
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setClassrooms([]);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  /* ================= Update Eligibility Function ================= */

  const updateStudentEligibility = async (studentId: number, eligible: boolean) => {
    try {
      const res = await authFetch(
        `https://backend.eduqr.cloud/api/authentication/student/${studentId}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ rmt_elligible: eligible }),
        }
      );

      if (!res.ok) throw new Error("Gagal mengemaskini kelayakan pelajar");
      return await res.json();
    } catch (err) {
      console.error("Update eligibility error:", err);
      alert("Gagal mengemaskini kelayakan pelajar.");
      return null;
    }
  };

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

  const filteredRecords = records.filter(r =>
    r.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const filteredAllStudents = allStudents
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(s => (gradeFilter === "" ? true : s.grade === gradeFilter))
    .filter(s => (classFilter === "" ? true : s.section === classFilter));

  /* ================= Render ================= */

  return (
    <div className="page-container">
      <h1 className="page-title">Pengurusan RMT</h1>

      <div className="section-box">
        {/* Toggle Button */}
        <div className="controls-row">
          <button
            className="btn-secondary"
            onClick={() => {
              setShowAllStudents(!showAllStudents);
              if (!showAllStudents && allStudents.length === 0) fetchAllStudents();
            }}
          >
            {showAllStudents ? "Kembali ke RMT Harian" : "Urus Kelayakan Pelajar"}
          </button>
        </div>

        {/* Search */}
        <div className="controls-row">
          <SearchBar
            value={searchTerm}
            placeholder="Cari pelajar..."
            onChange={setSearchTerm}
          />
        </div>

        {/* Filters */}
        <div className="controls-row">
          <FilterDropdown
            label="Tingkat"
            value={gradeFilter}
            onChange={(value) => {
              setGradeFilter(value === "" ? "" : Number(value));
              setClassFilter(""); // reset class when grade changes
            }}
            options={[
              { value: "", label: "Semua Tingkat" },
              ...[...new Set(classrooms.map(c => c.grade))].map(g => ({ value: g, label: `Tingkat ${g}` })),
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
                .filter(c => c.grade === gradeFilter)
                .map(c => ({ value: c.class_section, label: c.class_section })),
            ]}
          />
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Nama</th>
                <th>Kelas</th>
                {showAllStudents ? <th>Kelayakan RMT</th> : <>
                  <th>Waktu</th>
                  <th>Status</th>
                </>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showAllStudents ? 4 : 5} className="empty-row">
                    Memuat...
                  </td>
                </tr>
              ) : showAllStudents ? (
                filteredAllStudents.map((student, idx) => (
                  <tr key={student.id}>
                    <td>{idx + 1}</td>
                    <td>{student.name}</td>
                    <td>{student.grade}-{student.section}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={student.rmt_elligible}
                        onChange={async (e) => {
                          const newValue = e.target.checked;
                          const updated = await updateStudentEligibility(student.id, newValue);
                          if (updated) {
                            setAllStudents(prev =>
                              prev.map(s => s.id === student.id ? { ...s, rmt_elligible: newValue } : s)
                            );
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">Tiada Rekod RMT</td>
                </tr>
              ) : (
                paginatedRecords.map((rec, idx) => (
                  <tr key={`${rec.student.id}-${idx}`}>
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{rec.student.name}</td>
                    <td>{rec.student.grade}-{rec.student.section}</td>
                    <td>{formatTime(rec.timestamp)}</td>
                    <td>
                      <span className={`status-box ${getStatusClass(rec.is_present)}`}>
                        {getStatusLabel(rec.is_present)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!showAllStudents && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

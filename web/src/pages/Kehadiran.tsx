import { useEffect, useState } from "react";
import "./AttendanceTable.css";
import Pagination from "../components/pagination";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";

/* ================= Interfaces ================= */

interface Student {
  student_id: number;
  name: string;
  grade: number;
  section: string;
  academic_year: string;
  rmt_elligible: boolean;
}

interface AttendanceRecord {
  id?: number;
  student: Student | null;
  status: "on-time" | "late" | "absent";
  date: string;
  timestamp: string;
  note?: string | null;
}

interface AttendanceResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  total_items: number;
  page_number: number;
  entry: AttendanceRecord[];
}

interface Classroom {
  id: number;
  grade: number;
  class_section: string;
}

/* ================= Component ================= */

export default function KehadiranPage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  /* ===== Notes Modal ===== */
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecord | null>(null);
  const [noteText, setNoteText] = useState("");

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [gradeFilter, setGradeFilter] = useState<number | "">("");
  const [classFilter, setClassFilter] = useState<string>("");

  /* ================= Fetch Attendance ================= */

  const fetchAttendance = async (pageNumber: number = 1) => {
    setLoading(true);
    try {
      let url = `https://backend.eduqr.cloud/api/student_attendance/daily/?page=${pageNumber}`;

      if (gradeFilter !== "" && classFilter !== "") {
        url = `https://backend.eduqr.cloud/api/student_attendance/daily/${gradeFilter}/${classFilter}/?page=${pageNumber}`;
      }

      const res = await fetch(url);
      const data: AttendanceResponse = await res.json();

      let entries = Array.isArray(data.entry) ? data.entry : [];

      if (gradeFilter !== "" && classFilter === "") {
        entries = entries.filter(
          (rec) => rec.student?.grade === gradeFilter
        );
      }

      setAttendanceList(entries);
      setPage(data.page_number ?? 1);
      setPageSize(entries.length || 20);
      setTotalPages(Math.ceil(data.total_items / pageSize));
    } catch (err) {
      console.error("Fetch error:", err);
      setAttendanceList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [gradeFilter, classFilter]);

  useEffect(() => {
    fetchAttendance(page);
  }, [page, gradeFilter, classFilter]);

  /* ================= Classroom List ================= */

  const fetchClassrooms = async () => {
    try {
      const res = await fetch(
        "https://backend.eduqr.cloud/api/authentication/classroom/"
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

  const filteredAttendance = attendanceList
    .filter((rec) => rec.student !== null)
    .filter((rec) =>
      (rec.student?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const getStatusLabel = (status: AttendanceRecord["status"]) => {
    if (status === "on-time") return "Tepat Waktu";
    if (status === "late") return "Lambat";
    return "Tidak Hadir";
  };

  const getStatusClass = (label: string) => {
    if (label === "Tepat Waktu") return "status-present";
    if (label === "Lambat") return "status-late";
    return "status-absent";
  };

  const formatTime = (ts: string) => {
    if (!ts) return "--";
    const time = ts.substring(11, 16);
    return time === "00:00" ? "--" : time;
  };

  /* ================= Notes ================= */

  const openNoteModal = (rec: AttendanceRecord) => {
    setSelectedRecord(rec);
    setNoteText(rec.note || "");
    setNoteModalOpen(true);
  };

  const saveNote = async () => {
    if (!selectedRecord?.id) return;

    try {
      const res = await fetch(
        `https://backend.eduqr.cloud/api/student_attendance/${selectedRecord.id}/note/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: noteText }),
        }
      );

      if (!res.ok) {
        console.error("Save note failed:", await res.text());
      }

      fetchAttendance(page);
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setNoteModalOpen(false);
      setSelectedRecord(null);
      setNoteText("");
    }
  };

  /* ================= Render ================= */

  return (
    <div className="page-container">
      <h1 className="page-title">Pengurusan Kehadiran</h1>

      <div className="section-box">
        <div className="controls-row">
          <SearchBar
            value={searchTerm}
            placeholder="Cari kehadiran pelajar..."
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
                <th>Catatan</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Memuat...
                  </td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Tiada rekod keharidan
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec, idx) => {
                  const statusLabel = getStatusLabel(rec.status);
                  return (
                    <tr key={rec.id ?? idx}>
                      <td>{(page - 1) * pageSize + idx + 1}</td>
                      <td>{rec.student?.name}</td>
                      <td>
                        {rec.student?.grade}-{rec.student?.section}
                      </td>
                      <td>{formatTime(rec.timestamp)}</td>
                      <td>
                        <span
                          className={`status-box ${getStatusClass(
                            statusLabel
                          )}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td>
                        <div className="note-button">
                          {rec.note ? (
                            <span
                              className="note-preview clickable"
                              onClick={() => openNoteModal(rec)}
                              title="Edit catatan"
                            >
                              {rec.note}
                            </span>
                          ) : (
                          <button
                            className="action-btn note-btn compact"
                            onClick={() => openNoteModal(rec)}
                          >
                            +
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* ================= Notes Modal ================= */}
      {noteModalOpen && selectedRecord && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2 className="modal-title">Catatan Kehadiran</h2>
            <p className="modal-subtitle">
              {selectedRecord.student?.name}
            </p>
            <textarea
              className="note-textarea"
              placeholder="Tambah catatan..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="modal-btn-row">
              <button
                className="modal-cancel"
                onClick={() => setNoteModalOpen(false)}
              >
                Batal
              </button>
              <button className="modal-save" onClick={saveNote}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

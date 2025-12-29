import React, { useEffect, useState } from "react";
import Pagination from "./pagination";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";

/* ================= Interfaces ================= */

export interface LeaderboardEntry {
  student_id: number;
  student_name: string;
  point: number;
  class_room: string;
  ranking: number;
}

export interface Classroom {
  id: number;
  grade: number;
  class_section: string;
}

export interface StudentRecord {
  id: number;
  timestamp: string;
  migrate_student_id: number;
  type_id: number;
}

export interface RecordType {
  id: number;
  name: string;
  description: string;
  points: number;
  tag: string;
}

/* ================= Props ================= */

interface LeaderboardBaseProps {
  title: string;

  leaderboardBaseUrl: string;
  leaderboardByGradeUrl: (grade: number) => string;
  leaderboardByGradeClassUrl: (grade: number, cls: string) => string;

  studentRecordUrl: (studentId: number) => string;
  typeListUrl: string;

  recordTypeKey: "sahsiah_type" | "discipline_type";
}

/* ================= Component ================= */

export default function PapanPendahulu({
  title,
  leaderboardBaseUrl,
  leaderboardByGradeUrl,
  leaderboardByGradeClassUrl,
  studentRecordUrl,
  typeListUrl,
  recordTypeKey,
}: LeaderboardBaseProps) {
  /* ---------- State ---------- */
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [types, setTypes] = useState<RecordType[]>([]);

  const [gradeFilter, setGradeFilter] = useState<number | "">("");
  const [classFilter, setClassFilter] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedStudent, setSelectedStudent] =
    useState<LeaderboardEntry | null>(null);
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([]);
  const [recordLoading, setRecordLoading] = useState(false);

  /* ---------- Fetch classrooms ---------- */
  const fetchClassrooms = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/authentication/classroom/"
      );
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setClassrooms([]);
    }
  };

  /* ---------- Fetch leaderboard ---------- */
  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      let url = `${leaderboardBaseUrl}?page=${page}`;

      if (gradeFilter && classFilter) {
        url = `${leaderboardByGradeClassUrl(
          gradeFilter,
          classFilter
        )}?page=${page}`;
      } else if (gradeFilter) {
        url = `${leaderboardByGradeUrl(gradeFilter)}?page=${page}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setLeaderboard(Array.isArray(data.entry) ? data.entry : []);
      setTotalPages(
        data.total_items && data.entry?.length
          ? Math.ceil(data.total_items / data.entry.length)
          : 1
      );
    } catch {
      setLeaderboard([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Fetch types ---------- */
  const fetchTypes = async () => {
    try {
      const res = await fetch(typeListUrl);
      const data = await res.json();
      setTypes(Array.isArray(data.entry) ? data.entry : []);
    } catch {
      setTypes([]);
    }
  };

  /* ---------- Fetch student records ---------- */
  const fetchStudentRecords = async (studentId: number) => {
    setRecordLoading(true);

    try {
      const res = await fetch(studentRecordUrl(studentId));
      const data = await res.json();
      setStudentRecords(Array.isArray(data.entry) ? data.entry : []);
    } catch {
      setStudentRecords([]);
    } finally {
      setRecordLoading(false);
    }
  };

  const getType = (id: number) => types.find((t) => t.id === id);

  /* ---------- Filters ---------- */
  const filteredLeaderboard = leaderboard.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      item.student_name.toLowerCase().includes(term) ||
      item.class_room.toLowerCase().includes(term)
    );
  });

  /* ---------- Effects ---------- */
  useEffect(() => {
    fetchClassrooms();
    fetchTypes();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [gradeFilter, classFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [gradeFilter, classFilter]);

  /* ---------- Render ---------- */
  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>

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
            onChange={(v) => {
              setGradeFilter(v === "" ? "" : Number(v));
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
            onChange={(v) => setClassFilter(String(v))}
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
                <th>Nama Pelajar</th>
                <th>Kelas</th>
                <th>Jumlah Mata</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Memuatkan leaderboard...
                  </td>
                </tr>
              ) : filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Tiada rekod
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((item) => (
                  <tr key={item.student_id}>
                    <td>{item.ranking}</td>
                    <td>
                      <button
                        className="link-btn"
                        onClick={() => {
                          setSelectedStudent(item);
                          fetchStudentRecords(item.student_id);
                        }}
                      >
                        {item.student_name}
                      </button>
                    </td>
                    <td>{item.class_room}</td>
                    <td>{item.point}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ---------- Modal ---------- */}
      {selectedStudent && (
        <div className="modal-backdrop">
          <div className="modal-box large-modal">
            <h2 className="modal-title">
              Rekod — {selectedStudent.student_name}
            </h2>

            {recordLoading ? (
              <p>Memuatkan rekod...</p>
            ) : studentRecords.length === 0 ? (
              <p>Tiada rekod</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tarikh</th>
                    <th>Jenis</th>
                    <th>Penerangan</th>
                    <th>Mata</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.map((r) => {
                    const type = getType(
                      (r as any)[recordTypeKey]
                    );

                    return (
                      <tr key={r.id}>
                        <td>
                          {new Date(r.timestamp).toLocaleDateString()}
                        </td>
                        <td>{type?.name || "-"}</td>
                        <td>{type?.description || "-"}</td>
                        <td>{type?.points ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div className="modal-btn-row">
              <button
                className="modal-cancel"
                onClick={() => setSelectedStudent(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

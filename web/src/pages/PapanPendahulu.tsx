import React, { useEffect, useState } from "react";
import "./PapanPendahulu.css";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/pagination";
import FilterDropdown from "../components/FilterDropdown";


interface LeaderboardEntry {
  student_id: number;
  student_name: string;
  point: number;
  class_room: string;
  ranking: number;
}

interface Classroom {
  id: number;
  grade: number;
  class_section: string;
}

interface SahsiahRecord {
  id: number;
  timestamp: string;
  migrate_student_id: number;
  sahsiah_type: number;
}

interface SahsiahType {
  id: number;
  name: string;
  description: string;
  points: number;
  tag: string;
}

export default function LeaderboardPage() {
  // ---------------- State ----------------
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [gradeFilter, setGradeFilter] = useState<number | "">("");
  const [classFilter, setClassFilter] = useState("");
  const [sahsiahTypes, setSahsiahTypes] = useState<SahsiahType[]>([]);

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [selectedStudent, setSelectedStudent] = useState<LeaderboardEntry | null>(null);
  const [studentRecords, setStudentRecords] = useState<SahsiahRecord[]>([]);
  const [recordLoading, setRecordLoading] = useState(false);

  // ---------------- Fetch classrooms ----------------
  const fetchClassrooms = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/authentication/classroom/");
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch {
      setClassrooms([]);
    }
  };

  // ---------------- Fetch leaderboard ----------------
  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      // Build the URL depending on filters
      let url = `http://localhost:8080/api/sahsiah/leaderboard/?page=${page}`;

      if (gradeFilter && classFilter) {
        url = `http://localhost:8080/api/sahsiah/leaderboard/${gradeFilter}/${classFilter}/?page=${page}`;
      } else if (gradeFilter) {
        url = `http://localhost:8080/api/sahsiah/leaderboard/${gradeFilter}/?page=${page}`;
      }

      const res = await fetch(url);
      const data: {
        links: { next: string | null; previous: string | null };
        total_items: number;
        page_number: number;
        entry: LeaderboardEntry[];
      } = await res.json();

      // Set the leaderboard entries
      setLeaderboard(Array.isArray(data.entry) ? data.entry : []);

      // Set pagination info
      setPage(data.page_number ?? 1);
      setTotalPages(
        data.total_items && data.entry?.length
          ? Math.ceil(data.total_items / data.entry.length)
          : 1
      );
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setLeaderboard([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };


  // search filter
  const filteredLeaderboard = leaderboard.filter((item) => {
  const term = searchTerm.toLowerCase().trim();

  if (!term) return true;

  return (
    item.student_name.toLowerCase().includes(term) ||
    item.class_room.toLowerCase().includes(term)
  );
});


  // fetch sahsiah type
  const fetchSahsiahTypes = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/sahsiah/type/");
    const data = await res.json();

    if (Array.isArray(data.entry)) {
      setSahsiahTypes(data.entry);
    } else {
      setSahsiahTypes([]);
    }
  } catch (err) {
    console.error("Failed to fetch sahsiah types:", err);
    setSahsiahTypes([]);
  }
};


  // ---------------- Fetch student records ----------------
const fetchStudentRecords = async (studentId: number) => {
  setRecordLoading(true);

  try {
    const res = await fetch(
      `http://localhost:8080/api/sahsiah/record/student/${studentId}`
    );

    const data: {
      links?: { next: string | null; previous: string | null };
      total_items?: number;
      page_number?: number;
      entry: SahsiahRecord[];
    } = await res.json();

    setStudentRecords(Array.isArray(data.entry) ? data.entry : []);
  } catch (err) {
    console.error("Failed to fetch student records:", err);
    setStudentRecords([]);
  } finally {
    setRecordLoading(false);
  }
};
  // helper to set sahsiah type
  const getSahsiahType = (typeId: number) =>
  sahsiahTypes.find((t) => t.id === typeId);


  // ---------------- Effects ----------------
  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [gradeFilter, classFilter, page]);

  useEffect(() => {
  setPage(1);
}, [gradeFilter, classFilter]);

  useEffect(() => {
  fetchClassrooms();
  fetchSahsiahTypes();
}, []);

  // ---------------- Render ----------------
  return (
    <div className="page-container">
      <h1 className="page-title">Papan Pendahulu Sahsiah</h1>

      <div className="section-box">
        {/* -------- Filters -------- */}

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
            onChange={(value) => setClassFilter(String(value))}
            disabled={gradeFilter === ""}
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

        {/* -------- Table -------- */}
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
              ) : leaderboard.length === 0 ? (
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

          {/* -------- Pagination -------- */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          
        </div>
      </div>

      {/* -------- Student Modal -------- */}
      {selectedStudent && (
        <div className="modal-backdrop">
          <div className="modal-box large-modal">
            <h2 className="modal-title">
              Rekod Sahsiah — {selectedStudent.student_name}
            </h2>

            {recordLoading ? (
              <p>Memuatkan rekod...</p>
            ) : studentRecords.length === 0 ? (
              <p>Tiada rekod sahsiah</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tarikh</th>
                    <th>Jenis Sahsiah</th>
                    <th>Penerangan</th>
                    <th>Mata</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.map((r) => {
                    const type = getSahsiahType(r.sahsiah_type);

                    return (
                      <tr key={r.id}>
                        <td>{new Date(r.timestamp).toLocaleDateString()}</td>
                        <td>{type?.name || "Tidak diketahui"}</td>
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

import React, { useEffect, useState } from "react";
import "./Sahsiah.css";

interface LeaderboardEntry {
  student_id: number;
  student_name: string;
  point: number;
  class_room: string;
  ranking: number;
}

interface Classroom {
  id: number;
  name: string;
  grade: string;
}

interface SahsiahRecord {
  id: number;
  category: string;
  description: string;
  point: number;
  date: string;
}

export default function LeaderboardPage() {
  // ---------------- State ----------------
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [gradeFilter, setGradeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

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
      let url = "http://localhost:8080/api/sahsiah/leaderboard/";

      if (gradeFilter && classFilter) {
        url += `${gradeFilter}/${classFilter}/`;
      } else if (gradeFilter) {
        url += `${gradeFilter}/`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setLeaderboard(Array.isArray(data.entry) ? data.entry : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Fetch student records ----------------
const fetchStudentRecords = async (studentId: number) => {
  setRecordLoading(true);

  try {
    const res = await fetch(
      `http://localhost:8080/api/sahsiah/record/?student_id=${studentId}`
    );

    const data = await res.json();

    console.log("Student records response:", data); // 🔍 IMPORTANT

    if (Array.isArray(data.entry)) {
      setStudentRecords(data.entry);
    } else {
      setStudentRecords([]);
    }
  } catch (err) {
    console.error("Failed to fetch student records:", err);
    setStudentRecords([]);
  } finally {
    setRecordLoading(false);
  }
};


  // ---------------- Effects ----------------
  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [gradeFilter, classFilter]);

  // ---------------- Render ----------------
  return (
    <div className="page-container">
      <h1 className="page-title">Papan Pendahulu Sahsiah</h1>

      <div className="section-box">
        {/* -------- Filters -------- */}
        <div className="controls-row">
          <select
            className="search-input"
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setClassFilter("");
            }}
          >
            <option value="">Semua Grade</option>
            {[...new Set(classrooms.map((c) => c.grade))].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="search-input"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            disabled={!gradeFilter}
          >
            <option value="">Semua Kelas</option>
            {classrooms
              .filter((c) => c.grade === gradeFilter)
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* -------- Table -------- */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ranking</th>
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
                leaderboard.map((item) => (
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
                    <th>Kategori</th>
                    <th>Penerangan</th>
                    <th>Mata</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecords.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.category}</td>
                      <td>{r.description}</td>
                      <td>{r.point}</td>
                    </tr>
                  ))}
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

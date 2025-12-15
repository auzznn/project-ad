import React, { useEffect, useState } from "react";
import "./Kehadiran.css";

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
}

export default function KehadiranPage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState<AttendanceRecord | null>(null);

  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: "",
    grade: 1,
    section: "",
    academic_year: "",
    rmt_elligible: false,
  });

  // Fetch attendance records
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8080/api/student_attendance/");
      const data = await res.json();
      if (Array.isArray(data)) setAttendanceList(data);
      else setAttendanceList([]);
    } catch (err) {
      console.error("Fetch error:", err);
      setAttendanceList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

 // Search filter (fixed)
const filteredAttendance = attendanceList
  .filter((rec) => rec.student !== null) // remove anomalies
  .filter((rec) =>
    (rec.student?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );


// Status logic
const getStatus = (rec: AttendanceRecord): "Tepat Waktu" | "Lambat" | "Tidak Hadir" => {
  const apiStatus = rec.status?.toLowerCase();
  if (apiStatus === "on-time") return "Tepat Waktu";
  if (apiStatus === "late") return "Lambat";
  if (apiStatus === "absent") return "Tidak Hadir";
  return "Tidak Hadir";
};

const getStatusClass = (status: string) => {
  if (status === "Tepat Waktu") return "status-present";
  if (status === "Lambat") return "status-late";
  if (status === "Tidak Hadir") return "status-absent";
  return "status-absent";
};

// Time formatting helper
const formatTime = (ts: string) => {
  if (!ts) return "--"; // no timestamp
  const time = ts.substring(11, 16); // HH:mm
  return time === "00:00" ? "--" : time;
};

  // Add Student
const handleAddStudent = async () => {
  if (!newStudent.name || !newStudent.section || !newStudent.academic_year) return;

  const today = new Date();
  const date = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const timestamp = "00:00"; // manual entry → absent

  const newRecord: AttendanceRecord = {
    student: newStudent as Student,
    status: "absent",
    date,
    timestamp,
  };

  try {
    await fetch("http://127.0.0.1:8080/api/student_attendance/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord),
    });

    setModalOpen(false);
    setNewStudent({ name: "", grade: 1, section: "", academic_year: "" });
    fetchAttendance();
  } catch (err) {
    console.error("Add error:", err);
  }
};

  // Edit Attendance
  const handleEditAttendance = (rec: AttendanceRecord) => {
    setEditRecord({ ...rec });
    setModalOpen(true);
  };

const handleUpdateAttendance = async (updatedRecord: AttendanceRecord) => {
  if (!updatedRecord?.id) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8080/api/student_attendance/${updatedRecord.id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRecord),
      }
    );

    if (!response.ok) {
      console.error("PATCH failed:", response.status, await response.text());
    }

    fetchAttendance(); // refresh list
  } catch (err) {
    console.error("PATCH error:", err);
  }
};


  // Delete Attendance
  const handleDeleteAttendance = async () => {
    if (!confirmDeleteRecord?.id) return;

    try {
      await fetch(`http://127.0.0.1:8080/api/student_attendance/${confirmDeleteRecord.id}/`, {
        method: "DELETE",
      });

      setConfirmDeleteRecord(null);
      fetchAttendance();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Pengurusan Kehadiran</h1>

      <div className="section-box">
        {/* Controls */}
        <div className="controls-row">
          <input
            type="text"
            placeholder="Cari Rekod Kehadiran Pelajar..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => setModalOpen(true)}>
            + Tambah Kehadiran
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="table-custom">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Pelajar</th>
                <th>Kelas</th>
                <th>Masa Kehadiran</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-row">Loading records...</td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">Tiada rekod kehadiran</td>
                </tr>
              ) : (
                filteredAttendance.map((rec, idx) => {
                  const status = getStatus(rec);

                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{rec.student?.name}</td>
                      <td>{rec.student?.grade}-{rec.student?.section}</td>
                      <td>{formatTime(rec.timestamp)}</td>
                      <td>
                        <span className={`status-box ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns-wrapper">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditAttendance(rec)}
                          >
                            Ubah
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => setConfirmDeleteRecord(rec)}
                          >
                            Padam
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
  <div className="modal-backdrop">
    <div className="modal-box">
      <h2 className="modal-title">{editRecord ? "Ubah Kehadiran" : "Tambah Kehadiran"}</h2>

      {!editRecord && (
        <>
          <label>Nama</label>
          <input
            type="text"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <label>Kelas</label>
          <input
            type="number"
            value={newStudent.grade}
            onChange={(e) =>
              setNewStudent((prev) => ({ ...prev, grade: Number(e.target.value) }))
            }
          />

          <label>Section</label>
          <input
            type="text"
            value={newStudent.section}
            onChange={(e) =>
              setNewStudent((prev) => ({ ...prev, section: e.target.value }))
            }
          />

          <label>Tahun Akademik</label>
          <input
            type="text"
            value={newStudent.academic_year}
            onChange={(e) =>
              setNewStudent((prev) => ({ ...prev, academic_year: e.target.value }))
            }
          />
        </>
      )}

      {editRecord && (
        <>
          <label>Timestamp</label>
          <input
            type="time"
            value={editRecord.timestamp.startsWith("00:00")
              ? ""
              : editRecord.timestamp.substring(0, 5)}
            onChange={(e) => {
            const newTime = e.target.value; // "HH:MM"
            // Format for API
            const updatedTimestamp = newTime ? `${newTime}:00+08:00` : "00:00:00+08:00";

            // Recalculate status
            let newStatus: "on-time" | "late" | "absent" = "on-time";
            if (!newTime || newTime === "00:00") {
              newStatus = "absent";
            } else {
              const [hh, mm] = newTime.split(":").map(Number);
              const totalMinutes = hh * 60 + mm;
              newStatus = totalMinutes > 7 * 60 + 40 ? "late" : "on-time";
            }

            setEditRecord((prev) =>
              prev ? { ...prev, timestamp: updatedTimestamp, status: newStatus } : prev
            );
          }}
          />

          <label>Status</label>
          <input
            type="text"
            value={
              editRecord.status === "on-time"
                ? "Tepat Waktu"
                : editRecord.status === "late"
                ? "Lambat"
                : "Tidak Hadir"
            }
            disabled
          />
        </>
      )}

      <div className="modal-btn-row">
        <button
          className="modal-cancel"
          onClick={() => {
            setModalOpen(false);
            setEditRecord(null);
          }}
        >
          Cancel
        </button>
        <button
          className="modal-save"
          onClick={() => {
            if (!editRecord) return;

            handleUpdateAttendance(editRecord);
            setModalOpen(false);
            setEditRecord(null);
            fetchAttendance();
          }}
        >
          Update
        </button>

      </div>
    </div>
  </div>
)}

      {/* Delete Modal */}
      {confirmDeleteRecord && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2 className="modal-title">Padam Kehadiran</h2>
            <p>Adakah anda pasti ingin memadam rekod ini?</p>

            <div className="modal-btn-row">
              <button
                className="modal-cancel"
                onClick={() => setConfirmDeleteRecord(null)}
              >
                Cancel
              </button>
              <button className="modal-delete" onClick={handleDeleteAttendance}>
                Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

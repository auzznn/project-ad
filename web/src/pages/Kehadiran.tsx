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
  status: "present" | "late" | "absent";
  created_at: string;
  updated_at: string;
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

  // Search filter
  const filteredAttendance = attendanceList.filter(
    (rec) =>
      rec.student &&
      rec.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status logic
  const getStatus = (rec: AttendanceRecord): "present" | "late" | "absent" => {
    if (!rec.student) return "absent";

    const created = new Date(rec.created_at);
    const updated = new Date(rec.updated_at);

    if (created.getTime() === updated.getTime()) return "absent";

    const lateCutoff = new Date(updated);
    lateCutoff.setHours(7, 30, 0, 0);

    return updated > lateCutoff ? "late" : "present";
  };

  // NEW: Malay translation for status
  const translateStatus = (status: string) => {
    switch (status) {
      case "present":
        return "Tepat Waktu";
      case "late":
        return "Lambat";
      case "absent":
        return "Tidak Hadir";
      default:
        return status;
    }
  };

  // Format time
  const formatTime = (created_at: string, updated_at: string) => {
    const created = new Date(created_at);
    const updated = new Date(updated_at);

    if (created.getTime() === updated.getTime()) {
      return "--";
    }

    return updated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add Student
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.section || !newStudent.academic_year) return;

    const now = new Date().toISOString();

    const newRecord: AttendanceRecord = {
      student: newStudent as Student,
      status: "absent",
      created_at: now,
      updated_at: now,
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

  const handleUpdateAttendance = async () => {
    if (!editRecord?.id) return;

    try {
      await fetch(`http://127.0.0.1:8080/api/student_attendance/${editRecord.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRecord),
      });

      setModalOpen(false);
      setEditRecord(null);
      fetchAttendance();
    } catch (err) {
      console.error("Update error:", err);
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
                      <td>{formatTime(rec.created_at, rec.updated_at)}</td>
                      <td>
                        <span className={`status-box status-${status}`}>
                          {translateStatus(status)}
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
                <label>Status</label>
                <select
                  value={editRecord.status}
                  onChange={(e) =>
                    setEditRecord((prev) =>
                      prev ? { ...prev, status: e.target.value as any } : prev
                    )
                  }
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
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
                onClick={editRecord ? handleUpdateAttendance : handleAddStudent}
              >
                {editRecord ? "Update" : "Tambah"}
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

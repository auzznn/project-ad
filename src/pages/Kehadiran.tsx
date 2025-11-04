import React, { useState, useEffect } from "react";
import "./Kehadiran.css";

interface Student {
  id: number;
  name: string;
  class: string;
  attendance_time?: string;
  attendance_status?: "hadir" | "lewat" | "tidak_hadir";
  note?: string;
}

function Kehadiran() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkInTime, setCheckInTime] = useState("07:10 AM, GMT+8");

  useEffect(() => {
    fetch("/data/students.json")
      .then((res) => res.json())
      .then((data) => {
        const studentsWithAttendance = data.map((s: Student) => ({
          ...s,
          attendance_time: "06:45 AM",
          attendance_status: Math.random() > 0.1 ? "hadir" : "tidak_hadir",
          note: "",
        }));
        setStudents(studentsWithAttendance);
      })
      .catch((err) => console.error("Error loading students:", err));
  }, []);

  const handleEdit = (studentId: number) => {
    console.log("Edit student:", studentId);
  };

  const handleDelete = (studentId: number) => {
    console.log("Delete student:", studentId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hadir":
        return <span className="badge badge-success">Hadir</span>;
      case "lewat":
        return <span className="badge badge-warning">Lewat</span>;
      case "tidak_hadir":
        return <span className="badge badge-danger">Tidak Hadir</span>;
      default:
        return <span className="badge badge-secondary">Tidak Diketahui</span>;
    }
  };

  return (
    <div className="kehadiran-container">
      <div className="kehadiran-header">
        <h1>Pengurusan Kehadiran</h1>
        <p>Pantau dan betulkan rekod kehadiran harian</p>
      </div>

      {/* Attendance Overview */}
      <div className="attendance-overview">
        <div className="overview-item">
          <label>Tarikh:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="overview-item">
          <label>Konfigurasi Masa Daftar:</label>
          <span className="time-config">{checkInTime}</span>
        </div>
      </div>

      {/* Add Student Button */}
      <div className="action-buttons">
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Tambah Pelajar Baru
        </button>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="table table-custom">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nama Pelajar</th>
              <th>Kelas</th>
              <th>Masa Kehadiran</th>
              <th>Catatan</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <span className="status-icon">
                    {student.attendance_status === "hadir" && (
                      <i className="bi bi-check-circle-fill text-success"></i>
                    )}
                    {student.attendance_status === "tidak_hadir" && (
                      <i className="bi bi-x-circle-fill text-danger"></i>
                    )}
                    {student.attendance_status === "lewat" && (
                      <i className="bi bi-exclamation-circle-fill text-warning"></i>
                    )}
                  </span>
                </td>
                <td>{student.name}</td>
                <td>{student.class}</td>
                <td>{student.attendance_time || "-"}</td>
                <td>{student.note || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(student.id)}
                    title="Edit"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(student.id)}
                    title="Delete"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Kehadiran;

import React, { useState, useEffect } from "react";
import "./Kehadiran.css";

interface AttendanceRecord {
  status: string;
  created_at: string;
  updated_at: string;
  student: {
    student_id: string;
    fullname: string;
    class_room: string;
  };
}


function Kehadiran() {
const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://127.0.0.1:8080/api/student_attendance/");

        if (!res.ok) {
          console.error("Unauthorized or server issue:", res.status);
          setAttendance([]);
          return;
        }

        const data = await res.json();

        // Ensure data is valid array
        if (Array.isArray(data)) {
          setAttendance(data);
        } else {
          console.error("API returned non-array:", data);
        }

      } catch (err) {
        console.error("Error loading attendance:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  return (
    <div className="kehadiran-container">
      <div className="kehadiran-header">
        <h1>Pengurusan Kehadiran</h1>
        <p>Pantau dan betulkan rekod kehadiran harian</p>
      </div>

      <div className="attendance-overview">
        <div className="overview-item">
          <label>Tarikh:</label>
          <input type="date" className="form-control" disabled />
        </div>
        <div className="overview-item">
          <label>Konfigurasi Masa Daftar:</label>
          <span className="time-config">--:--</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Tambah Pelajar Baru
        </button>
      </div>

      <div className="table-container">
        <table className="table table-custom">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nama Pelajar</th>
              <th>Kelas</th>
              <th>Masa Kehadiran</th>
            </tr>
          </thead>

          <tbody>
            {validAttendance.map((item, index) => (
              <tr
                key={index}
                className={
                  item.status === "absent"
                    ? "status-absent"
                    : item.status === "late"
                    ? "status-late"
                    : "status-present"
                }
              >
                <td>{item.status}</td>
                <td>{item.student?.name}</td>
                <td>
                  {item.student?.grade}-{item.student?.section}
                </td>
                <td>{item.created_at}</td>
              </tr>
            ))}

            {validAttendance.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "10px" }}>
                  Tiada rekod kehadiran yang sah.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Kehadiran;

import React, { useState, useEffect } from "react";
import "./Kehadiran.css";

interface AttendanceRecord {
  status: string;
  created_at: string;
  updated_at: string;
  student: {
    id: string;
    name: string;
    class: string;
  };
}


function Kehadiran() {
const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/data/attendance-2025-11-19.json");
        const data = await res.json();
        setAttendance(data);
      } catch (err) {
        console.error(err);
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
        {attendance.map((item, index) => (
          <tr key={index}>
            <td>{item.status}</td>
            <td>{item.student.name}</td>
            <td>{item.student.class}</td>
            <td>{item.created_at}</td>
          </tr>
        ))}
      </tbody>
        </table>
      </div>
    </div>
  );
}

export default Kehadiran;

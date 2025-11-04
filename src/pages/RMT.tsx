import React, { useState, useEffect } from "react";
import "./RMT.css";

interface Student {
  id: number;
  name: string;
  class: string;
  rmt_record_time?: string;
  rmt_status?: "terima" | "belum_terima";
}

interface RMTRecord {
  id: number;
  student_name: string;
  class: string;
  record_time: string;
  note: string;
}

function RMT() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rmtRecords, setRmtRecords] = useState<RMTRecord[]>([]);
  const [rmtCompletionRate, setRmtCompletionRate] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [rmtReceived, setRmtReceived] = useState(0);
  const [rmtPending, setRmtPending] = useState(0);

  useEffect(() => {
    fetch("/data/students.json")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setTotalStudents(data.length);

        // Calculate RMT stats
        const received = Math.round(data.length * 0.8);
        setRmtReceived(received);
        setRmtPending(data.length - received);
        setRmtCompletionRate(Math.round((received / data.length) * 100));

        // Generate mock RMT records
        const mockRecords: RMTRecord[] = data.slice(0, 6).map((s: Student, idx: number) => ({
          id: idx + 1,
          student_name: s.name,
          class: s.class,
          record_time: `12:${45 + idx}0 PM GMT+7`,
          note: idx % 3 === 0 ? "Lihat Butiran" : "",
        }));
        setRmtRecords(mockRecords);
      })
      .catch((err) => console.error("Error loading students:", err));
  }, []);

  const handleAddStudent = () => {
    console.log("Add student manually");
  };

  const handleViewDetails = (studentId: number) => {
    console.log("View details for student:", studentId);
  };

  return (
    <div className="rmt-container">
      <div className="rmt-header">
        <h1>Pengurusan Imbasan RMT</h1>
        <p>Urus rekod pengedaran RMT</p>
      </div>

      {/* Statistics Section */}
      <div className="rmt-stats">
        <div className="stat-box">
          <h3>Statistik RMT</h3>
          <div className="stat-item">
            <label>Liputan Keseluruhan</label>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${rmtCompletionRate}%` }}></div>
            </div>
            <span className="progress-text">{rmtCompletionRate}%</span>
          </div>
          <div className="stat-link">
            <a href="#lihat-statistik">
              <i className="bi bi-arrow-right"></i> Lihat Statistik RMT
            </a>
          </div>
        </div>

        <div className="stat-box">
          <h3>Statistik Pantas</h3>
          <div className="stat-row">
            <div className="stat-item-inline">
              <label>Jumlah Pelajar</label>
              <span className="stat-value">{totalStudents}</span>
            </div>
            <div className="stat-item-inline">
              <label>RMT Diterima</label>
              <span className="stat-value" style={{ color: "#10b981" }}>{rmtReceived}</span>
            </div>
            <div className="stat-item-inline">
              <label>Belum Terima</label>
              <span className="stat-value" style={{ color: "#ef4444" }}>{rmtPending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Button */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleAddStudent}>
          <i className="bi bi-plus-circle"></i> Tambah Pelajar Secara Manual
        </button>
      </div>

      {/* RMT Records Table */}
      <div className="table-section">
        <h2>Senarai Pelajar RMT</h2>
        <table className="table table-custom">
          <thead>
            <tr>
              <th>Nama Pelajar</th>
              <th>Kelas</th>
              <th>Masa Terima RMT</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {rmtRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.student_name}</td>
                <td>{record.class}</td>
                <td>{record.record_time}</td>
                <td>
                  <a href="#lihat-butiran" className="link-action">
                    Lihat Butiran
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RMT;

import React, { useState, useEffect } from "react";
import "./Sahsiah.css";

interface SahsiahRecord {
  id: number;
  student_name: string;
  sahsiah_item: string;
  marks: number;
  record_date: string;
  record_time: string;
}

interface StudentRanking {
  rank: number;
  student_name: string;
  total_marks: number;
}

function Sahsiah() {
  const [sahsiahRecords, setSahsiahRecords] = useState<SahsiahRecord[]>([]);
  const [studentRankings, setStudentRankings] = useState<StudentRanking[]>([]);
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [startDate, setStartDate] = useState("2025-02-03");
  const [endDate, setEndDate] = useState("2025-02-03");

  useEffect(() => {
    const mockRecords: SahsiahRecord[] = [
      {
        id: 1,
        student_name: "Ahmad Faris",
        sahsiah_item: "Read Al-Mulk",
        marks: 20,
        record_date: "Feb 10, 2025",
        record_time: "08:00 AM",
      },
      {
        id: 2,
        student_name: "Tan Mei Ling",
        sahsiah_item: "Speak in Arabic",
        marks: 30,
        record_date: "Feb 10, 2025",
        record_time: "09:15 AM",
      },
      {
        id: 3,
        student_name: "Siti Nurhaliza",
        sahsiah_item: "Proper Attire (Activity Based)",
        marks: 10,
        record_date: "Feb 10, 2025",
        record_time: "07:30 AM",
      },
      {
        id: 4,
        student_name: "Muhammad Ali",
        sahsiah_item: "Read Al-Mulk",
        marks: 20,
        record_date: "Feb 09, 2025",
        record_time: "08:00 AM",
      },
      {
        id: 5,
        student_name: "Nurul Aina",
        sahsiah_item: "Speak in Arabic",
        marks: 30,
        record_date: "Feb 09, 2025",
        record_time: "10:00 AM",
      },
    ];
    setSahsiahRecords(mockRecords);

    const mockRankings: StudentRanking[] = [
      { rank: 1, student_name: "Tan Mei Ling", total_marks: 150 },
      { rank: 2, student_name: "Ahmad Faris", total_marks: 130 },
      { rank: 3, student_name: "Nurul Aina", total_marks: 120 },
      { rank: 4, student_name: "Siti Nurhaliza", total_marks: 110 },
      { rank: 5, student_name: "Muhammad Ali", total_marks: 100 },
    ];
    setStudentRankings(mockRankings);
  }, []);

  const handleAddRecord = () => {
    console.log("Add new sahsiah record");
  };

  return (
    <div className="sahsiah-container">
      <div className="sahsiah-header">
        <h1>Pengurusan Sahsiah</h1>
        <p>Rekod dan jejak mata perkembangan sahsiah</p>
      </div>

      <div className="filters-section">
        <div className="filter-item">
          <label>Penapis Kelas</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="form-control">
            <option>Semua Kelas</option>
            <option>1A</option>
            <option>1B</option>
            <option>2A</option>
            <option>2B</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Tarikh Dari</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" />
        </div>
        <div className="filter-item">
          <label>Tarikh Hingga</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" />
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleAddRecord}>
          <i className="bi bi-plus-circle"></i> Tambah Rekod Sahsiah
        </button>
      </div>

      <div className="content-grid">
        <div className="records-section">
          <h2>Nama Pelajar</h2>
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Nama Pelajar</th>
                <th>Item Sahsiah</th>
                <th>Mata</th>
                <th>Tarikh</th>
              </tr>
            </thead>
            <tbody>
              {sahsiahRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.student_name}</td>
                  <td>{record.sahsiah_item}</td>
                  <td>
                    <span className="marks-badge">+{record.marks} Mata</span>
                  </td>
                  <td>{record.record_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rankings-section">
          <h2>
            <i className="bi bi-trophy"></i> Papan Pendahulu
          </h2>
          <div className="rankings-list">
            {studentRankings.map((ranking) => (
              <div key={ranking.rank} className="ranking-item">
                <div className="ranking-badge">{ranking.rank}</div>
                <div className="ranking-info">
                  <p className="ranking-name">{ranking.student_name}</p>
                </div>
                <div className="ranking-marks">
                  <p className="marks-value">{ranking.total_marks} mata</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sahsiah;
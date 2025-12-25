import React, { useEffect, useState } from "react";
import "./Sahsiah.css";

interface LeaderboardEntry {
  id: number;
  student_name: string;
  sahsiah_point: number;
  class_room: string;
  ranking: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState(""); // e.g., "Form1"
  const [classFilter, setClassFilter] = useState(""); // e.g., "1Abu Bakar"

  // ---------- Fetch leaderboard ----------
  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      let url = "http://localhost:8080/api/sahsiah/leaderboard/";

      // Only append grade/class if both are selected
      if (gradeFilter && classFilter) {
        url += `${encodeURIComponent(gradeFilter)}/${encodeURIComponent(classFilter)}/`;
      }

      console.log("Fetching leaderboard from URL:", url); // debug

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) setLeaderboard(data);
      else if (Array.isArray(data.records)) setLeaderboard(data.records);
      else setLeaderboard([]);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever grade/class changes
  useEffect(() => {
    fetchLeaderboard();
  }, [gradeFilter, classFilter]);

  // ---------- Local search ----------
  const filteredList = leaderboard.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.student_name.toLowerCase().includes(term) ||
      item.class_room.toLowerCase().includes(term) ||
      String(item.sahsiah_point).includes(term)
    );
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Leaderboard Pelajar</h1>

      <div className="section-box">
        {/* ---- Controls ---- */}
        <div className="controls-row">
          <input
            className="search-input"
            placeholder="Cari pelajar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Grade Filter */}
          <select
            className="search-input"
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setClassFilter(""); // reset class when grade changes
            }}
          >
            <option value="">-- Pilih Grade --</option>
            <option value="Form1">Form 1</option>
            <option value="Form2">Form 2</option>
            <option value="Form3">Form 3</option>
          </select>

          {/* Class Filter */}
          <select
            className="search-input"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            disabled={!gradeFilter} // must select grade first
          >
            <option value="">-- Pilih Kelas --</option>
            {gradeFilter === "Form1" && (
              <>
                <option value="1Abu Bakar">1Abu Bakar</option>
                <option value="1Ali">1Ali</option>
              </>
            )}
            {gradeFilter === "Form2" && (
              <>
                <option value="2Umar">2Umar</option>
                <option value="2Uthman">2Uthman</option>
              </>
            )}
            {gradeFilter === "Form3" && (
              <>
                <option value="3Abu Bakar">3Abu Bakar</option>
                <option value="3Ali">3Ali</option>
              </>
            )}
          </select>
        </div>

        {/* ---- Table ---- */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Nama Pelajar</th>
                <th>Kelas</th>
                <th>Markah Sahsiah</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Loading leaderboard...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Tiada rekod dijumpai
                  </td>
                </tr>
              ) : (
                filteredList
                  .sort((a, b) => a.ranking - b.ranking)
                  .map((item) => (
                    <tr key={item.id}>
                      <td>{item.ranking}</td>
                      <td>{item.student_name}</td>
                      <td>{item.class_room}</td>
                      <td>{item.sahsiah_point}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

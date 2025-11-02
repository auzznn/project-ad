// function Kehadiran() {
//   return (
//     <div>
//       <ul className="list-group">
//         <li className="list-group-item">Student 1</li>
//         <li className="list-group-item">Student 2</li>
//         <li className="list-group-item">Student 3</li>
//         <li className="list-group-item">Student 4</li>
//         <li className="list-group-item">Student 5</li>
//       </ul>
//     </div>
//   );
// }

// export default Kehadiran;

import { useState, useEffect } from "react";

function Kehadiran() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/students.json")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error loading students:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Senarai Kehadiran</h2>
      <ul>
        {students.map((s) => (
          <li key={s.id}>
            {s.name} — {s.present ? "✅ Hadir" : "❌ Tidak Hadir"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Kehadiran;


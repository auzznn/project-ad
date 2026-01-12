import React, { useEffect, useState } from "react";
import Pagination from "../components/pagination";
import { authFetch } from "../services/authFetch";
import "./Pengguna.css";

interface UserItem {
  id: number;
  fullname: string;
  role: string;
}

interface Classroom {
  id: string;
  name: string;
}

interface StudentRow {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  classroom: string;
  rmt_elligible: boolean;
}

const PAGE_SIZE = 8;

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  /* ---------- Parent Form ---------- */
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "teacher", 
  });


  /* ---------- Linked Students ---------- */
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  /* ---------- Fetch Users ---------- */
  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await authFetch(
        `https://backend.eduqr.cloud/api/authentication/user/?page=${pageNumber}&page_size=${PAGE_SIZE}`
      );
      if (!res.ok) {
        setUsers([]);
        setTotalItems(0);
        return;
      }
      const data = await res.json();
      setUsers(data.entry ?? []);
      setTotalItems(data.total_items ?? 0);
    } catch (err) {
      console.error(err);
      setUsers([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  /* ---------- Modal Open ---------- */
  const handleCreate = () => {
    setForm({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "parent",
    });
    setStudents([]);
    setEditingUser(null);
    setModalOpen(true);

    // Fetch classrooms for student dropdown
    authFetch("https://backend.eduqr.cloud/api/authentication/classroom/")
      .then(res => res.json())
      .then(data => setClassrooms(data.entry ?? []))
      .catch(err => console.error("Failed to fetch classrooms:", err));
  };

  const handleEdit = (user: UserItem) => {
    setForm({
      username: "", // For simplicity, don't prefill sensitive info
      first_name: user.fullname,
      last_name: "",
      email: "",
      password: "",
      role: user.role,
    });
    setStudents([]);
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    await authFetch(
      `https://backend.eduqr.cloud/api/authentication/user/${confirmDeleteId}/`,
      { method: "DELETE" }
    );
    setConfirmDeleteId(null);
    fetchUsers(page);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- Student Row Handlers ---------- */
  const addStudentRow = () => {
    setStudents(prev => [
      ...prev,
      { first_name: "", last_name: "", date_of_birth: "", classroom: "", rmt_elligible: false },
    ]);
  };

  const handleStudentChange = <K extends keyof StudentRow>(
    index: number,
    field: K,
    value: StudentRow[K] // ensures the value matches the field type
  ) => {
    setStudents(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  /* ---------- Submit Parent + Students ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ Create parent/user
      const userRes = await authFetch(
        editingUser
          ? `https://backend.eduqr.cloud/api/authentication/user/${editingUser.id}/`
          : "https://backend.eduqr.cloud/api/authentication/user/",
        {
          method: editingUser ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!userRes.ok) {
        alert("Gagal menyimpan pengguna.");
        return;
      }

      const userData = await userRes.json();
      const parentId = userData.id;

      // 2️⃣ Create students linked to parent (only if new parent)
      if (!editingUser && students.length > 0) {
        for (const s of students) {
          await authFetch("https://backend.eduqr.cloud/api/authentication/student/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...s, parent: parentId }),
          });
        }
      }

      alert("Berjaya menyimpan pengguna!");
      setModalOpen(false);
      fetchUsers(page);
    } catch (err) {
      console.error("Save error:", err);
      alert("Ralat semasa menyimpan. Sila cuba lagi.");
    }
  };

  /* ---------- Bulk Upload Handlers ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Sila pilih fail Excel terlebih dahulu");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await authFetch(
        "https://backend.eduqr.cloud/api/authentication/student/bulk_upload/",
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Upload failed:", errData);
        alert("Gagal memuat naik fail. Sila semak log konsol.");
        return;
      }
      alert("Berjaya memuat naik fail!");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Ralat semasa memuat naik fail. Sila cuba lagi.");
    }
  };

  /* ---------- Filtered Users ---------- */
  const filtered = users.filter(u => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return u.fullname.toLowerCase().includes(t) || u.role.toLowerCase().includes(t);
  });

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="page-container">
      <h1 className="page-title">Pengurusan Pengguna</h1>

      <div className="section-box">
        <div className="controls-row">
          <input
            className="search-input"
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={handleCreate}>
            + Tambah
          </button>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Nama Penuh</th>
                <th>Peranan</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="empty-row">Memuatkan rekod...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">Tiada rekod</td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>{u.fullname}</td>
                    <td>{u.role}</td>
                    <td>
                      <div className="action-btns-wrapper">
                        <button className="action-btn edit-btn" onClick={() => handleEdit(u)}>Ubah</button>
                        <button className="action-btn delete-btn" onClick={() => setConfirmDeleteId(u.id)}>Padam</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* ---------- Modal ---------- */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal-box" onSubmit={handleSubmit}>
            <h2 className="modal-title">{editingUser ? "Edit Pengguna" : "Tambah Pengguna"}</h2>

            {/* Parent Fields */}
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>

            {/* Students Section */}
            {form.role === "parent" && (
              <div className="students-section">
                <h3>Linked Students</h3>
                {students.map((s, idx) => (
                  <div key={idx} className="student-row">
                    <input placeholder="First Name" value={s.first_name} onChange={e => handleStudentChange(idx, "first_name", e.target.value)} />
                    <input placeholder="Last Name" value={s.last_name} onChange={e => handleStudentChange(idx, "last_name", e.target.value)} />
                    <input placeholder="Date of Birth (dd/mm/yyyy)" value={s.date_of_birth} onChange={e => handleStudentChange(idx, "date_of_birth", e.target.value)} />
                    <select value={s.classroom} onChange={e => handleStudentChange(idx, "classroom", e.target.value)}>
                      <option value="">Select Classroom</option>
                      {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <label>
                      RMT Eligible
                      <input type="checkbox" checked={s.rmt_elligible} onChange={e => handleStudentChange(idx, "rmt_elligible", e.target.checked)} />
                    </label>
                  </div>
                ))}
                <button type="button" onClick={addStudentRow}>+ Add Student</button>
              </div>
            )}

            {/* Bulk Upload */}
            <div className="file-upload-section">
              <input type="file" accept=".xlsx" onChange={handleFileChange} />
              <button type="button" onClick={handleFileUpload} disabled={!selectedFile}>Muat Naik Excel</button>
            </div>

            {/* Modal Buttons */}
            <div className="modal-btn-row" style={{ marginTop: "1rem" }}>
              <button type="button" className="modal-cancel" onClick={() => setModalOpen(false)}>Batal</button>
              <button type="submit" className="modal-save">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Confirm Delete ---------- */}
      {confirmDeleteId !== null && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2 className="modal-title">Sahkan</h2>
            <p>Adakah pasti mahu memadam pengguna ini?</p>
            <div className="modal-btn-row">
              <button className="modal-cancel" onClick={() => setConfirmDeleteId(null)}>Batal</button>
              <button className="modal-save" onClick={handleDelete}>Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

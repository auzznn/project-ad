import React, { useEffect, useState } from "react";
import Pagination from "../components/pagination";
import { authFetch } from "../services/authFetch";
import "./Pengguna.css";

interface UserItem {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  children: StudentChild[] | null;
}

interface StudentChild {
  id: number;
  name: string;
  grade: number;
  section: string;
  academic_year: string;
  rmt_elligible: boolean;
  qr_code: string;
}

const PAGE_SIZE = 8;

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
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

  //helper for fullname
  const getFullName = (u: UserItem) =>
  `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "-";

  /* ---------- Modal Open ---------- */

  const openCreateModal = () => {
  setForm({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "parent",
  });
  setEditingUser(null);
  setCreateModalOpen(true);
};

  const openEditModal = (user: UserItem) => {
    setForm({
      username: "",
      first_name: user.first_name,
      last_name: user.last_name,
      email: "",
      password: "", // not editable
      role: user.role,
    });
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await authFetch(
      "https://backend.eduqr.cloud/api/authentication/user/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (!res.ok) return alert("Gagal cipta pengguna");

    setCreateModalOpen(false);
    fetchUsers(page);
  };

const handleEditSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingUser) return;

  const res = await authFetch(
    `https://backend.eduqr.cloud/api/authentication/user/${editingUser.id}/`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      }),
    }
  );

  if (!res.ok) return alert("Gagal kemaskini pengguna");

  setEditModalOpen(false);
  setEditingUser(null);
  fetchUsers(page);
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

    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();

    return (
      fullName.includes(t) ||
      u.role.toLowerCase().includes(t)
    );
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
          <button className="add-btn" onClick={openCreateModal}>
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
                <th>Pelajar</th>
                <th>Tindakan</th>
              </tr>
            </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="empty-row">Memuatkan rekod...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">Tiada rekod</td>
                  </tr>
                ) : (
                  filtered.map((u, i) => (
                    <tr key={u.id}>
                      <td>{(page - 1) * PAGE_SIZE + i + 1}</td>

                      {/* ✅ Full name derived */}
                      <td>{getFullName(u)}</td>

                      <td>{u.role}</td>

                      {/* ✅ Students column */}
                      <td>
                        {u.children && u.children.length > 0 ? (
                          <ul className="student-list">
                            {u.children.map(c => (
                              <li key={c.id}>
                                {c.name} ({c.grade}{c.section})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <div className="action-btns-wrapper">
                          <button className="action-btn edit-btn" onClick={() => openEditModal(u)}>
                            Ubah
                          </button>
                          <button className="action-btn delete-btn" onClick={() => setConfirmDeleteId(u.id)}>
                            Padam
                          </button>
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

      {createModalOpen && (
        <div className="modal-backdrop">
          <form className="modal-box" onSubmit={handleCreateSubmit}>
            <h2 className="modal-title">Tambah Pengguna</h2>

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

            <select name="role" value={form.role} onChange={handleChange}>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>

            {/* Bulk upload ONLY here */}
            <div className="file-upload-section">
              <input type="file" accept=".xlsx" onChange={handleFileChange} />
              <button type="button" onClick={handleFileUpload} disabled={!selectedFile}>
                Muat Naik Excel
              </button>
            </div>

            <div className="modal-btn-row">
              <button type="button" onClick={() => setCreateModalOpen(false)}>
                Batal
              </button>
              <button type="submit">Simpan</button>
            </div>
          </form>
        </div>
      )}


      {editModalOpen && editingUser && (
        <div className="modal-backdrop">
          <form className="modal-box" onSubmit={handleEditSubmit}>
            <h2 className="modal-title">Edit Pengguna</h2>

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

            <select name="role" value={form.role} onChange={handleChange}>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>

            <div className="modal-btn-row">
              <button type="button" onClick={() => setEditModalOpen(false)}>
                Batal
              </button>
              <button type="submit">Simpan</button>
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

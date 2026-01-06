import React, { useEffect, useState } from "react";
import Pagination from "../components/pagination";
import { authFetch } from "../services/authFetch";
import "./Pengguna.css";

interface UserItem {
  id: number;
  fullname: string;
  role: string;
  children?: any;
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

  const [form, setForm] = useState<{ fullname: string; role: string }>({
    fullname: "",
    role: "teacher",
  });

  /* ---------- Fetch Users ---------- */
  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:8080/api/authentication/user/?page=${pageNumber}&page_size=${PAGE_SIZE}`
      );

      if (!res.ok) {
        console.warn("Failed to fetch users", res.status);
        setUsers([]);
        setTotalItems(0);
        return;
      }

      const data = await res.json();
      setUsers(data.entry ?? []);
      setTotalItems(data.total_items ?? 0);
    } catch (err) {
      console.error("Fetch users error:", err);
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

  /* ---------- Handlers ---------- */
  const handleCreate = () => {
    setForm({ fullname: "", role: "teacher" });
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setForm({ fullname: user.fullname, role: user.role });
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    await authFetch(
      `http://localhost:8080/api/authentication/user/${confirmDeleteId}/`,
      { method: "DELETE" }
    );

    setConfirmDeleteId(null);
    fetchUsers(page);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingUser
      ? `http://localhost:8080/api/authentication/user/${editingUser.id}/`
      : `http://localhost:8080/api/authentication/user/`;

    const method = editingUser ? "PUT" : "POST";

    await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setModalOpen(false);
    fetchUsers(page);
  };

  /* ---------- Bulk Upload Handlers ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

const handleFileUpload = async () => {
  if (!selectedFile) {
    alert("Sila pilih fail Excel terlebih dahulu");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await authFetch(
      "http://localhost:8080/api/authentication/student/bulk_upload/",
      {
        method: "POST",
        body: formData, // Do NOT set Content-Type manually
      }
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
    console.error("Upload error:", err);
    alert("Ralat semasa memuat naik fail. Sila cuba lagi.");
  }
};


  /* ---------- Filtered List ---------- */
  const filtered = users.filter((u) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      u.fullname.toLowerCase().includes(t) || u.role.toLowerCase().includes(t)
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  <td colSpan={4} className="empty-row">
                    Memuatkan rekod...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Tiada rekod
                  </td>
                </tr>
              ) : (
                filtered.map((u, index) => (
                  <tr key={u.id}>
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td>{u.fullname}</td>
                    <td>{u.role}</td>
                    <td>
                      <div className="action-btns-wrapper">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(u)}
                        >
                          Ubah
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => setConfirmDeleteId(u.id)}
                        >
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
      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal-box" onSubmit={handleSubmit}>
            <h2 className="modal-title">{editingUser ? "Edit Pengguna" : "Tambah Pengguna"}</h2>

            {/* Individual User Fields */}
            <input
              name="fullname"
              placeholder="Nama Penuh"
              value={form.fullname}
              onChange={handleChange}
              required
            />
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="teacher">Teacher</option>
              <option value="parents">Parents</option>
            </select>

            {/* Bulk Upload Section */}
            <div className="file-upload-section">
              <input type="file" accept=".xlsx" onChange={handleFileChange} />
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedFile}
              >
                Muat Naik Excel
              </button>
            </div>

            {/* Modal Buttons */}
            <div className="modal-btn-row" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>
              <button className="modal-save" type="submit">
                Simpan
              </button>
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
              <button
                className="modal-cancel"
                onClick={() => setConfirmDeleteId(null)}
              >
                Batal
              </button>
              <button className="modal-save" onClick={handleDelete}>
                Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

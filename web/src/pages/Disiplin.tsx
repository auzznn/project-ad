import React, { useEffect, useState } from "react";
import "./Sahsiah.css";

// ---- Interfaces ----
interface Disiplin {
  id?: number;
  name: string;
  description: string;
  points: number;
  tag: string;
}

// ---- Hardcoded categories/tags ----
const categories: string[] = [
  "Merosak Alam",
  "Mengabaikan Pelajaran",
  "Mengabaikan Tanggungjawab",
  "Akhlak Buruk",
];

export default function DisiplinPage() {
  const [disiplinList, setDisiplinList] = useState<Disiplin[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Disiplin | null>(null);

  const [form, setForm] = useState<Disiplin>({
    name: "",
    description: "",
    points: 0,
    tag: "",
  });

  // ---------- Fetch Disiplin list ----------
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/discipline/type/");
      const data = await res.json();

      if (Array.isArray(data)) setDisiplinList(data);
      else if (Array.isArray(data.records)) setDisiplinList(data.records);
      else setDisiplinList([]);
    } catch (err) {
      console.error("Gagal memuatkan rekod disiplin:", err);
      setDisiplinList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ---------- Create ----------
  const handleCreate = () => {
    setForm({ name: "", description: "", points: 0, tag: "" });
    setEditingItem(null);
    setModalOpen(true);
  };

  // ---------- Edit ----------
  const handleEdit = (item: Disiplin) => {
    setForm({ ...item });
    setEditingItem(item);
    setModalOpen(true);
  };

  // ---------- Delete ----------
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      await fetch(`http://localhost:8080/api/discipline/type/${confirmDeleteId}/`, {
        method: "DELETE",
      });

      setConfirmDeleteId(null);
      fetchItems();
    } catch (err) {
      console.error("Gagal memuatkan rekod disiplin:", err);
    }
  };

  // ---------- Form Change ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "points" ? Number(value) : value,
    }));
  };

  // ---------- Submit Form ----------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const url = editingItem?.id
        ? `http://localhost:8080/api/discipline/type/${editingItem.id}/`
        : "http://localhost:8080/api/discipline/type/";
      const method = editingItem?.id ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Gagal menyimpan rekod disiplin:", err);
    }
  };

  // ---------- Search Filter ----------
  const filteredList = disiplinList.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();

    return (
      item.name.toLowerCase().includes(term) ||
      item.tag.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      String(item.points).includes(term)
    );
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Pengurusan Disiplin</h1>

      <div className="section-box">

        {/* ---- Search + Add ---- */}
        <div className="controls-row">
          <input
            className="search-input"
            type="text"
            placeholder="Cari Disiplin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="add-btn" onClick={handleCreate}>
            + Tambah Disiplin
          </button>
        </div>

        {/* ---- Table ---- */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama</th>
                <th>Mata</th>
                <th>Kategori</th>
                <th>Penerangan</th>
                <th>Tindakan</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Memuatkan rekod...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Tiada rekod
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>
                      <span
                        className={`points-badge ${
                          item.points >= 0 ? "points-positive" : "points-negative"
                        }`}
                      >
                        {item.points}
                      </span>
                    </td>
                    <td>{item.tag}</td>
                    <td>{item.description}</td>
                    <td>
                      <div className="action-btns-wrapper">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Ubah
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() => setConfirmDeleteId(item.id ?? null)}
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
      </div>

      {/* ---- Create/Edit Modal ---- */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal-box" onSubmit={handleSubmit}>
            <h2 className="modal-title">
              {editingItem ? "Edit Sahsiah" : "Create Sahsiah"}
            </h2>

            <label>Nama</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Mata</label>
            <input
              name="points"
              type="number"
              value={form.points}
              onChange={handleChange}
              required
            />

            <label>Kategori</label>
            <select name="tag" value={form.tag} onChange={handleChange} required>
              <option value="">-- Pilih Kategori --</option>
              {categories.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <label>Penerangan</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <div className="modal-btn-row">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </button>

              <button type="submit" className="modal-save">
                {editingItem ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Delete Confirmation Modal ---- */}
      {confirmDeleteId !== null && (
        <div className="modal-backdrop">
          <div className="modal-box delete-modal">
            <h2 className="modal-title">Sahkan</h2>
            <p>Adakah pasti mahu memadamkan tipe disiplin ini?</p>

            <div className="modal-btn-row">
              <button
                className="modal-cancel"
                onClick={() => setConfirmDeleteId(null)}
              >
                Batal
              </button>

              <button className="modal-delete" onClick={confirmDelete}>
                Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

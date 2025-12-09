import React, { useEffect, useState } from "react";
import "./Sahsiah.css";

// ---- Interfaces ----
interface Sahsiah {
  id?: number;
  name: string;
  description: string;
  points: number;
  tag: string;
}

// ---- Hardcoded categories/tags ----
const categories: string[] = [
  "Environmental",
  "Academics",
  "Community Service",
  "Charity",
  "Moral",
];

export default function SahsiahPage() {
  const [sahsiahList, setSahsiahList] = useState<Sahsiah[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sahsiah | null>(null);
  const [form, setForm] = useState<Sahsiah>({
    name: "",
    description: "",
    points: 0,
    tag: "",
  });

  // ---- Fetch Sahsiah types from API ----
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/sahsiah/type/");
      const data = await res.json();

      // Ensure we always set an array
      if (Array.isArray(data)) setSahsiahList(data);
      else if (Array.isArray(data.records)) setSahsiahList(data.records);
      else setSahsiahList([]);
    } catch (err) {
      console.error("Failed to fetch Sahsiah types:", err);
      setSahsiahList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ---- Open modal to create a new Sahsiah ----
  const handleCreate = () => {
    setForm({ name: "", description: "", points: 0, tag: "" });
    setEditingItem(null);
    setModalOpen(true);
  };

  // ---- Open modal to edit existing Sahsiah ----
  const handleEdit = (item: Sahsiah) => {
    setForm({ ...item });
    setEditingItem(item);
    setModalOpen(true);
  };

  // ---- Delete Sahsiah ----
  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await fetch(`http://localhost:8080/api/sahsiah/type/${id}/`, {
        method: "DELETE",
      });
      fetchItems();
    } catch (err) {
      console.error("Failed to delete Sahsiah type:", err);
    }
  };

  // ---- Handle form input changes ----
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: name === "points" ? Number(value) : value,
          }
        : { name: "", description: "", points: 0, tag: "" }
    );
  };

  // ---- Submit form (create or update) ----
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;

    try {
      const url = editingItem?.id
        ? `http://localhost:8080/api/sahsiah/type/${editingItem.id}/`
        : "http://localhost:8080/api/sahsiah/type/";
      const method = editingItem?.id ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Failed to save Sahsiah type:", err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Sahsiah Management</h1>

      <div className="section-box">
        {/* Controls */}
        <div className="controls-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search..."
          />
          <button className="add-btn" onClick={handleCreate}>
            + Add Sahsiah
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Points</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Loading records...
                  </td>
                </tr>
              ) : sahsiahList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No records found
                  </td>
                </tr>
              ) : (
                sahsiahList.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.points}</td>
                    <td>{item.tag}</td>
                    <td>{item.description}</td>
                    <td>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----- Modal ----- */}
      {modalOpen && (
        <div className="modal-backdrop">
          <form className="modal-box" onSubmit={handleSubmit}>
            <h2 className="modal-title">
              {editingItem ? "Edit Sahsiah" : "Create Sahsiah"}
            </h2>

            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>Points</label>
            <input
              name="points"
              type="number"
              value={form.points}
              onChange={handleChange}
              required
            />

            <label>Category</label>
            <select
              name="tag"
              value={form.tag}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <label>Description</label>
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
                Cancel
              </button>
              <button type="submit" className="modal-save">
                {editingItem ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

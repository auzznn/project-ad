import React, { useEffect, useState } from "react";
import Pagination from "./pagination";

/* ---------- Generic Type ---------- */
export interface ManagementItem {
  id?: number;
  name: string;
  description: string;
  points: number;
  tag: string;
}

/* ---------- Props ---------- */
interface ManagementTypeProps {
  title: string;
  fetchUrl: string;
  deleteUrl: (id: number) => string;
  saveUrl: (id?: number) => string;
  serverPagination?: boolean;
  pageSize?: number;
}

/* ---------- Component ---------- */
export default function ManagementType({
  title,
  fetchUrl,
  deleteUrl,
  saveUrl,
  serverPagination = false,
  pageSize = 8,
}: ManagementTypeProps) {
  const [items, setItems] = useState<ManagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManagementItem | null>(null);

  const [form, setForm] = useState<ManagementItem>({
    name: "",
    description: "",
    points: 0,
    tag: "",
  });

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [creatingTag, setCreatingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /* ---------- Fetch ---------- */
  const fetchItems = async (pageNumber: number = 1) => {
    setLoading(true);
    try {
      const url = serverPagination
        ? `${fetchUrl}?page=${pageNumber}&page_size=${pageSize}`
        : fetchUrl;

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data.entry)) {
        const entries = data.entry as ManagementItem[];

        setItems(entries);

        const tags: string[] = Array.from(
          new Set(entries.map((item) => item.tag).filter(Boolean))
        );

        setAvailableTags(tags);
      } else {
        setItems([]);
        setAvailableTags([]);
      }

      setTotalItems(
        serverPagination ? data.total_items ?? 0 : data.entry?.length ?? 0
      );
    } catch (err) {
      console.error("Fetch failed:", err);
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }

    
  };

  useEffect(() => {
    fetchItems(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  /* ---------- Handlers ---------- */
  const handleCreate = () => {
    setForm({ name: "", description: "", points: 0, tag: "" });
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ManagementItem) => {
    setForm({ ...item });
    setCreatingTag(false);
    setNewTag("");
    setModalOpen(true);
  };


  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    await fetch(deleteUrl(confirmDeleteId), { method: "DELETE" });
    setConfirmDeleteId(null);
    fetchItems(page);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "points" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  await fetch(saveUrl(form.id), {
    method: form.id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

    setModalOpen(false);
    fetchItems(page);
  };

  /* ---------- Filter ---------- */
  const filtered = items.filter((item) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(t) ||
      item.tag.toLowerCase().includes(t) ||
      item.description.toLowerCase().includes(t) ||
      String(item.points).includes(t)
    );
  });

  const totalPages = serverPagination
    ? Math.ceil(totalItems / pageSize)
    : Math.ceil(filtered.length / pageSize);

  const list = serverPagination
    ? filtered
    : filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------- Render ---------- */
  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>

      <div className="section-box">
        <div className="controls-row">
          <input
            className="search-input"
            placeholder={`Cari ${title}...`}
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
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">
                    Tiada rekod
                  </td>
                </tr>
              ) : (
                list.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{item.name}</td>
                    <td>
                      <span
                        className={
                          item.points > 0
                            ? "marks-positive"
                            : item.points < 0
                            ? "marks-negative"
                            : "marks-zero"
                        }
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
                          onClick={() =>
                            setConfirmDeleteId(item.id ?? null)
                          }
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
            <h2 className="modal-title">
              {editingItem ? "Edit" : "Tambah"}
            </h2>

            <input name="name" value={form.name} onChange={handleChange} required />
            <input
              name="points"
              type="number"
              value={form.points}
              onChange={handleChange}
              required
            />

            <select
              value={creatingTag ? "__new__" : form.tag}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setCreatingTag(true);
                  setForm((p) => ({ ...p, tag: "" }));
                } else {
                  setCreatingTag(false);
                  setNewTag("");
                  setForm((p) => ({ ...p, tag: e.target.value }));
                }
              }}
              required
            >
              <option value="">-- Pilih Kategori --</option>

              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}

              <option value="__new__">+ Tambah kategori baru</option>
            </select>

            {creatingTag && (
              <input
                placeholder="Nama kategori baru"
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  setForm((p) => ({ ...p, tag: e.target.value }));
                }}
                required
              />
            )}

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
              <button className="modal-save" type="submit">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2 className="modal-title">Sahkan</h2>
            <p>Adakah pasti mahu memadam rekod ini?</p>

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

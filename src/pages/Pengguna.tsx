import { useEffect, useState } from "react";
import "./Pengguna.css";

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

// --- Mock API layer ---
async function getUsers(): Promise<User[]> {
  const stored = localStorage.getItem("users");
  if (stored) return JSON.parse(stored);

  // fetch from public/data/users.json only once (initial)
  const res = await fetch("/data/users.json");
  const data = await res.json();
  localStorage.setItem("users", JSON.stringify(data));
  return data;
}

async function saveUsers(users: User[]) {
  localStorage.setItem("users", JSON.stringify(users));
}

async function addUser(newUser: Omit<User, "id">): Promise<User[]> {
  const users = await getUsers();
  const newEntry = { id: Date.now(), ...newUser };
  const updated = [...users, newEntry];
  await saveUsers(updated);
  return updated;
}

async function deleteUser(id: number): Promise<User[]> {
  const users = await getUsers();
  const updated = users.filter((u) => u.id !== id);
  await saveUsers(updated);
  return updated;
}

async function updateUser(updatedUser: User): Promise<User[]> {
  const users = await getUsers();
  const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
  await saveUsers(updated);
  return updated;
}

// --- Main Component ---
export default function Pengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      const updated = await updateUser({ id: editId, name, email, role });
      setUsers(updated);
      setEditId(null);
    } else {
      const updated = await addUser({ name, email, role });
      setUsers(updated);
    }
    setName("");
    setEmail("");
    setRole("teacher");
  };

  const handleDelete = async (id: number) => {
    const updated = await deleteUser(id);
    setUsers(updated);
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
  };

  const handleCancel = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setRole("teacher");
  };

  return (
    <div className="pengguna-container">
      <div className="pengguna-header">
        <h1>Pengurusan Pengguna</h1>
        <p>Urus pengguna sistem dan peranan mereka</p>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <h2>{editId ? "Kemaskini Pengguna" : "Tambah Pengguna Baru"}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Nama Pengguna</label>
            <input
              id="name"
              type="text"
              placeholder="Masukkan nama pengguna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Peranan</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-control">
              <option value="teacher">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editId ? "Kemaskini" : "Tambah"}
            </button>
            {editId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="table-section">
        <h2>Senarai Pengguna</h2>
        <div className="table-container">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th>Peranan</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role === "admin" ? "Admin" : "Guru"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(u)}
                      title="Edit"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.id)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i> Padam
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

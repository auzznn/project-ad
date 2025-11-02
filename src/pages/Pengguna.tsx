import { useEffect, useState } from "react";

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
  const updated = users.filter(u => u.id !== id);
  await saveUsers(updated);
  return updated;
}

async function updateUser(updatedUser: User): Promise<User[]> {
  const users = await getUsers();
  const updated = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
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

  return (
    <div style={{ padding: "20px", color: "#333" }}>
      <h2>Manage Users</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editId ? "Update" : "Add"}</button>
      </form>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Edit</button>
                <button onClick={() => handleDelete(u.id)} style={{ marginLeft: "8px" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

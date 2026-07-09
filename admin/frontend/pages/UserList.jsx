import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/users", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setUsers(users.filter(user => user._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handlePromote = async (id, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        if (!window.confirm(`Are you sure you want to change role to ${newRole}?`)) return;

        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    if (loading) return <div style={{ padding: "40px" }}>Loading users...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Manage Users</h1>
                <Link to="/admin" className="outline-btn">Back to Dashboard</Link>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                        <th style={{ padding: "10px" }}>ID</th>
                        <th style={{ padding: "10px" }}>Name</th>
                        <th style={{ padding: "10px" }}>Email</th>
                        <th style={{ padding: "10px" }}>Role</th>
                        <th style={{ padding: "10px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "10px" }}>{user._id.slice(-6)}</td>
                            <td style={{ padding: "10px" }}>{user.firstName} {user.lastName}</td>
                            <td style={{ padding: "10px" }}>{user.email}</td>
                            <td style={{ padding: "10px" }}>
                                <span className={user.role === "admin" ? "badge-admin" : "badge-user"}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: "10px", display: "flex", gap: "10px" }}>
                                <button 
                                    onClick={() => handlePromote(user._id, user.role)}
                                    className="outline-btn"
                                    style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                                >
                                    Toggle Admin
                                </button>
                                <button 
                                    onClick={() => handleDelete(user._id)}
                                    className="danger-btn"
                                    style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>{`
                .badge-admin { background: #4CAF50; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
                .badge-user { background: #607d8b; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
                .danger-btn { background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .danger-btn:hover { background: #d32f2f; }
            `}</style>
        </div>
    );
};

export default UserList;

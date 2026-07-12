import { useEffect, useState } from "react";

const API = "https://electro-mart-qalg.vercel.app";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/api/users`, { credentials: "include" });
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
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone!")) return;
        try {
            const res = await fetch(`${API}/api/users/${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const handleBan = async (id, isBanned) => {
        const actionText = isBanned ? "unban" : "ban";
        if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return;
        try {
            const res = await fetch(`${API}/api/users/${id}/ban`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Failed to update ban status");
                return;
            }
            fetchUsers();
        } catch (error) {
            console.error("Failed to ban/unban user", error);
        }
    };


    if (loading) return <div className="loading">Loading users...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Manage Users</h1>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status / Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user._id.slice(-6)}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`} style={{ marginRight: "8px" }}>
                                    {user.role}
                                </span>
                                {user.isBanned && <span className="badge badge-banned">banned</span>}
                            </td>
                            <td>
                                <div className="btn-group">

                                    <button onClick={() => handleBan(user._id, user.isBanned)} className={`btn btn-sm ${user.isBanned ? "btn-outline" : "btn-warning"}`}>
                                        {user.isBanned ? "Unban" : "Ban"}
                                    </button>
                                    <button onClick={() => handleDelete(user._id)} className="btn btn-danger btn-sm">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;

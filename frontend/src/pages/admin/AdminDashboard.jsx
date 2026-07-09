import { Link } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin control panel. Manage your store below:</p>

            <div style={{ display: "flex", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>
                <Link to="/admin/users" className="admin-card">
                    <h2>Users</h2>
                    <p>View and manage all registered users.</p>
                </Link>

                <Link to="/admin/products" className="admin-card">
                    <h2>Products</h2>
                    <p>Create, edit, and delete products in the catalog.</p>
                </Link>

                <Link to="/admin/orders" className="admin-card">
                    <h2>Orders</h2>
                    <p>View all orders and update their delivery status.</p>
                </Link>
            </div>
            <style>{`
                .admin-card {
                    flex: 1;
                    min-width: 200px;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    text-decoration: none;
                    color: inherit;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .admin-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .admin-card h2 {
                    margin-top: 0;
                    color: #007bff;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;

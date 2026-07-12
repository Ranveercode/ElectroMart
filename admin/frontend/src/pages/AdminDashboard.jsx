import { Link } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                Welcome to the ElectroMart admin panel. Manage your store below:
            </p>

            <div className="dashboard-cards">
                <Link to="/admin/users" className="dash-card">
                    <div className="card-icon">👥</div>
                    <h2>Users</h2>
                    <p>View, ban, promote, and manage all registered users.</p>
                </Link>

                <Link to="/admin/products" className="dash-card">
                    <div className="card-icon">📦</div>
                    <h2>Products</h2>
                    <p>Create, edit, and delete products in the catalog.</p>
                </Link>

                <Link to="/admin/orders" className="dash-card">
                    <div className="card-icon">🛒</div>
                    <h2>Orders</h2>
                    <p>View all orders and update their delivery status.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;

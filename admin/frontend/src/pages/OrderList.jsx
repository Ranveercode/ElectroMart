import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API}/api/orders`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeliver = async (id) => {
        if (!window.confirm("Mark this order as delivered?")) return;
        try {
            const res = await fetch(`${API}/api/orders/${id}/deliver`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: "Delivered" })
            });
            if (res.ok) fetchOrders();
        } catch (error) {
            console.error("Failed to update order", error);
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Manage Orders</h1>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Delivered</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id.slice(-6)}</td>
                            <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : "Deleted User"}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>₹{order.totalPrice}</td>
                            <td>{order.paymentMethod}</td>
                            <td>
                                {order.isDelivered ? (
                                    <span className="badge badge-delivered">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                                ) : (
                                    <span className="badge badge-pending">Pending</span>
                                )}
                            </td>
                            <td>
                                {!order.isDelivered && (
                                    <button onClick={() => handleDeliver(order._id)} className="btn btn-success btn-sm">
                                        Mark Delivered
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderList;

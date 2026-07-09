import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/orders", {
                credentials: "include",
            });
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
            const res = await fetch(`http://localhost:5000/api/orders/${id}/deliver`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: "Delivered" })
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error("Failed to update order", error);
        }
    };

    if (loading) return <div style={{ padding: "40px" }}>Loading orders...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Manage Orders</h1>
                <Link to="/admin" className="outline-btn">Back to Dashboard</Link>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                        <th style={{ padding: "10px" }}>Order ID</th>
                        <th style={{ padding: "10px" }}>User</th>
                        <th style={{ padding: "10px" }}>Date</th>
                        <th style={{ padding: "10px" }}>Total</th>
                        <th style={{ padding: "10px" }}>Paid</th>
                        <th style={{ padding: "10px" }}>Delivered</th>
                        <th style={{ padding: "10px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "10px" }}>{order._id.slice(-6)}</td>
                            <td style={{ padding: "10px" }}>
                                {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Deleted User"}
                            </td>
                            <td style={{ padding: "10px" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: "10px" }}>₹{order.totalPrice}</td>
                            <td style={{ padding: "10px" }}>
                                {order.paymentMethod}
                            </td>
                            <td style={{ padding: "10px" }}>
                                {order.isDelivered ? (
                                    <span style={{ color: "green" }}>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                                ) : (
                                    <span style={{ color: "red" }}>No</span>
                                )}
                            </td>
                            <td style={{ padding: "10px" }}>
                                {!order.isDelivered && (
                                    <button 
                                        onClick={() => handleDeliver(order._id)}
                                        className="primary-btn"
                                        style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>{`
                .primary-btn { background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
                .primary-btn:hover { background: #388E3C; }
            `}</style>
        </div>
    );
};

export default OrderList;

import { Link } from "react-router-dom";

function OrderHistoryPage({ orders = [] }) {
  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

  return (
    <section className="page-section">
      <div className="section-head">
        <h2>Your Orders</h2>
        <p>Track placed orders, payment method, and delivery status.</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="empty-box">
          <h3>No orders yet</h3>
          <p>Your placed orders will appear here.</p>
          <Link to="/products" className="primary-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-history-card">
              <div className="order-history-top">
                <div>
                  <p className="order-label">Order ID</p>
                  <h3>{order._id.slice(-6)}</h3>
                </div>

                <span 
                  className="order-status" 
                  style={{ 
                    color: order.isDelivered ? "#4CAF50" : "#f44336",
                    fontWeight: "bold",
                    background: order.isDelivered ? "#e8f5e9" : "#ffebee",
                    padding: "5px 10px",
                    borderRadius: "4px"
                  }}
                >
                  {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : "Processing"}
                </span>
              </div>

              <div className="order-history-grid">
                <div className="order-history-box">
                  <span>Date</span>
                  <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                </div>

                <div className="order-history-box">
                  <span>Payment</span>
                  <strong>{order.paymentMethod}</strong>
                </div>

                <div className="order-history-box">
                  <span>Total</span>
                  <strong>{formatPrice(order.totalPrice)}</strong>
                </div>
              </div>

              <div className="order-items-wrap">
                <h4>Items</h4>

                <div className="order-items-list">
                  {(order.orderItems || []).map((item) => (
                    <div key={item._id || item.product} className="order-item-row">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-item-thumb"
                      />

                      <div className="order-item-info">
                        <strong>{item.name}</strong>
                        <p className="light-text">
                          Qty: {item.qty} × {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="order-item-price">
                        {formatPrice(item.qty * item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-total-bar">
                <span>Grand Total</span>
                <strong>{formatPrice(order.totalPrice)}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderHistoryPage;
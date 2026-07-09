import { Link, Navigate, useLocation } from "react-router-dom";

function OrderSuccessPage() {
  const location = useLocation();
  const orderSuccess = location.state?.orderSuccess;

  if (!orderSuccess) {
    return <Navigate to="/products" replace />;
  }

  return (
    <section className="page-section">
      <div className="order-success-page">
        <div className="order-success-card single-page-success">
          <div className="success-icon-wrap">
            <div className="success-icon-ring"></div>
            <div className="success-icon">✓</div>
          </div>

          <p className="success-eyebrow">Payment Complete</p>
          <h1 className="success-title">Order Placed Successfully</h1>
          <p className="success-subtitle">
            Your order has been confirmed and is now being processed.
          </p>

          <div className="success-details">
            <div className="success-detail-box">
              <span>Order Number</span>
              <strong>{orderSuccess.orderId}</strong>
            </div>

            <div className="success-detail-box">
              <span>Date</span>
              <strong>{orderSuccess.orderedAt}</strong>
            </div>

            <div className="success-detail-box">
              <span>Customer</span>
              <strong>{orderSuccess.fullName}</strong>
            </div>

            <div className="success-detail-box">
              <span>Payment</span>
              <strong>{orderSuccess.paymentMethod}</strong>
            </div>
          </div>

          <p className="success-thanks">Thanks for ordering with ElectroMart.</p>

          <div className="success-page-actions">
            <Link to="/orders" className="primary-btn">
              View Orders
            </Link>

            <Link to="/products" className="secondary-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccessPage;
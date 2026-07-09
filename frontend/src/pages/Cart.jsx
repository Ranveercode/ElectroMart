import { Link } from "react-router-dom";
import { useState } from "react";

function CartPage({
  cartItems = [],
  onIncrease,
  onDecrease,
  onRemove,
  subtotal = 0,
  shipping = 0,
  tax = 0,
  totalPrice = 0,
  coupon,
  discount = 0,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [imageFailed, setImageFailed] = useState({});

  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;

  return (
    <section className="page-section">
      <div className="section-head">
        <h2>Your Cart</h2>
        <p>Review selected products, apply coupons, and proceed to checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-box">
          <h3>Your cart is empty</h3>
          <p>Add products to continue shopping.</p>
          <Link to="/products" className="primary-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-wrap">
            {cartItems.map((item) => (
              <article key={item._id} className="cart-item-card">
                {!imageFailed[item._id] ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                    onError={() =>
                      setImageFailed((prev) => ({ ...prev, [item._id]: true }))
                    }
                  />
                ) : (
                  <div className="product-image-fallback">
                    <span>{item.name}</span>
                  </div>
                )}

                <div className="cart-item-content">
                  <div>
                    <span className="product-badge">{item.segment}</span>
                    <h3>{item.name}</h3>
                    <p className="light-text">{formatPrice(item.price)} each</p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-box">
                      <button type="button" onClick={() => onDecrease(item._id)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onIncrease(item._id)}>+</button>
                    </div>

                    <strong className="highlight-price">
                      {formatPrice(item.price * item.quantity)}
                    </strong>

                    <button
                      className="remove-btn"
                      type="button"
                      onClick={() => onRemove(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>

            <div className="coupon-box">
              <input
                type="text"
                className="input-control"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
              />
              <button
                className="primary-btn"
                type="button"
                onClick={() => {
                  onApplyCoupon(couponCode);
                  setCouponCode("");
                }}
              >
                Apply
              </button>
            </div>

            {coupon ? (
              <div className="applied-coupon">
                <span>✓ Applied: {coupon.code}</span>
                <button className="outline-btn" type="button" onClick={onRemoveCoupon}>
                  Remove
                </button>
              </div>
            ) : null}

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>

            <div className="summary-row">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="summary-row">
              <span>Discount</span>
              <span>− {formatPrice(discount)}</span>
            </div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span className="highlight-price">{formatPrice(totalPrice)}</span>
            </div>

            <Link to="/checkout" className="primary-btn checkout-btn">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="page-section">
      <div className="hero-card">
        <p className="hero-badge">Welcome to AI Shop</p>
        <h2 className="hero-title">Buy smart gadgets with a clean cart flow</h2>
        <p className="hero-text">
          Browse products, open product details, add items to cart, complete
          checkout, and place an order.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="primary-btn">
            Browse Products
          </Link>
          <Link to="/cart" className="secondary-btn">
            Open Cart
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
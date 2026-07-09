import { useState } from "react";
import { Link } from "react-router-dom";

function WishlistPage({ wishlistItems = [], onAddToCart, onRemoveWishlist }) {
  const [failedImages, setFailedImages] = useState({});
  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;

  return (
    <section className="page-section">
      <div className="section-head">
        <h2>My Wishlist</h2>
        <p>Save favorite products and move them to your cart anytime.</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-box">
          <h3>Your wishlist is empty</h3>
          <p>Add products to wishlist and they will appear here.</p>
          <Link to="/products" className="primary-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map((product) => (
            <article key={product._id} className="product-card">
              <Link to={`/products/${product._id}`} className="product-image-link">
                {!failedImages[product._id] ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [product._id]: true }))
                    }
                  />
                ) : (
                  <div className="product-image-fallback">
                    <span>{product.name}</span>
                  </div>
                )}
              </Link>

              <div className="product-content">
                <span className="product-badge">{product.segment}</span>
                <h3>{product.name}</h3>
                <p className="light-text">{product.description}</p>

                <div className="product-footer">
                  <strong className="highlight-price">{formatPrice(product.price)}</strong>
                </div>

                <div className="wishlist-actions">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => onAddToCart(product)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="remove-btn"
                    type="button"
                    onClick={() => onRemoveWishlist(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default WishlistPage;
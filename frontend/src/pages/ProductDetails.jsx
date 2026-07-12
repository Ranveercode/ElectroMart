import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ProductDetailsPage({ onAddToCart, onAddToWishlist }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch single product
        const productRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products/${id}`);
        if (!productRes.ok) throw new Error("Product not found");
        const productData = await productRes.json();
        setProduct(productData);

        // Fetch related products in same segment
        const relatedRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products?segment=${productData.segment}`);
        if (relatedRes.ok) {
          const allRelated = await relatedRes.json();
          // Filter out the current product
          setRelatedProducts(allRelated.filter(item => item._id !== id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <section className="page-section">
        <div className="empty-box">
          <p>Loading product details...</p>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page-section">
        <div className="empty-box">
          <h3>Product not found</h3>
          <p>{error || "The product you are looking for does not exist or was removed."}</p>
          <Link to="/products" className="primary-btn">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="product-details-layout">
        <div className="product-details-image-wrap">
          {!imageFailed ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-details-image"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="product-image-fallback"
              style={{ minHeight: 420 }}
              role="img"
              aria-label={product.name}
            >
              <span>{product.name}</span>
            </div>
          )}
        </div>

        <div className="product-details-content">
          <span className="pill">{product.segment}</span>
          <h2>{product.name}</h2>
          <p className="product-details-price">{formatPrice(product.price)}</p>
          <p className="product-details-text">{product.description}</p>

          <div className="product-feature-list">
            <div className="product-feature-item">
              <span>Category</span>
              <strong>{product.segment}</strong>
            </div>

            <div className="product-feature-item">
              <span>Availability</span>
              <strong>In Stock</strong>
            </div>

            <div className="product-feature-item">
              <span>Delivery</span>
              <strong>Standard 3-5 days</strong>
            </div>

            <div className="product-feature-item">
              <span>Support</span>
              <strong>24/7 Customer Help</strong>
            </div>
          </div>

          <div className="product-detail-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => onAddToCart(product)}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => onAddToWishlist(product)}
            >
              Add to Wishlist
            </button>
          </div>

          <Link to="/products" className="back-link-btn">
            ← Back to Products
          </Link>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <div className="section-head">
            <h2>Related Products</h2>
            <p>Explore more products from the same category.</p>
          </div>

          <div className="products-grid">
            {relatedProducts.map((item) => (
              <article key={item._id} className="product-card">
                <Link to={`/products/${item._id}`} className="product-image-link">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                  />
                </Link>

                <div className="product-content">
                  <span className="pill">{item.segment}</span>
                  <h3>{item.name}</h3>
                  <p className="light-text">{item.description}</p>

                  <div className="product-footer">
                    <strong className="highlight-price">{formatPrice(item.price)}</strong>

                    <div className="product-card-actions">
                      <Link
                        to={`/products/${item._id}`}
                        className="secondary-btn"
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => onAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetailsPage;
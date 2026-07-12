import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart, onAddToWishlist }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-image-link">
        {!imageFailed ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-image-fallback" role="img" aria-label={product.name}>
            <span>{product.name}</span>
          </div>
        )}
      </Link>

      <div className="product-meta">
        <span className="product-tag">{product.segment || product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">₹{product.price.toLocaleString("en-IN")}</span>

          <div className="product-card-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={() => onAddToCart(product)}
            >
              Add to Cart
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => onAddToWishlist(product)}
            >
              ♡
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Products({ onAddToCart, onAddToWishlist }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`https://electro-mart-qalg.vercel.app/api/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const segments = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.segment))];
    return unique.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let updatedProducts = [...products];

    if (searchTerm.trim()) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (segmentFilter) {
      updatedProducts = updatedProducts.filter(
        (product) => product.segment === segmentFilter
      );
    }

    if (priceFilter === "low") {
      updatedProducts.sort((a, b) => a.price - b.price);
    }

    if (priceFilter === "high") {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    return updatedProducts;
  }, [products, searchTerm, priceFilter, segmentFilter]);

  return (
    <section className="page-section products-page">
      <div className="products-header">
        <h1>Explore Electronics</h1>
        <p>Search products, filter by price, and browse by segment.</p>
      </div>

      <div className="filters-wrap">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option value="">Sort by Price</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
          >
            <option value="">All Segments</option>
            {segments.map((seg) => (
              <option key={seg} value={seg}>{seg}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="results-count">Showing {filteredProducts.length} products</p>

      <div className="products-grid">
        {loading ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>Loading products...</p>
        ) : error ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "red" }}>{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
            />
          ))
        )}
      </div>
    </section>
  );
}
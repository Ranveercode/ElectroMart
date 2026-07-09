import { Link } from "react-router-dom";

function Navbar({ cartCount }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          ShopEasy
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart ({cartCount})</Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
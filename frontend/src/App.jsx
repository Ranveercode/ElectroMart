import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import ProductsPage from "./pages/Products";
import ProductDetailsPage from "./pages/ProductDetails";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import OrderSuccessPage from "./pages/OrderSuccess";
import OrderHistoryPage from "./pages/OrderHistory";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProfilePage from "./pages/Profile";
import ForgotPasswordPage from "./pages/ForgotPassword";
import WishlistPage from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserList from "./pages/admin/UserList";
import ProductList from "./pages/admin/ProductList";
import ProductEdit from "./pages/admin/ProductEdit";
import OrderList from "./pages/admin/OrderList";
import AIChatWidget from "./components/AIChatWidget";

function Navbar({ cartCount, isAuthenticated, currentUser }) {
  if (!isAuthenticated) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/products" className="logo">
          ElectroMart
        </Link>

        <nav className="nav-links">
          <Link to="/products">Products</Link>

          <Link to="/cart" className="cart-link">
            Cart
            <span className="cart-badge">{cartCount}</span>
          </Link>

          <Link to="/profile" className="outline-btn nav-btn">
            Profile
          </Link>
          
          {currentUser?.role === "admin" && (
            <Link to="/admin" className="primary-btn nav-btn" style={{ background: "#d32f2f", color: "white" }}>
              Admin Panel
            </Link>
          )}

          <span className="user-chip">{currentUser?.name || "Customer"}</span>
        </nav>
      </div>
    </header>
  );
}

function App() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [coupon, setCoupon] = useState(() =>
    JSON.parse(localStorage.getItem("electromart_coupon") || "null")
  );
  
  const [toast, setToast] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("electromart_coupon", JSON.stringify(coupon));
  }, [coupon]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setCurrentUser(userData);
          fetchUserData(); // Fetch cart, wishlist, orders
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserData = async () => {
    try {
      const [cartRes, orderRes, wishlistRes] = await Promise.all([
        fetch("http://localhost:5000/api/cart", { credentials: "include" }),
        fetch("http://localhost:5000/api/orders/myorders", { credentials: "include" }),
        fetch("http://localhost:5000/api/users/wishlist", { credentials: "include" })
      ]);
      
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const formattedCart = cartData?.items?.map(item => ({
          ...item.product,
          quantity: item.quantity
        })) || [];
        setCartItems(formattedCart);
      }
      
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlistItems(wishlistData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    fetchUserData();
    showToast("Logged in successfully");
  };

  const handleSignup = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
    fetchUserData();
    showToast("Account created successfully");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCartItems([]);
    setWishlistItems([]);
    setOrders([]);
    navigate("/login");
    showToast("Logged out", "error");
  };

  const handleUpdateProfile = (updatedUser) => {
    // Basic local state update for profile
    setCurrentUser(updatedUser);
    showToast("Profile updated successfully");
  };

  const addToCart = async (product) => {
    try {
      const existing = cartItems.find((item) => item._id === product._id);
      const newQuantity = existing ? existing.quantity + 1 : 1;
      
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product._id, quantity: newQuantity })
      });
      
      if (response.ok) {
        const cartData = await response.json();
        const formattedCart = cartData?.items?.map(item => ({
            ...item.product,
            quantity: item.quantity
        })) || [];
        setCartItems(formattedCart);
        showToast(`${product.name} added to cart`);
      }
    } catch(err) {
      showToast("Error adding to cart", "error");
    }
  };

  const addToWishlist = async (product) => {
    try {
      const exists = wishlistItems.some((item) => item._id === product._id);
      if (exists) {
        showToast("Already in wishlist", "error");
        return;
      }
      const response = await fetch("http://localhost:5000/api/users/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product._id })
      });
      if (response.ok) {
         const wishlistData = await response.json();
         setWishlistItems(wishlistData);
         showToast(`${product.name} added to wishlist`);
      }
    } catch(err) {
       showToast("Error adding to wishlist", "error");
    }
  };

  const removeWishlist = async (id) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id })
      });
      if (response.ok) {
         const wishlistData = await response.json();
         setWishlistItems(wishlistData);
         showToast("Removed from wishlist", "error");
      }
    } catch(err) {
       showToast("Error removing from wishlist", "error");
    }
  };

  const increaseQuantity = async (id) => {
    const existing = cartItems.find((item) => item._id === id);
    if(!existing) return;
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id, quantity: existing.quantity + 1 })
      });
      if(response.ok){
        const cartData = await response.json();
        const formattedCart = cartData?.items?.map(item => ({
            ...item.product,
            quantity: item.quantity
        })) || [];
        setCartItems(formattedCart);
      }
    } catch(err){}
  };

  const decreaseQuantity = async (id) => {
    const existing = cartItems.find((item) => item._id === id);
    if(!existing) return;
    if(existing.quantity === 1) {
       return removeFromCart(id);
    }
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id, quantity: existing.quantity - 1 })
      });
      if(response.ok){
        const cartData = await response.json();
        const formattedCart = cartData?.items?.map(item => ({
            ...item.product,
            quantity: item.quantity
        })) || [];
        setCartItems(formattedCart);
      }
    } catch(err){}
  };

  const removeFromCart = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        const cartData = await response.json();
        const formattedCart = cartData?.items?.map(item => ({
            ...item.product,
            quantity: item.quantity
        })) || [];
        setCartItems(formattedCart);
        showToast("Item removed from cart", "error");
      }
    } catch(err){}
  };

  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase();

    if (normalized === "SAVE10") {
      setCoupon({ code: "SAVE10", type: "percent", value: 10 });
      showToast("Coupon SAVE10 applied");
      return;
    }

    if (normalized === "FLAT50") {
      setCoupon({ code: "FLAT50", type: "flat", value: 50 });
      showToast("Coupon FLAT50 applied");
      return;
    }

    showToast("Invalid coupon code", "error");
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast("Coupon removed", "error");
  };

  const placeOrder = async (billingDetails, paymentMethod) => {
    const subtotalValue = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingValue = cartItems.length > 0 ? 25 : 0;
    const taxValue = cartItems.length > 0 ? Math.round(subtotalValue * 0.08) : 0;
    const discountValue = coupon?.type === "percent" ? Math.round((subtotalValue * coupon.value) / 100) : coupon?.type === "flat" ? coupon.value : 0;
    const totalValue = Math.max(subtotalValue + shippingValue + taxValue - discountValue, 0);

    const orderPayload = {
      orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id
      })),
      shippingAddress: {
          address: billingDetails.address,
          city: billingDetails.city,
          postalCode: billingDetails.zipCode,
          country: billingDetails.country,
          phone: billingDetails.phone
      },
      paymentMethod: paymentMethod,
      itemsPrice: subtotalValue,
      taxPrice: taxValue,
      shippingPrice: shippingValue,
      totalPrice: totalValue,
      discount: discountValue,
      couponCode: coupon?.code || null
    };

    try {
       const response = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(orderPayload)
       });

       if(response.ok) {
          const newOrder = await response.json();
          setOrders(prev => [newOrder, ...prev]);
          
          await fetch("http://localhost:5000/api/cart/clear", {
             method: "DELETE",
             credentials: "include"
          });
          setCartItems([]);
          setCoupon(null);

          navigate("/order-success", {
            state: {
              orderSuccess: {
                fullName: billingDetails.fullName,
                orderId: newOrder._id || newOrder.id || `ORD-${Date.now().toString().slice(-6)}`,
                orderedAt: new Date().toLocaleString(),
                paymentMethod,
              },
            },
          });
       } else {
          showToast("Failed to place order", "error");
       }
    } catch (err) {
       showToast("Failed to place order", "error");
    }
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = cartItems.length > 0 ? 25 : 0;
  const tax = cartItems.length > 0 ? Math.round(subtotal * 0.08) : 0;

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") {
      return Math.round((subtotal * coupon.value) / 100);
    }
    return coupon.value;
  }, [coupon, subtotal]);

  const totalPrice = Math.max(subtotal + shipping + tax - discount, 0);

  if (authLoading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <>
      <Navbar
        cartCount={cartCount}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />

      {toast && (
        <div className={`toast-popup ${toast.type === "error" ? "error" : ""}`}>
          {toast.message}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/products" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={<LoginPage isAuthenticated={isAuthenticated} onLogin={handleLogin} />}
        />

        <Route
          path="/signup"
          element={<SignupPage isAuthenticated={isAuthenticated} onSignup={handleSignup} />}
        />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/products"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProductsPage
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProductDetailsPage
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <WishlistPage
                wishlistItems={wishlistItems}
                onAddToCart={addToCart}
                onRemoveWishlist={removeWishlist}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CartPage
                cartItems={cartItems}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                totalPrice={totalPrice}
                coupon={coupon}
                discount={discount}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CheckoutPage
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                totalPrice={totalPrice}
                onPlaceOrder={placeOrder}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <OrderHistoryPage orders={orders} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} adminOnly={true} currentUser={currentUser}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} adminOnly={true} currentUser={currentUser}>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} adminOnly={true} currentUser={currentUser}>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} adminOnly={true} currentUser={currentUser}>
              <ProductEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} adminOnly={true} currentUser={currentUser}>
              <ProductEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} adminOnly={true} currentUser={currentUser}>
              <OrderList />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/products" : "/login"} replace />}
        />
      </Routes>

      {isAuthenticated && <AIChatWidget currentUser={currentUser} />}
    </>
  );
}

export default App;
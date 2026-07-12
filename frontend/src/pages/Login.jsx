import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage({ isAuthenticated, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/products";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/products" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      onLogin({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <p className="auth-eyebrow">Welcome back</p>
          <h2>Login to ElectroMart</h2>
          <p className="light-text">
            Login first, then continue shopping and manage orders.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loginEmail">Email</label>
            <input
              id="loginEmail"
              type="email"
              name="email"
              className="input-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              name="password"
              className="input-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "35px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
                opacity: 0.7
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="confirm-btn auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-links-stack">
          <Link to="/forgot-password" className="auth-link centered-link">
            Forgot Password?
          </Link>
        </div>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
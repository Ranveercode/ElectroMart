import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

function SignupPage({ isAuthenticated, onSignup }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill in all fields");
      return;
    }

    // Split full name into first and last name for the backend
    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : " ";

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      onSignup({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
      });

      navigate("/products", { replace: true });
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
          <p className="auth-eyebrow">Create account</p>
          <h2>Join ElectroMart</h2>
          <p className="light-text">
            Sign up first to access products, cart, and orders.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signupName">Full Name</label>
            <input
              id="signupName"
              type="text"
              name="fullName"
              className="input-control"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signupEmail">Email</label>
            <input
              id="signupEmail"
              type="email"
              name="email"
              className="input-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              type="password"
              name="password"
              className="input-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="confirm-btn auth-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default SignupPage;
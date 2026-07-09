import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSendReset = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem("electromart_users") || "[]");
    const userExists = savedUsers.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      setMessage("No account found with this email");
      return;
    }

    setMessage("Demo reset link sent successfully");
    setStep(2);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      setMessage("Please enter a new password");
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem("electromart_users") || "[]");

    const updatedUsers = savedUsers.map((user) =>
      user.email.toLowerCase() === email.toLowerCase()
        ? { ...user, password: newPassword }
        : user
    );

    localStorage.setItem("electromart_users", JSON.stringify(updatedUsers));
    setMessage("Password updated successfully");

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);
  };

  return (
    <section className="page-section auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <p className="auth-eyebrow">Password help</p>
          <h2>Forgot Password</h2>
          <p className="light-text">
            This is a demo reset flow for your frontend project.
          </p>
        </div>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendReset}>
            <div className="form-group">
              <label htmlFor="forgotEmail">Email</label>
              <input
                id="forgotEmail"
                type="email"
                className="input-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
              />
            </div>

            {message ? <p className="auth-error auth-success">{message}</p> : null}

            <button type="submit" className="confirm-btn auth-btn">
              Send Reset Link
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="input-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            {message ? <p className="auth-error auth-success">{message}</p> : null}

            <button type="submit" className="confirm-btn auth-btn">
              Update Password
            </button>
          </form>
        )}

        <p className="auth-switch">
          Back to{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
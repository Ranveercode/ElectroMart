import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Profile({ currentUser, onUpdateProfile, onLogout }) {
  const [activePanel, setActivePanel] = useState("overview");
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    mobile: currentUser?.mobile || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newAddress, setNewAddress] = useState({
    fullName: currentUser?.name || "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const [paymentInput, setPaymentInput] = useState({
    cardHolder: currentUser?.name || "",
    cardNumber: "",
    expiry: "",
    upiId: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [savedAddresses, setSavedAddresses] = useState(() =>
    JSON.parse(localStorage.getItem("electromart_addresses") || "[]").filter(
      (item) => item.userEmail === currentUser?.email
    )
  );

  const [savedPayments, setSavedPayments] = useState(() =>
    JSON.parse(localStorage.getItem("electromart_payments") || "[]").filter(
      (item) => item.userEmail === currentUser?.email
    )
  );

  const [isPrimeEnabled, setIsPrimeEnabled] = useState(() =>
    JSON.parse(localStorage.getItem("electromart_prime") || "false")
  );

  const totalOrders = useMemo(() => {
    const allOrders = JSON.parse(localStorage.getItem("electromart_orders") || "[]");
    return allOrders.filter((order) => order.userEmail === currentUser?.email).length;
  }, [currentUser]);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const handleProfileChange = (e) => {
    clearAlerts();
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    clearAlerts();

    const nameRegex = /^[A-Za-z ]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!nameRegex.test(profileData.name.trim())) {
      setError("Enter a valid full name");
      return;
    }

    if (!emailRegex.test(profileData.email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    if (profileData.mobile && !mobileRegex.test(profileData.mobile.trim())) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    onUpdateProfile({
      ...currentUser,
      name: profileData.name.trim(),
      email: profileData.email.trim(),
      mobile: profileData.mobile.trim(),
    });

    setMessage("Login & security details updated successfully");
  };

  const handlePasswordChange = (e) => {
    clearAlerts();
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    clearAlerts();

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setMessage("Password updated successfully (demo mode)");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    clearAlerts();

    let updatedValue = value;

    if (name === "phone") {
      updatedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    if (name === "city" || name === "state" || name === "country" || name === "fullName") {
      updatedValue = value.replace(/[^A-Za-z ]/g, "");
    }

    if (name === "zipCode") {
      updatedValue = value.replace(/[^A-Za-z0-9 -]/g, "").slice(0, 10);
    }

    setNewAddress((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    clearAlerts();

    const addressPayload = {
      id: Date.now(),
      userEmail: currentUser?.email,
      fullName: newAddress.fullName.trim(),
      phone: newAddress.phone.trim(),
      line1: newAddress.line1.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim(),
      zipCode: newAddress.zipCode.trim(),
      country: newAddress.country.trim(),
    };

    if (
      !addressPayload.fullName ||
      !addressPayload.phone ||
      !addressPayload.line1 ||
      !addressPayload.city ||
      !addressPayload.state ||
      !addressPayload.zipCode ||
      !addressPayload.country
    ) {
      setError("Please fill all address fields");
      return;
    }

    if (addressPayload.line1.length < 8) {
      setError("Address must be at least 8 characters");
      return;
    }

    if (!/[A-Za-z]/.test(addressPayload.line1) || !/[0-9]/.test(addressPayload.line1)) {
      setError("Address should include both letters and numbers");
      return;
    }

    if (!/^[0-9]{10}$/.test(addressPayload.phone)) {
      setError("Phone must be exactly 10 digits");
      return;
    }

    const updated = [...savedAddresses, addressPayload];
    setSavedAddresses(updated);

    const allAddresses = JSON.parse(localStorage.getItem("electromart_addresses") || "[]")
      .filter((item) => item.userEmail !== currentUser?.email);

    localStorage.setItem(
      "electromart_addresses",
      JSON.stringify([...allAddresses, ...updated])
    );

    setMessage("Address added successfully");
    setNewAddress({
      fullName: currentUser?.name || "",
      phone: "",
      line1: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    });
  };

  const handleDeleteAddress = (id) => {
    clearAlerts();
    const updated = savedAddresses.filter((item) => item.id !== id);
    setSavedAddresses(updated);

    const allAddresses = JSON.parse(localStorage.getItem("electromart_addresses") || "[]")
      .filter((item) => !(item.userEmail === currentUser?.email && item.id === id));

    localStorage.setItem("electromart_addresses", JSON.stringify(allAddresses));
    setMessage("Address removed successfully");
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    clearAlerts();

    let updatedValue = value;

    if (name === "cardNumber") {
      updatedValue = value.replace(/[^0-9]/g, "").slice(0, 16);
    }

    if (name === "expiry") {
      updatedValue = value.replace(/[^0-9/]/g, "").slice(0, 5);
    }

    setPaymentInput((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    clearAlerts();

    if (!paymentInput.cardHolder.trim()) {
      setError("Card holder name is required");
      return;
    }

    if (!/^[0-9]{16}$/.test(paymentInput.cardNumber)) {
      setError("Card number must be 16 digits");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(paymentInput.expiry)) {
      setError("Expiry must be in MM/YY format");
      return;
    }

    const cardPayload = {
      id: Date.now(),
      type: "card",
      userEmail: currentUser?.email,
      cardHolder: paymentInput.cardHolder.trim(),
      cardNumber: paymentInput.cardNumber,
      expiry: paymentInput.expiry,
      last4: paymentInput.cardNumber.slice(-4),
    };

    const updated = [...savedPayments, cardPayload];
    setSavedPayments(updated);

    const allPayments = JSON.parse(localStorage.getItem("electromart_payments") || "[]")
      .filter((item) => item.userEmail !== currentUser?.email);

    localStorage.setItem(
      "electromart_payments",
      JSON.stringify([...allPayments, ...updated])
    );

    setMessage("Card saved successfully");
    setPaymentInput((prev) => ({
      ...prev,
      cardNumber: "",
      expiry: "",
    }));
  };

  const handleSaveUpi = () => {
    clearAlerts();

    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(paymentInput.upiId.trim())) {
      setError("Enter a valid UPI ID");
      return;
    }

    const upiPayload = {
      id: Date.now(),
      type: "upi",
      userEmail: currentUser?.email,
      upiId: paymentInput.upiId.trim(),
    };

    const updated = [...savedPayments, upiPayload];
    setSavedPayments(updated);

    const allPayments = JSON.parse(localStorage.getItem("electromart_payments") || "[]")
      .filter((item) => item.userEmail !== currentUser?.email);

    localStorage.setItem(
      "electromart_payments",
      JSON.stringify([...allPayments, ...updated])
    );

    setMessage("UPI added successfully");
    setPaymentInput((prev) => ({
      ...prev,
      upiId: "",
    }));
  };

  const handleDeletePayment = (id) => {
    clearAlerts();
    const updated = savedPayments.filter((item) => item.id !== id);
    setSavedPayments(updated);

    const allPayments = JSON.parse(localStorage.getItem("electromart_payments") || "[]")
      .filter((item) => !(item.userEmail === currentUser?.email && item.id === id));

    localStorage.setItem("electromart_payments", JSON.stringify(allPayments));
    setMessage("Payment method removed successfully");
  };

  const handlePrimeToggle = () => {
    const nextValue = !isPrimeEnabled;
    setIsPrimeEnabled(nextValue);
    localStorage.setItem("electromart_prime", JSON.stringify(nextValue));
    setMessage(nextValue ? "Membership activated" : "Membership disabled");
  };

  const accountCards = [
    {
      key: "security",
      title: "Login & Security",
      text: "Edit your name, email, mobile and password.",
      icon: "🔒",
      panel: "security",
    },
    {
      key: "addresses",
      title: "Your Addresses",
      text: "Add and manage addresses for orders.",
      icon: "📍",
      panel: "addresses",
    },
    {
      key: "payments",
      title: "Payment Options",
      text: "Save cards and UPI methods securely in demo mode.",
      icon: "💳",
      panel: "payments",
    },
    {
      key: "membership",
      title: "Membership",
      text: "View benefits and manage premium access.",
      icon: "⭐",
      panel: "membership",
    },
    {
      key: "support",
      title: "Contact Us",
      text: "Reach support through phone, email or live help info.",
      icon: "🎧",
      panel: "support",
    },
    {
      key: "logout",
      title: "Logout",
      text: "Sign out of your account safely from here.",
      icon: "🚪",
      panel: "logout",
    },
  ];

  return (
    <section className="page-section account-page">
      <div className="account-header">
        <div>
          <p className="account-eyebrow">Your Account</p>
          <h2>Manage your profile, payments and settings</h2>
          <p className="light-text">
            Welcome back, {currentUser?.name || "Customer"}.
          </p>
        </div>

        <div className="account-summary-badges">
          <div className="summary-mini-card">
            <span>Orders</span>
            <strong>{totalOrders}</strong>
          </div>
          <div className="summary-mini-card">
            <span>Addresses</span>
            <strong>{savedAddresses.length}</strong>
          </div>
          <div className="summary-mini-card">
            <span>Payments</span>
            <strong>{savedPayments.length}</strong>
          </div>
        </div>
      </div>

      {message && <p className="auth-success account-alert">{message}</p>}
      {error && <p className="auth-error account-alert">{error}</p>}

      <div className="account-dashboard-grid">
        {accountCards.map((card) => (
          <div className="account-dashboard-card" key={card.key}>
            <div className="account-card-icon">{card.icon}</div>

            <div className="account-card-content">
              <h3>{card.title}</h3>
              <p>{card.text}</p>

              <button
                type="button"
                className={`account-card-link ${card.key === "logout" ? "danger-link" : ""}`}
                onClick={() => setActivePanel(card.panel)}
              >
                {card.key === "logout" ? "Open Logout" : "Manage"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="account-panels-wrap">
        <div className="account-panel-tabs">
          <button
            type="button"
            className={activePanel === "overview" ? "active-tab" : ""}
            onClick={() => setActivePanel("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={activePanel === "security" ? "active-tab" : ""}
            onClick={() => setActivePanel("security")}
          >
            Login & Security
          </button>
          <button
            type="button"
            className={activePanel === "addresses" ? "active-tab" : ""}
            onClick={() => setActivePanel("addresses")}
          >
            Addresses
          </button>
          <button
            type="button"
            className={activePanel === "payments" ? "active-tab" : ""}
            onClick={() => setActivePanel("payments")}
          >
            Payments
          </button>
          <button
            type="button"
            className={activePanel === "membership" ? "active-tab" : ""}
            onClick={() => setActivePanel("membership")}
          >
            Membership
          </button>
          <button
            type="button"
            className={activePanel === "support" ? "active-tab" : ""}
            onClick={() => setActivePanel("support")}
          >
            Support
          </button>
          <button
            type="button"
            className={activePanel === "logout" ? "active-tab" : ""}
            onClick={() => setActivePanel("logout")}
          >
            Logout
          </button>
        </div>

        {activePanel === "overview" && (
          <div className="account-panel-card">
            <h3>Account Overview</h3>
            <div className="account-overview-grid">
              <div className="account-overview-box">
                <span>Full Name</span>
                <strong>{currentUser?.name || "Not set"}</strong>
              </div>
              <div className="account-overview-box">
                <span>Email</span>
                <strong>{currentUser?.email || "Not set"}</strong>
              </div>
              <div className="account-overview-box">
                <span>Mobile</span>
                <strong>{currentUser?.mobile || "Not added"}</strong>
              </div>
              <div className="account-overview-box">
                <span>Membership</span>
                <strong>{isPrimeEnabled ? "Premium Active" : "Standard"}</strong>
              </div>
            </div>

            <div className="profile-quick-links">
              <Link to="/orders" className="account-card-link">
                View Orders
              </Link>
              <Link to="/wishlist" className="account-card-link">
                View Wishlist
              </Link>
            </div>
          </div>
        )}

        {activePanel === "security" && (
          <div className="account-panel-grid">
            <div className="account-panel-card">
              <h3>Login & Security</h3>
              <form className="auth-form" onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-control"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    name="email"
                    className="input-control"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile number</label>
                  <input
                    type="text"
                    name="mobile"
                    className="input-control"
                    value={profileData.mobile}
                    onChange={(e) =>
                      handleProfileChange({
                        target: {
                          name: "mobile",
                          value: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                        },
                      })
                    }
                  />
                </div>

                <button type="submit" className="primary-btn auth-btn">
                  Save Account Details
                </button>
              </form>
            </div>

            <div className="account-panel-card">
              <h3>Change Password</h3>
              <form className="auth-form" onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="input-control"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>New password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="input-control"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm new password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input-control"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <button type="submit" className="outline-btn auth-btn">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {activePanel === "addresses" && (
          <div className="account-panel-grid">
            <div className="account-panel-card">
              <h3>Add Address</h3>
              <form className="auth-form" onSubmit={handleAddAddress}>
                <div className="form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="input-control"
                    value={newAddress.fullName}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="input-control"
                    value={newAddress.phone}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>Address line</label>
                  <input
                    type="text"
                    name="line1"
                    className="input-control"
                    value={newAddress.line1}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="input-control"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    className="input-control"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>ZIP code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="input-control"
                    value={newAddress.zipCode}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    className="input-control"
                    value={newAddress.country}
                    onChange={handleAddressChange}
                  />
                </div>

                <button type="submit" className="primary-btn auth-btn">
                  Save Address
                </button>
              </form>
            </div>

            <div className="account-panel-card">
              <h3>Saved Addresses</h3>

              {savedAddresses.length === 0 ? (
                <p className="light-text">No addresses saved yet.</p>
              ) : (
                <div className="saved-list-stack">
                  {savedAddresses.map((address) => (
                    <div className="saved-item-card" key={address.id}>
                      <div>
                        <strong>{address.fullName}</strong>
                        <p>
                          {address.line1}, {address.city}, {address.state}
                        </p>
                        <p>
                          {address.zipCode}, {address.country}
                        </p>
                        <p>{address.phone}</p>
                      </div>

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activePanel === "payments" && (
          <div className="account-panel-grid">
            <div className="account-panel-card">
              <h3>Add Payment Method</h3>

              <form className="auth-form" onSubmit={handleSaveCard}>
                <div className="form-group">
                  <label>Card holder</label>
                  <input
                    type="text"
                    name="cardHolder"
                    className="input-control"
                    value={paymentInput.cardHolder}
                    onChange={handlePaymentChange}
                  />
                </div>

                <div className="form-group">
                  <label>Card number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    className="input-control"
                    placeholder="1234123412341234"
                    value={paymentInput.cardNumber}
                    onChange={handlePaymentChange}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry</label>
                  <input
                    type="text"
                    name="expiry"
                    className="input-control"
                    placeholder="MM/YY"
                    value={paymentInput.expiry}
                    onChange={handlePaymentChange}
                  />
                </div>

                <button type="submit" className="primary-btn auth-btn">
                  Save Card
                </button>
              </form>

              <div className="upi-box">
                <h4>Add UPI</h4>
                <div className="inline-action-box">
                  <input
                    type="text"
                    name="upiId"
                    className="input-control"
                    placeholder="yourname@upi"
                    value={paymentInput.upiId}
                    onChange={handlePaymentChange}
                  />
                  <button type="button" className="outline-btn" onClick={handleSaveUpi}>
                    Save UPI
                  </button>
                </div>
              </div>
            </div>

            <div className="account-panel-card">
              <h3>Saved Payment Methods</h3>

              {savedPayments.length === 0 ? (
                <p className="light-text">No payment methods saved yet.</p>
              ) : (
                <div className="saved-list-stack">
                  {savedPayments.map((item) => (
                    <div className="saved-item-card" key={item.id}>
                      <div>
                        {item.type === "card" ? (
                          <>
                            <strong>Card ending in {item.last4}</strong>
                            <p>{item.cardHolder}</p>
                            <p>Expiry: {item.expiry}</p>
                          </>
                        ) : (
                          <>
                            <strong>UPI ID</strong>
                            <p>{item.upiId}</p>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleDeletePayment(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activePanel === "membership" && (
          <div className="account-panel-card membership-card">
            <div>
              <p className="account-eyebrow">Premium Membership</p>
              <h3>{isPrimeEnabled ? "Membership is Active" : "Upgrade Your Account"}</h3>
              <p className="light-text">
                Get priority deals, early offers, and faster order support in this demo membership section.
              </p>
            </div>

            <button type="button" className="primary-btn" onClick={handlePrimeToggle}>
              {isPrimeEnabled ? "Disable Membership" : "Activate Membership"}
            </button>
          </div>
        )}

        {activePanel === "support" && (
          <div className="account-panel-grid">
            <div className="account-panel-card">
              <h3>Contact Support</h3>
              <div className="support-list">
                <div className="support-item">
                  <span>Call Support</span>
                  <strong>1800-123-4567</strong>
                </div>
                <div className="support-item">
                  <span>Email</span>
                  <strong>support@electromart.com</strong>
                </div>
                <div className="support-item">
                  <span>Live Chat</span>
                  <strong>Available 9 AM – 9 PM</strong>
                </div>
              </div>
            </div>

            <div className="account-panel-card">
              <h3>Quick Links</h3>
              <div className="support-links">
                <Link to="/orders" className="account-card-link">
                  Open Orders
                </Link>
                <Link to="/wishlist" className="account-card-link">
                  Open Wishlist
                </Link>
                <Link to="/cart" className="account-card-link">
                  Open Cart
                </Link>
              </div>
            </div>
          </div>
        )}

        {activePanel === "logout" && (
          <div className="account-panel-card logout-panel">
            <h3>Logout</h3>
            <p className="light-text">
              You can safely sign out from here. Your saved local data will remain available for the next login in demo mode.
            </p>

            <button type="button" className="remove-btn logout-btn" onClick={onLogout}>
              Logout Now
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Profile;
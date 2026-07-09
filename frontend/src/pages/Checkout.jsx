import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

function Checkout({ cartItems, subtotal, shipping, tax, totalPrice, onPlaceOrder }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [errors, setErrors] = useState({});

  const isCartEmpty = useMemo(() => cartItems.length === 0, [cartItems]);

  if (isCartEmpty) {
    return <Navigate to="/cart" replace />;
  }

  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;

  const validateForm = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z ]{3,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[0-9]{10}$/;
    const cityStateCountryRegex = /^[A-Za-z ]{2,40}$/;
    const zipRegex = /^[A-Za-z0-9 -]{4,10}$/;

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedCity = formData.city.trim();
    const trimmedState = formData.state.trim();
    const trimmedZip = formData.zipCode.trim();
    const trimmedCountry = formData.country.trim();

    if (!trimmedName) {
      newErrors.fullName = "Full name is required";
    } else if (!nameRegex.test(trimmedName)) {
      newErrors.fullName = "Name must be at least 3 letters and contain only alphabets";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(trimmedPhone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!trimmedAddress) {
      newErrors.address = "Address is required";
    } else if (trimmedAddress.length < 8) {
      newErrors.address = "Address must be at least 8 characters long";
    } else if (!/[A-Za-z]/.test(trimmedAddress) || !/[0-9]/.test(trimmedAddress)) {
      newErrors.address = "Address must include both letters and numbers";
    }

    if (!trimmedCity) {
      newErrors.city = "City is required";
    } else if (!cityStateCountryRegex.test(trimmedCity)) {
      newErrors.city = "City should contain only letters";
    }

    if (!trimmedState) {
      newErrors.state = "State is required";
    } else if (!cityStateCountryRegex.test(trimmedState)) {
      newErrors.state = "State should contain only letters";
    }

    if (!trimmedZip) {
      newErrors.zipCode = "ZIP / Postal code is required";
    } else if (!zipRegex.test(trimmedZip)) {
      newErrors.zipCode = "Enter a valid ZIP / Postal code";
    }

    if (!trimmedCountry) {
      newErrors.country = "Country is required";
    } else if (!cityStateCountryRegex.test(trimmedCountry)) {
      newErrors.country = "Country should contain only letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "fullName" || name === "city" || name === "state" || name === "country") {
      updatedValue = value.replace(/[^A-Za-z ]/g, "");
    }

    if (name === "phone") {
      updatedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    if (name === "zipCode") {
      updatedValue = value.replace(/[^A-Za-z0-9 -]/g, "").slice(0, 10);
    }

    if (name === "address") {
      updatedValue = value.replace(/\s{2,}/g, " ").slice(0, 120);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onPlaceOrder(formData, paymentMethod);
  };

  return (
    <section className="page-section">
      <div className="section-head">
        <h2>Checkout</h2>
        <p>Enter billing details carefully to complete your order.</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form">
          <form className="form-card" onSubmit={handleSubmit}>
            <h3>Billing Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="input-control"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <p className="form-error">{errors.fullName}</p>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="input-control"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="input-control"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={10}
                />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label>ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  className="input-control"
                  placeholder="110001"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
                {errors.zipCode && <p className="form-error">{errors.zipCode}</p>}
              </div>

              <div className="form-group form-group-full">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  className="input-control"
                  placeholder="221B Baker Street"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="form-error">{errors.address}</p>}
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  className="input-control"
                  placeholder="Delhi"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && <p className="form-error">{errors.city}</p>}
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  className="input-control"
                  placeholder="Delhi"
                  value={formData.state}
                  onChange={handleChange}
                />
                {errors.state && <p className="form-error">{errors.state}</p>}
              </div>

              <div className="form-group form-group-full">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  className="input-control"
                  placeholder="India"
                  value={formData.country}
                  onChange={handleChange}
                />
                {errors.country && <p className="form-error">{errors.country}</p>}
              </div>
            </div>

            <div className="checkout-actions">
              <div className="form-group form-group-full">
                <label>Payment Method</label>
                <select
                  className="input-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Cash on Delivery</option>
                  <option>UPI</option>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                </select>
              </div>

              <button type="submit" className="confirm-btn full-width">
                Place Order
              </button>
            </div>
          </form>
        </div>

        <div className="checkout-summary">
          <div className="form-card">
            <h3>Order Review</h3>

            <div className="checkout-list">
              {cartItems.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div>
                    <h4>{item.name}</h4>
                    <p className="light-text">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>

            <div className="summary-row">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="summary-row summary-total">
              <span>Total Payable</span>
              <span className="highlight-price">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
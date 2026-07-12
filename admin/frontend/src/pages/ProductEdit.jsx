import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "https://electro-mart-qalg.vercel.app";

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = location.pathname.endsWith("/new");

    const [loading, setLoading] = useState(!isNew);
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        image: "",
        segment: "",
        stock: 0,
        description: "",
    });

    useEffect(() => {
        if (!isNew) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API}/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    price: data.price,
                    image: data.image,
                    segment: data.segment,
                    stock: data.stock,
                    description: data.description,
                });
            } else {
                alert("Product not found");
                navigate("/admin/products");
            }
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "price" || name === "stock" ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isNew ? `${API}/api/products` : `${API}/api/products/${id}`;
            const method = isNew ? "POST" : "PUT";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert(isNew ? "Product created successfully!" : "Product updated successfully!");
                navigate("/admin/products");
            } else {
                alert("Failed to save product");
            }
        } catch (error) {
            console.error("Error saving product", error);
            alert("Error saving product");
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>{isNew ? "Create Product" : "Edit Product"}</h1>
                <button onClick={() => navigate("/admin/products")} className="btn btn-outline">
                    ← Back to Products
                </button>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Price (₹)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Image URL</label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} required className="form-control" placeholder="https://..." />
                        {formData.image && (
                            <div style={{ marginTop: "10px" }}>
                                <img src={formData.image} alt="Preview" style={{ height: "100px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--border)" }} />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Segment / Category</label>
                        <input type="text" name="segment" value={formData.segment} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Stock Quantity</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required className="form-control" rows="4" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: "1rem", marginTop: "8px" }}>
                        {isNew ? "Create Product" : "Update Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductEdit;

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // If the path ends with "new", we are creating. Otherwise we are editing.
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
        if (!isNew) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`);
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
            const url = isNew 
                ? "http://localhost:5000/api/products" 
                : `http://localhost:5000/api/products/${id}`;
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

    if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>{isNew ? "Create Product" : "Edit Product"}</h1>
                <Link to="/admin/products" className="outline-btn">Back to Products</Link>
            </div>
            
            <form onSubmit={handleSubmit} style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
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
                            <img src={formData.image} alt="Preview" style={{ height: "100px", objectFit: "contain", borderRadius: "4px" }} />
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

                <button type="submit" className="primary-btn" style={{ padding: "12px", marginTop: "10px", fontSize: "1rem" }}>
                    {isNew ? "Create Product" : "Update Product"}
                </button>
            </form>

            <style>{`
                .form-group { display: flex; flexDirection: column; }
                .form-control { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                label { font-weight: bold; margin-bottom: 5px; display: block; }
                .primary-btn { background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .primary-btn:hover { background: #0056b3; }
            `}</style>
        </div>
    );
};

export default ProductEdit;

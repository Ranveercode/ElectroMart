import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setProducts(products.filter(product => product._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    if (loading) return <div style={{ padding: "40px" }}>Loading products...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Manage Products</h1>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => navigate("/admin/products/new")} className="primary-btn">Create Product</button>
                    <Link to="/admin" className="outline-btn">Back to Dashboard</Link>
                </div>
            </div>
            
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                        <th style={{ padding: "10px" }}>ID</th>
                        <th style={{ padding: "10px" }}>Name</th>
                        <th style={{ padding: "10px" }}>Price</th>
                        <th style={{ padding: "10px" }}>Segment</th>
                        <th style={{ padding: "10px" }}>Stock</th>
                        <th style={{ padding: "10px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={{ padding: "10px" }}>{product._id.slice(-6)}</td>
                            <td style={{ padding: "10px" }}>{product.name}</td>
                            <td style={{ padding: "10px" }}>₹{product.price}</td>
                            <td style={{ padding: "10px" }}>{product.segment}</td>
                            <td style={{ padding: "10px" }}>{product.stock}</td>
                            <td style={{ padding: "10px", display: "flex", gap: "10px" }}>
                                <button 
                                    onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                                    className="edit-btn"
                                    style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(product._id)}
                                    className="danger-btn"
                                    style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>{`
                .primary-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
                .edit-btn { background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .edit-btn:hover { background: #e68a00; }
                .danger-btn { background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .danger-btn:hover { background: #d32f2f; }
            `}</style>
        </div>
    );
};

export default ProductList;

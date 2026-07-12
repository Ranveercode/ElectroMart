import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://electro-mart-qalg.vercel.app";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API}/api/products`);
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
            const res = await fetch(`${API}/api/products/${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) setProducts(products.filter(product => product._id !== id));
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Manage Products</h1>
                <button onClick={() => navigate("/admin/products/new")} className="btn btn-primary">
                    + Create Product
                </button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Segment</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id}>
                            <td>{product._id.slice(-6)}</td>
                            <td>{product.name}</td>
                            <td>₹{product.price}</td>
                            <td>{product.segment}</td>
                            <td>{product.stock}</td>
                            <td>
                                <div className="btn-group">
                                    <button onClick={() => navigate(`/admin/products/${product._id}/edit`)} className="btn btn-warning btn-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-sm">
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'food',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    pickupTime: ''
  });
  
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get('http://localhost:5000/api/listings/all');
      const myItems = res.data.filter(item => item.restaurantId === userId || (item.restaurantId && item.restaurantId._id === userId));
      setMyListings(myItems);
    } catch (err) {
      console.error("Error loading listings", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId'); 
      await axios.post('http://localhost:5000/api/listings/add', {
        ...formData,
        restaurantId: userId 
      });

      alert('Item Added Successfully!');
      setFormData({ 
        title: '', 
        category: 'food', 
        originalPrice: '', 
        discountedPrice: '', 
        quantity: '', 
        pickupTime: '' 
      });
      fetchMyListings(); 
    } catch (err) {
      alert('Error adding item: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/listings/delete/${id}`);
      fetchMyListings(); 
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleRemoveStock = async (item) => {
    const countStr = prompt(`Current stock is ${item.quantity}. How many to remove?`);
    if (!countStr) return; 
    const count = parseInt(countStr);
    if (isNaN(count) || count <= 0) return alert("Invalid number");

    try {
      await axios.put(`http://localhost:5000/api/listings/decrease/${item._id}`, { count });
      alert(`Removed ${count} from stock.`);
      fetchMyListings();
    } catch (err) {
      alert("Error updating stock: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Seller Dashboard 🏪</h1>
        <div>
          <button 
            onClick={() => navigate('/restaurant-orders')} 
            style={{ marginRight: '10px', backgroundColor: 'orange', color: 'black' }}
          >
            Incoming Orders
          </button>
          <button 
            onClick={() => navigate('/analytics')} 
            style={{ marginRight: '10px', backgroundColor: '#9c27b0', color: 'white' }}
          >
            Stats & Reviews
          </button>
          <button onClick={handleLogout} style={{ backgroundColor: '#333' }}>Logout</button>
        </div>
      </div>
      
      {/* Add Item Form */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0 }}>Add New Item</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '100%', boxShadow: 'none', padding: 0 }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="title" placeholder="Item Name (e.g. Headphones)" value={formData.title} onChange={handleChange} required style={{ flex: 2 }} />
            <select name="category" value={formData.category} onChange={handleChange} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <option value="food">Food 🍔</option>
                <option value="electronics">Electronics 📱</option>
                <option value="clothing">Clothing 👕</option>
                <option value="other">Other 📦</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="originalPrice" type="number" placeholder="Original Price" value={formData.originalPrice} onChange={handleChange} required style={{ width: '50%' }} />
            <input name="discountedPrice" type="number" placeholder="Discount Price" value={formData.discountedPrice} onChange={handleChange} required style={{ width: '50%' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required style={{ width: '50%' }} />
            <input name="pickupTime" placeholder="Pickup Details (e.g. Counter 4)" value={formData.pickupTime} onChange={handleChange} required style={{ width: '50%' }} />
          </div>
          <button type="submit" style={{ padding: '12px', backgroundColor: 'green', color: 'white' }}>Post Listing</button>
        </form>
      </div>

      {/* --- Active Listings --- */}
      <h3>My Active Listings</h3>
      {myListings.length === 0 ? (
        <p>No active items.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {myListings.map(item => (
            <div key={item._id} style={{ 
              border: '1px solid #ddd', 
              padding: '20px', 
              borderRadius: '8px', 
              backgroundColor: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <strong style={{ fontSize: '1.2em' }}>{item.title}</strong>
                <span style={{ marginLeft: '10px', fontSize: '0.8em', backgroundColor: '#e0f2f1', padding: '2px 8px', borderRadius: '4px', color: '#00695c' }}>
                    {item.category?.toUpperCase() || 'FOOD'}
                </span>

                {/* --- CHANGED DOLLAR TO RUPEE HERE --- */}
                <div style={{ fontSize: '0.9em', color: 'gray', marginTop: '5px' }}>
                   Stock: <span style={{ color: 'black', fontWeight: 'bold' }}>{item.quantity}</span> • ₹{item.discountedPrice}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleRemoveStock(item)}
                  style={{ backgroundColor: '#ff9800', color: 'black', padding: '8px 12px', fontSize: '0.85em' }}
                >
                  - Qty
                </button>
                <button 
                  onClick={() => handleDelete(item._id)}
                  style={{ backgroundColor: '#ff4444', color: 'white', padding: '8px 12px', fontSize: '0.85em' }}
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '', category: 'food', originalPrice: '', discountedPrice: '', quantity: '', pickupTime: ''
  });
  
  const [myListings, setMyListings] = useState([]);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchMyListings();
    // Get role to customize dashboard title
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const fetchMyListings = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await axios.get('http://localhost:5000/api/listings/all');
      // Filter items that belong to THIS logged-in user
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
      setFormData({ title: '', category: 'food', originalPrice: '', discountedPrice: '', quantity: '', pickupTime: '' });
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
    } catch (err) { alert("Error deleting item"); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        {/* Dynamic Title based on Role */}
        <h1>{userRole === 'vendor' ? "Vendor Dashboard 🍢" : "Restaurant Dashboard 🏪"}</h1>
        <div>
          <button onClick={() => navigate('/restaurant-orders')} style={{ marginRight: '10px', backgroundColor: 'orange', color: 'black' }}>Incoming Orders</button>
          <button onClick={() => navigate('/analytics')} style={{ marginRight: '10px', backgroundColor: '#9c27b0', color: 'white' }}>Stats</button>
          <button onClick={handleLogout} style={{ backgroundColor: '#333' }}>Logout</button>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0 }}>Add New Item</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="title" placeholder="Item Name (e.g. Pani Puri)" value={formData.title} onChange={handleChange} required style={{ flex: 2 }} />
            <select name="category" value={formData.category} onChange={handleChange} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <option value="food">Food</option>
                {/* Vendors can select Food, our Home page logic forces them to Street Food slide anyway */}
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="originalPrice" type="number" placeholder="Original Price" value={formData.originalPrice} onChange={handleChange} required style={{ width: '50%' }} />
            <input name="discountedPrice" type="number" placeholder="Discount Price" value={formData.discountedPrice} onChange={handleChange} required style={{ width: '50%' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleChange} required style={{ width: '50%' }} />
            <input name="pickupTime" placeholder="Pickup Details (e.g. Stall 5)" value={formData.pickupTime} onChange={handleChange} required style={{ width: '50%' }} />
          </div>
          <button type="submit" style={{ padding: '12px', backgroundColor: 'green', color: 'white' }}>Post Listing</button>
        </form>
      </div>

      <h3>My Active Listings</h3>
      {myListings.length === 0 ? <p>No active items.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {myListings.map(item => (
            <div key={item._id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1.2em' }}>{item.title}</strong>
                <span style={{ marginLeft: '10px', fontSize: '0.8em', backgroundColor: '#e0f2f1', padding: '2px 8px', borderRadius: '4px', color: '#00695c' }}>{item.category.toUpperCase()}</span>
                <div style={{ fontSize: '0.9em', color: 'gray', marginTop: '5px' }}>Stock: <strong>{item.quantity}</strong> • ₹{item.discountedPrice}</div>
              </div>
              <button onClick={() => handleDelete(item._id)} style={{ backgroundColor: '#ff4444', color: 'white', padding: '8px 12px' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) {
        alert("Please login to view orders.");
        setLoading(false);
        return;
    }

    try {
      // 1. Fetch orders from backend
      const res = await axios.get(`http://localhost:5000/api/orders/student/${studentId}`);
      // 2. Reverse array to show Newest First
      setOrders(res.data.reverse());
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Order History 🧾</h1>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'gray', marginTop: '50px' }}>
            <h3>No orders yet. 🤷‍♂️</h3>
            <p>Go to the Home page and grab some food!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.map(order => (
                <div key={order._id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        {/* Show Saved Title OR Fallback to Listing Title OR "Unknown" */}
                        <h3 style={{ margin: 0 }}>
                            {order.itemTitle || order.listingId?.title || "Unknown Item"}
                        </h3>
                        
                        <span style={{ 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.85em',
                            fontWeight: 'bold',
                            backgroundColor: order.status === 'picked up' ? '#c8e6c9' : '#fff9c4',
                            color: order.status === 'picked up' ? 'green' : '#f9a825'
                        }}>
                            {order.status.toUpperCase()}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                        <span>💰 Paid: <strong>₹{order.totalPrice}</strong></span>
                        <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p style={{ color: '#999', fontSize: '0.8em', marginTop: '10px' }}>Order ID: {order._id}</p>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
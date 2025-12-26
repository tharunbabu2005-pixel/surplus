import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RestaurantOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const restaurantId = localStorage.getItem('userId');
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/restaurant/${restaurantId}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error loading orders", err);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
        await axios.put('http://localhost:5000/api/orders/update-status', { orderId, status: newStatus });
        fetchOrders(); // Refresh list
    } catch (err) {
        alert("Error updating status");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Incoming Orders 📦</h1>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.map(order => (
                <div key={order._id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div>
                        <h3>{order.itemTitle || order.listingId?.title || "Deleted Item"}</h3>
                        <p>Customer: {order.studentId?.name || "Unknown Student"}</p>
                        {/* CHANGED HERE */}
                        <p style={{ fontWeight: 'bold', color: 'green' }}>Earnings: ₹{order.totalPrice}</p>
                        <p style={{ fontSize: '0.8em', color: 'gray' }}>Status: {order.status}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {order.status !== 'picked up' && (
                            <button onClick={() => updateStatus(order._id, 'picked up')} style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px' }}>
                                Mark as Picked Up
                            </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'picked up' && (
                            <button onClick={() => updateStatus(order._id, 'cancelled')} style={{ backgroundColor: '#f44336', color: 'white', padding: '8px' }}>
                                Cancel Order
                            </button>
                        )}
                    </div>

                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantOrders;
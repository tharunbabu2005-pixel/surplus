import React, { useEffect, useState } from 'react';
import axios from 'axios';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  
  // Review State
  const [reviewOpen, setReviewOpen] = useState(null); // Stores the order ID being reviewed
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const studentId = localStorage.getItem('userId');
    if (!studentId) return;
    const res = await axios.get(`http://localhost:5000/api/orders/student/${studentId}`);
    setOrders(res.data.reverse());
  };

  const submitReview = async (restaurantId) => {
    const studentId = localStorage.getItem('userId');
    try {
        await axios.post('http://localhost:5000/api/reviews/add', {
            studentId,
            restaurantId,
            rating: reviewData.rating,
            comment: reviewData.comment
        });
        alert("Review Submitted! ⭐");
        setReviewOpen(null); // Close box
    } catch (err) {
        alert("Error submitting review");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Orders 🧾</h1>
      {orders.map(order => (
        <div key={order._id} style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '15px', borderRadius: '8px' }}>
            <h3>{order.itemTitle}</h3>
            <p>Status: <strong>{order.status}</strong></p>
            
            {/* REVIEW BUTTON - Only show if order is "picked up" */}
            {order.status === 'picked up' && (
                <button 
                    onClick={() => setReviewOpen(order._id)}
                    style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                    Write a Review ✍️
                </button>
            )}

            {/* REVIEW FORM (Shows only when button is clicked) */}
            {reviewOpen === order._id && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9' }}>
                    <label>Rating: </label>
                    <select 
                        value={reviewData.rating} 
                        onChange={(e) => setReviewData({...reviewData, rating: e.target.value})}
                    >
                        <option value="5">5 ⭐</option>
                        <option value="4">4 ⭐</option>
                        <option value="3">3 ⭐</option>
                        <option value="2">2 ⭐</option>
                        <option value="1">1 ⭐</option>
                    </select>
                    <br />
                    <input 
                        placeholder="Write a comment..." 
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                        style={{ width: '80%', padding: '5px', marginTop: '5px' }}
                    />
                    <button onClick={() => submitReview(order.restaurantId._id)} style={{ marginLeft: '10px', background: 'green', color: 'white' }}>Submit</button>
                    <button onClick={() => setReviewOpen(null)} style={{ marginLeft: '5px' }}>Cancel</button>
                </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
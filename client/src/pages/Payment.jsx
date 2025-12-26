import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item; 
  const customPickup = location.state?.customPickup; // Capture the time passed from Home

  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);

  if (!item) return <div style={{padding:'20px'}}>Error: No item selected.</div>;

  const handleChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const studentId = localStorage.getItem('userId');

    try {
        await axios.post('http://localhost:5000/api/orders/place', {
          studentId: studentId,
          listingId: item._id,
          restaurantId: item.restaurantId,
          price: item.discountedPrice,
          itemTitle: item.title,
          // SEND THE TIME HERE
          pickupTime: customPickup || item.pickupTime 
        });

        setTimeout(() => {
            alert("Payment Successful! Order Placed. ✅");
            navigate('/home');
        }, 1500);

    } catch (err) {
        alert("Transaction Failed: " + (err.response?.data?.error || err.message));
        setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Secure Checkout 🔒</h1>
      
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', backgroundColor: '#fff', marginBottom: '30px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{item.title}</h3>
        <p style={{ fontSize: '2rem', color: 'green', fontWeight: 'bold', margin: '10px 0' }}>₹{item.discountedPrice}</p>
        
        {/* Display the time the user chose */}
        <p style={{ color: '#555', fontSize: '1.1rem' }}>
           📍 Pickup: {customPickup ? <strong style={{color:'blue'}}>Arriving at {customPickup}</strong> : item.pickupTime}
        </p>
      </div>

      <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>Card Number</label>
        <input name="number" placeholder="0000 0000 0000 0000" maxLength="16" onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold' }}>Expiry Date</label>
                <input name="expiry" placeholder="MM/YY" maxLength="5" onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold' }}>CVV</label>
                <input name="cvv" type="password" placeholder="123" maxLength="3" onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: '20px', width: '100%', padding: '15px', backgroundColor: loading ? 'gray' : '#2e7d32', color: 'white', fontSize: '1.2rem', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? "Processing..." : `Pay ₹${item.discountedPrice}`} 
        </button>
      </form>
    </div>
  );
}

export default Payment;
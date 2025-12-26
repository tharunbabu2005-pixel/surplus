import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resItems = await axios.get('http://localhost:5000/api/listings/all');
        setListings(resItems.data);
        setFilteredListings(resItems.data);

        if (studentId) {
          const resFavs = await axios.get(`http://localhost:5000/api/favorites/${studentId}`);
          const favIds = resFavs.data.map(f => f.listingId._id);
          setFavorites(favIds);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [studentId]);

  useEffect(() => {
    let result = listings;
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchTerm) {
      result = result.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredListings(result);
  }, [searchTerm, selectedCategory, listings]);

  const handleBuy = (item) => {
    if (!studentId) return alert("Please login to buy!");
    navigate('/payment', { state: { item } });
  };

  const handleToggleFavorite = async (item) => {
    if (!studentId) return alert("Please login to like items!");
    try {
      const res = await axios.post('http://localhost:5000/api/favorites/toggle', {
        studentId,
        listingId: item._id
      });
      if (res.data.status === 'added') {
        setFavorites([...favorites, item._id]);
      } else {
        setFavorites(favorites.filter(id => id !== item._id));
      }
    } catch (err) {
      console.error("Error toggling favorite", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Food and Essentials Hub 🛒</h1>
        <div>
           <button onClick={() => navigate('/my-favorites')} style={{ marginRight: '10px', backgroundColor: '#e91e63' }}>Favorites ❤️</button>
           <button onClick={() => navigate('/my-orders')} style={{ marginRight: '10px', backgroundColor: 'orange' }}>Orders</button>
           <button onClick={handleLogout} style={{ backgroundColor: '#333' }}>Logout</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input 
          type="text" 
          placeholder="Search for items..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '500px', padding: '15px', borderRadius: '30px', border: '1px solid #ddd', fontSize: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
        {['all', 'food', 'electronics', 'clothing', 'other'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{ 
              backgroundColor: selectedCategory === cat ? '#2e7d32' : 'white', 
              color: selectedCategory === cat ? 'white' : '#333', 
              border: '1px solid #ddd',
              borderRadius: '20px',
              padding: '10px 20px',
              textTransform: 'capitalize',
              fontWeight: 'bold',
              boxShadow: selectedCategory === cat ? '0 4px 6px rgba(46, 125, 50, 0.3)' : 'none'
            }}
          >
            {cat === 'all' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center' }}>
        {filteredListings.length === 0 ? (
          <p style={{ fontSize: '18px', color: 'gray' }}>No items found.</p>
        ) : (
          filteredListings.map((item) => (
            <div key={item._id} style={{ 
              border: 'none', padding: '20px', borderRadius: '15px', width: '280px', 
              backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
              <button 
                onClick={() => handleToggleFavorite(item)}
                style={{ 
                  position: 'absolute', top: '15px', right: '15px', 
                  backgroundColor: 'transparent', border: 'none', padding: 0, fontSize: '1.5rem',
                  color: favorites.includes(item._id) ? '#e91e63' : '#ccc', 
                  cursor: 'pointer', boxShadow: 'none'
                }}
              >
                {favorites.includes(item._id) ? '❤️' : '🤍'}
              </button>

              <span style={{ 
                position: 'absolute', top: '15px', left: '15px', 
                backgroundColor: '#e0f2f1', color: '#00695c', 
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' 
              }}>
                {item.category ? item.category.toUpperCase() : 'FOOD'}
              </span>

              <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', marginTop: '30px' }}>{item.title}</h3>
              
              {/* --- CHANGED DOLLAR TO RUPEE HERE --- */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '10px 0' }}>
                 <span style={{ textDecoration: 'line-through', color: 'gray' }}>₹{item.originalPrice}</span>
                 <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{item.discountedPrice}</span>
              </div>
              
              <p style={{ color: '#666', fontSize: '0.9rem' }}>📍 Pickup: {item.pickupTime}</p>
              
              <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '-5px' }}>
                 🏠 <strong>Location:</strong> {item.restaurantId?.address || "Address not listed"}
              </p>

              <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>📦 {item.quantity} left</p>
              
              <button onClick={() => handleBuy(item)} style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px' }}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
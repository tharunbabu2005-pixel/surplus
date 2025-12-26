import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Default Category
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

  // --- FILTERING LOGIC (Fixed) ---
  useEffect(() => {
    let result = listings;

    if (selectedCategory === 'street-food') {
      // 1. Show ONLY items where the seller role is 'vendor'
      result = result.filter(item => item.restaurantId?.role === 'vendor');
    } 
    else if (selectedCategory !== 'all') {
      // 2. For normal categories (Food, Electronics), EXCLUDE vendors
      result = result.filter(item => 
        item.category === selectedCategory && item.restaurantId?.role !== 'vendor'
      );
    } 
    else {
      // 3. 'All Items' - Optional: You can choose to hide street food from 'All' if you want.
      // For now, let's keep everything but maybe exclude vendors from main feed if you prefer.
      // result = result.filter(item => item.restaurantId?.role !== 'vendor'); // Uncomment to hide vendors from 'All'
    }

    if (searchTerm) {
      result = result.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredListings(result);
  }, [searchTerm, selectedCategory, listings]);


  // --- CATEGORY CLICK HANDLER WITH WARNING ---
  const handleCategoryClick = (cat) => {
    if (cat === 'street-food') {
        const confirmVisit = window.confirm(
            "⚠️ STREET FOOD SECTION WARNING ⚠️\n\n" +
            "You are entering the Street Food / Vendor section.\n" +
            "These items are from non-certified vendors.\n" +
            "The web platform is not responsible for food quality here.\n\n" +
            "Proceed?"
        );
        if (!confirmVisit) return;
    }
    setSelectedCategory(cat);
  };


  // --- BUY HANDLER WITH TIME SELECTION (Step 3 Implemented) ---
  const handleBuy = (item) => {
    if (!studentId) return alert("Please login to buy!");

    // Check if the seller is a Vendor
    if (item.restaurantId?.role === 'vendor') {
        // 1. Show Warning
        const confirmVendor = window.confirm("⚠️ Confirm Pre-order from Street Vendor?");
        if (!confirmVendor) return;

        // 2. Ask for Time (NEW FEATURE)
        const pickupTime = prompt("🕒 What time will you arrive? (e.g. '10 mins' or '5:30 PM')");
        if (!pickupTime) return; // Stop if they cancel

        // 3. Pass time to Payment Page
        navigate('/payment', { state: { item, customPickup: pickupTime } });
        return;
    }

    navigate('/payment', { state: { item } });
  };

  const handleToggleFavorite = async (item) => {
    if (!studentId) return alert("Please login to like items!");
    try {
      const res = await axios.post('http://localhost:5000/api/favorites/toggle', { studentId, listingId: item._id });
      if (res.data.status === 'added') setFavorites([...favorites, item._id]);
      else setFavorites(favorites.filter(id => id !== item._id));
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

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

      {/* --- CATEGORY BUTTONS --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {[
            { id: 'all', label: 'All Items' },
            { id: 'food', label: 'Restaurant Food' },
            { id: 'street-food', label: 'Street Food 🍢' },
            { id: 'electronics', label: 'Electronics' },
            { id: 'clothing', label: 'Clothing' }
        ].map((cat) => (
          <button 
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            style={{ 
              backgroundColor: selectedCategory === cat.id ? (cat.id === 'street-food' ? '#ff9800' : '#2e7d32') : 'white', 
              color: selectedCategory === cat.id ? 'white' : '#333', 
              border: selectedCategory === cat.id ? 'none' : '1px solid #ddd',
              borderRadius: '20px',
              padding: '10px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: selectedCategory === cat.id ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'center' }}>
        {filteredListings.length === 0 ? (
          <p style={{ fontSize: '18px', color: 'gray' }}>No items found in this category.</p>
        ) : (
          filteredListings.map((item) => (
            <div key={item._id} style={{ 
              border: 'none', padding: '20px', borderRadius: '15px', width: '280px', 
              backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              borderTop: item.restaurantId?.role === 'vendor' ? '5px solid #ff9800' : 'none' 
            }}>
              
              {/* WARNING BADGE FOR VENDORS */}
              {item.restaurantId?.role === 'vendor' && (
                <div style={{ background: '#ffcc00', color: 'black', padding: '5px', fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', borderRadius: '5px' }}>
                    ⚠️ STREET FOOD
                </div>
              )}

              <button onClick={() => handleToggleFavorite(item)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                {favorites.includes(item._id) ? '❤️' : '🤍'}
              </button>

              <span style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: '#e0f2f1', color: '#00695c', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {item.category?.toUpperCase()}
              </span>

              <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', marginTop: '30px' }}>{item.title}</h3>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '10px 0' }}>
                 <span style={{ textDecoration: 'line-through', color: 'gray' }}>₹{item.originalPrice}</span>
                 <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{item.discountedPrice}</span>
              </div>
              
              <p style={{ color: '#666', fontSize: '0.9rem' }}>📍 Pickup: {item.pickupTime}</p>
              <p style={{ color: '#555', fontSize: '0.85rem' }}>🏠 <strong>{item.restaurantId?.address || "No Address"}</strong></p>
              <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>📦 {item.quantity} left</p>
              
              <button 
                onClick={() => handleBuy(item)} 
                style={{ 
                    width: '100%', padding: '12px', 
                    backgroundColor: item.restaurantId?.role === 'vendor' ? '#ff5722' : '#2e7d32', 
                    color: 'white', border: 'none', borderRadius: '8px' 
                }}
              >
                {item.restaurantId?.role === 'vendor' ? "Pre-order (Keep Ready)" : "Add to Cart"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function RestaurantAnalytics() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [topItems, setTopItems] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        const restaurantId = localStorage.getItem('userId');
        try {
            const orderRes = await axios.get(`http://localhost:5000/api/orders/restaurant/${restaurantId}`);
            const orders = orderRes.data;
            
            // 1. Calculate Revenue
            const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
            setTotalRevenue(revenue);

            // 2. Calculate Top Sales
            calculateTopSales(orders);

            // 3. Fetch Reviews
            const reviewRes = await axios.get(`http://localhost:5000/api/reviews/${restaurantId}`);
            setReviews(reviewRes.data);

        } catch (err) {
            console.error("Error loading analytics", err);
        }
    };
    fetchData();
  }, []);

  const calculateTopSales = (orders) => {
    const salesMap = {};
    orders.forEach(order => {
      const title = order.listingId?.title || order.itemTitle || "Deleted Item";
      if (salesMap[title]) {
        salesMap[title] += 1;
      } else {
        salesMap[title] = 1;
      }
    });

    // Convert map to array and sort
    const sortedItems = Object.keys(salesMap)
      .map(key => ({ title: key, count: salesMap[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    setTopItems(sortedItems);
  };

  // Chart Data Preparation
  const chartData = {
    labels: topItems.map(item => item.title),
    datasets: [
      {
        label: 'Units Sold',
        data: topItems.map(item => item.count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Analytics Dashboard 📊</h1>
      
      {/* Revenue Card */}
      <div style={{ backgroundColor: '#4caf50', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
        <h2>Total Revenue</h2>
        {/* CHANGED HERE */}
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>₹{totalRevenue}</p>
      </div>

      {/* Chart Section */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3>🏆 Top Selling Items</h3>
        {topItems.length > 0 ? <Bar data={chartData} /> : <p>No sales data yet.</p>}
      </div>

      {/* Reviews Section */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
        <h3>⭐ Recent Reviews</h3>
        {reviews.length === 0 ? <p>No reviews yet.</p> : (
            <div>
                {reviews.map(review => (
                    <div key={review._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                        <strong style={{ fontSize: '1.2rem', color: '#ff9800' }}>
                            {"★".repeat(review.rating)}
                        </strong>
                        <p style={{ margin: '5px 0' }}>"{review.comment}"</p>
                        <small style={{ color: 'gray' }}>- {review.studentId?.name || "Anonymous"}</small>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}

export default RestaurantAnalytics;
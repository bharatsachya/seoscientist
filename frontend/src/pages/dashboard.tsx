import '../App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const BACKEND_URL = 'https://seoscientist-backend.onrender.com'

const Dashboard = () => {
  const [data, setData] = useState<{ keys: string[]; clicks: number; impressions: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/search-analytics`, { withCredentials: true })
      .then(res => {
        setData(res.data.rows || []);
        setLoading(false);
        setAuth(true);
      })
      .catch(err => {
        if (err.response?.status === 401) setAuth(false);
        else setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth`;
  };

  // Top 10 Queries
  const topQueries = data
    .filter(row => row.keys.length >= 1)
    .slice(0, 10);

  const queryChart = {
    labels: topQueries.map(row => row.keys[0]),
    datasets: [{
      label: 'Clicks',
      data: topQueries.map(row => row.clicks),
      backgroundColor: '#3b82f6',
    }]
  };

  // Device Distribution
  const deviceData = data.reduce((acc: Record<string, number>, row) => {
    const device = row.keys[2]; // query, page, device, country
    acc[device] = (acc[device] || 0) + row.clicks;
    return acc;
  }, {} as Record<string, number>);

  const deviceChart = {
    labels: Object.keys(deviceData),
    datasets: [{
      label: 'Device Distribution',
      data: Object.values(deviceData),
      backgroundColor: ['#4ade80', '#facc15', '#f87171'],
    }]
  };

  return (
    <div className="dashboard-container">
      <h1>Search Console Dashboard</h1>

      {!auth ? (
        <div className="auth-box">
          <p>Please log in to view your Search Console data.</p>
          <button onClick={handleLogin}>Login with Google</button>
        </div>
      ) : loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div className="chart-section">
            <div className="chart-card">
              <h2>Top 10 Queries</h2>
              <Bar data={queryChart} />
            </div>

            <div className="chart-card">
              <h2>Device Breakdown</h2>
              <Pie data={deviceChart} />
            </div>
          </div>

          <h2 style={{ marginTop: '40px' }}>Search Analytics Table</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Page</th>
                  <th>Device</th>
                  <th>Country</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((row, index) => (
                  <tr key={index}>
                    <td>{row.keys[0]}</td>
                    <td>{row.keys[1]}</td>
                    <td>{row.keys[2]}</td>
                    <td>{row.keys[3]}</td>
                    <td>{row.clicks}</td>
                    <td>{row.impressions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

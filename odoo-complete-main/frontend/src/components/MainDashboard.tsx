import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import AdminPanel from './AdminPanel';
import UserDashboard from './UserDashboard';

const MainDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API base URL
  const API_BASE = 'http://localhost:8091/api';

  // Fetch user profile to determine role
  const fetchUserProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const profile = await response.json();
        console.log('User profile:', profile); // DEBUG LOG
        // Check if user has admin role
        const isAdmin = profile.roles && profile.roles.includes('ADMIN');
        setUserRole(isAdmin ? 'ADMIN' : 'USER');
        console.log('Detected userRole:', isAdmin ? 'ADMIN' : 'USER'); // DEBUG LOG
      } else if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        // Redirect to login
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/';
      } else {
        setError('Failed to fetch user profile');
      }
    } catch (error) {
      setError('Error fetching user profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  if (userRole === 'ADMIN') {
    return <AdminPanel />;
  } else {
    return <UserDashboard />;
  }
};

export default MainDashboard; 
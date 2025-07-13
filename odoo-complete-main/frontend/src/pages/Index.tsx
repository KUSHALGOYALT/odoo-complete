import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import MainDashboard from "@/components/MainDashboard";
import SwapPage from "@/components/SwapPage";
import Login from "@/components/Login";

const NotificationsPage = () => (
  <div className="p-4 md:p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Notifications</h1>
    <div className="space-y-4">
      {[
        { type: "swap", message: "Sarah Chen sent you a swap request", time: "2 hours ago" },
        { type: "reminder", message: "Your swap with John Doe is due tomorrow", time: "1 day ago" },
        { type: "match", message: "New skill matcher suggestion available!", time: "2 days ago" },
      ].map((notification, index) => (
        <div key={index} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
          <p className="font-medium text-gray-900">{notification.message}</p>
          <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
        </div>
      ))}
    </div>
  </div>
);

const ChatsPage = () => (
  <div className="p-4 md:p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Chats</h1>
    <div className="space-y-4">
      {[
        { name: "Sarah Chen", message: "Looking forward to our React/Design swap!", time: "2:30 PM", online: true },
        { name: "Marcus Rodriguez", message: "Thanks for the Python tips!", time: "1:15 PM", online: false },
        { name: "Emma Wilson", message: "Can we schedule our session for tomorrow?", time: "11:45 AM", online: true },
      ].map((chat, index) => (
        <div key={index} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-[#875A7B] rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.name.split(" ").map((n) => n[0]).join("")}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                <p className="text-sm text-gray-600">{chat.message}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">{chat.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="p-4 md:p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
    <div className="bg-white rounded-lg border p-6">
      <p className="text-gray-600">Profile customization options coming soon...</p>
    </div>
  </div>
);

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState({ token: "", userId: "" });

  useEffect(() => {
    // Check authentication status from localStorage
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        setAuthData({ token, userId: "" });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (token?: string, userId?: string) => {
    setIsAuthenticated(true);
    if (token && userId) {
      setAuthData({ token, userId });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthData({ token: "", userId: "" });
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#875A7B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <Route path="/*" element={<Login onLogin={handleLogin} />} />
      ) : (
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<MainDashboard />} />
          <Route path="swap" element={<SwapPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      )}
    </Routes>
  );
};

export default Index;
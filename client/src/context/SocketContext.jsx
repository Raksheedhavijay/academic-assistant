import React, { createContext, useEffect, useState, useContext } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulated real-time socket updates for seamless demo experience
    if (user) {
      const initialAlert = {
        _id: 'notif-1',
        title: '🎯 Welcome to Academic Assistant AI Agent',
        message: 'Your personal AI-driven dashboard is live. Explore your schedule and study planner!',
        type: 'System',
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications([initialAlert]);
      setUnreadCount(1);
    }
  }, [user]);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

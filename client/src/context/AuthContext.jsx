import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState('citizen'); // 'citizen' | 'admin'
  const [currentUser, setCurrentUser] = useState({
    id: 'usr_1',
    name: 'Elena Rostova',
    email: 'elena@civic.org',
    role: 'citizen',
    points: 380,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    badges: ['First Responder', 'Pothole Patrol', 'Community Hero'],
    reportsFiled: 4
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg, triggerConfetti = false) => {
    setToastMessage(msg);
    if (triggerConfetti) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const toggleRole = () => {
    if (role === 'citizen') {
      setRole('admin');
      showNotification('🔑 Switched to City Admin Command Mode');
    } else {
      setRole('citizen');
      showNotification('👤 Switched to Citizen Mode');
    }
  };

  const addPoints = (amount, reason) => {
    setCurrentUser(prev => ({
      ...prev,
      points: prev.points + amount
    }));
    showNotification(`⭐ +${amount} Points Earned! ${reason}`, true);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        currentUser,
        setCurrentUser,
        addPoints,
        showNotification,
        toastMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

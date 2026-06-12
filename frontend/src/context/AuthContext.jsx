import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('autolink_user');
    const token = localStorage.getItem('autolink_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const connexion = async (email, mot_de_passe) => {
    const { data } = await api.post('/auth/connexion', { email, mot_de_passe });
    localStorage.setItem('autolink_token', data.token);
    localStorage.setItem('autolink_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const inscription = async (formData) => {
    const { data } = await api.post('/auth/inscription', formData);
    localStorage.setItem('autolink_token', data.token);
    localStorage.setItem('autolink_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const deconnexion = () => {
    localStorage.removeItem('autolink_token');
    localStorage.removeItem('autolink_user');
    setUser(null);
  };

  const isRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, connexion, inscription, deconnexion, isRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sprinto_user')) || null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('sprinto_user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('sprinto_user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (providerName) => {
    setLoading(true);
    try {
      const provider = googleProvider;
      const result = await signInWithPopup(auth, provider);
      const userResult = result.user;

      const socialData = {
        name: userResult.displayName,
        email: userResult.email,
        avatar: userResult.photoURL,
        provider: providerName,
        providerId: userResult.uid
      };

      const { data } = await api.post('/auth/social', socialData);
      localStorage.setItem('sprinto_user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || err.message || `${providerName} login failed` };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sprinto_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

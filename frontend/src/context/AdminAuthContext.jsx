import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Ctx = createContext(null);
export const useAdminAuth = () => useContext(Ctx);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  });
  const interceptorRef = useRef(null);

  const clearAuth = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Auto-logout when any admin API call returns 401
    interceptorRef.current = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401 && err.config?.url?.includes('/api/admin')) {
          clearAuth();
          window.location.href = '/admin/login';
        }
        return Promise.reject(err);
      }
    );

    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.response.eject(interceptorRef.current);
      }
    };
  }, []);

  const login = async (email, password) => {
    const r = await axios.post('/api/admin/login', { email, password });
    const { token, admin: adminData } = r.data;
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(adminData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(adminData);
  };

  const logout = () => {
    clearAuth();
  };

  return <Ctx.Provider value={{ admin, login, logout }}>{children}</Ctx.Provider>;
}

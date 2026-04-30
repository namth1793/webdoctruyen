import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const Ctx = createContext(null);
export const useAdminAuth = () => useContext(Ctx);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  });

  // Restore Authorization header on page load if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token && !axios.defaults.headers.common['Authorization']) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
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
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return <Ctx.Provider value={{ admin, login, logout }}>{children}</Ctx.Provider>;
}

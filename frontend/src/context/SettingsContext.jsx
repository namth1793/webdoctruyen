import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const SettingsContext = createContext({});

const DEFAULTS = {
  site_name: 'Truyện Huba',
  logo_url: '',
  site_description: 'Nền tảng đọc truyện online với kho nội dung phong phú, trải nghiệm mượt mà – đọc là cuốn, xem là mê.',
  hero_bg_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  footer_copyright: '© 2025 Truyện Huba. All rights reserved.',
  social_facebook: '',
  social_youtube: '',
  social_telegram: '',
  social_email: '',
  affiliate_step: '2',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  const refreshSettings = useCallback(() => {
    axios.get('/api/settings').then(r => {
      setSettings(prev => ({ ...prev, ...r.data }));
    }).catch(() => {});
  }, []);

  useEffect(() => { refreshSettings(); }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

import { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

const defaultProfile = {
  name: '',
  email: '',
  role: '',
  phone: '',
  avatar: null,
};

const defaultSettings = {
  theme: 'light',
  notifications: true,
};

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_profile')) || defaultProfile; }
    catch { return defaultProfile; }
  });

  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf_settings')) || defaultSettings; }
    catch { return defaultSettings; }
  });

  const updateProfile = (data) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem('sf_profile', JSON.stringify(updated));
  };

  const updateSettings = (data) => {
    const updated = { ...settings, ...data };
    setSettings(updated);
    localStorage.setItem('sf_settings', JSON.stringify(updated));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, settings, updateSettings }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

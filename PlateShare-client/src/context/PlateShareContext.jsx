import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { PlateShareContext } from './PlateShareContextValue';

export function PlateShareProvider({ children }) {
  const [foods, setFoods] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalFoods: 0,
    servings: 0,
    neighborhoods: 0,
    requests: 0,
  });
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() =>
    JSON.parse(localStorage.getItem('plateshare.theme') || '"light"'),
  );
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(() =>
    Boolean(localStorage.getItem('plateshare.token')),
  );
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('plateshare.theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api('/foods?sort=quantity&limit=100'),
      api('/foods?sort=newest&limit=6'),
    ])
      .then(([foodData, recentData]) => {
        if (!active) return;
        setFoods(foodData.items);
        setRecentFoods(recentData.items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRecentLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    api('/stats')
      .then(setStats)
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    api('/categories')
      .then((data) => setCategories(data.items))
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('plateshare.token');
    if (!token) return;

    let active = true;
    api('/auth/me')
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('plateshare.token');
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const clearExpiredSession = () => {
      localStorage.removeItem('plateshare.token');
      setUser(null);
      setRequests([]);
    };
    window.addEventListener('plateshare:auth-expired', clearExpiredSession);
    return () =>
      window.removeEventListener(
        'plateshare:auth-expired',
        clearExpiredSession,
      );
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api('/requests/mine')
      .then((data) => {
        if (active) setRequests(data.items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const login = async (credentials) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    localStorage.setItem('plateshare.token', data.token);
    setUser(data.user);
    setError('');
    return data.user;
  };

  const googleLogin = async (credential) => {
    const data = await api('/auth/google', {
      method: 'POST',
      body: { credential },
    });
    localStorage.setItem('plateshare.token', data.token);
    setUser(data.user);
    setError('');
    return data.user;
  };

  const register = async (details) => {
    const data = await api('/auth/register', { method: 'POST', body: details });
    localStorage.setItem('plateshare.token', data.token);
    setUser(data.user);
    setError('');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('plateshare.token');
    setUser(null);
    setRequests([]);
  };

  const updateProfile = async (details) => {
    const data = await api('/auth/profile', { method: 'PATCH', body: details });
    setUser(data.user);
    return data.user;
  };

  const updatePassword = (details) =>
    api('/auth/password', { method: 'PATCH', body: details });

  const refreshFoods = async () => {
    const data = await api('/foods?sort=quantity&limit=100');
    setFoods(data.items);
    return data.items;
  };

  const refreshStats = async () => {
    const data = await api('/stats');
    setStats(data);
  };

  const addCategory = async (name) => {
    const data = await api('/categories', { method: 'POST', body: { name } });
    setCategories((current) =>
      [...current, data.item].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return data.item;
  };

  const deleteCategory = async (id) => {
    await api(`/categories/${id}`, { method: 'DELETE' });
    setCategories((current) =>
      current.filter((category) => category._id !== id),
    );
  };

  const refreshMyFoods = useCallback(async () => {
    const data = await api('/foods/mine');
    setFoods((current) => {
      if (user?.role === 'admin') return data.items;
      const others = current.filter((food) => food.ownerId !== user?._id);
      return [...data.items, ...others];
    });
    return data.items;
  }, [user?._id, user?.role]);

  const addFood = async (food) => {
    const data = await api('/foods', { method: 'POST', body: food });
    setFoods((current) => [data.item, ...current]);
    refreshStats().catch(() => {});
    return data.item;
  };

  const updateFood = async (id, updates) => {
    const data = await api(`/foods/${id}`, { method: 'PATCH', body: updates });
    setFoods((current) =>
      current.map((food) => (food._id === id ? data.item : food)),
    );
    return data.item;
  };

  const deleteFood = async (id) => {
    await api(`/foods/${id}`, { method: 'DELETE' });
    setFoods((current) => current.filter((food) => food._id !== id));
    setRequests((current) =>
      current.filter((request) => request.foodId !== id),
    );
    refreshStats().catch(() => {});
  };

  const addRequest = async (food, details = {}) => {
    const data = await api(`/foods/${food._id}/requests`, {
      method: 'POST',
      body: details,
    });
    setRequests((current) => [data.item, ...current]);
    refreshStats().catch(() => {});
    return data.item;
  };

  const updateRequest = async (id, status) => {
    const data = await api(`/requests/${id}`, {
      method: 'PATCH',
      body: { status },
    });
    setRequests((current) =>
      current.map((request) => (request._id === id ? data.item : request)),
    );
    return data.item;
  };

  const value = {
    foods,
    recentFoods,
    categories,
    requests,
    stats,
    user,
    setUser,
    theme,
    setTheme,
    loading,
    recentLoading,
    authLoading,
    error,
    setError,
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    updatePassword,
    refreshFoods,
    refreshMyFoods,
    addFood,
    updateFood,
    deleteFood,
    addRequest,
    updateRequest,
    addCategory,
    deleteCategory,
  };

  return (
    <PlateShareContext.Provider value={value}>
      {children}
    </PlateShareContext.Provider>
  );
}

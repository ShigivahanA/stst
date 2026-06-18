import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
        }
      } catch (err) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();

    const handleLogoutEvent = () => {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.data.accessToken);
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sessionStorage.setItem(`login_time_${res.data.data.user._id}`, timeStr);

      setUser(res.data.data.user);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', credentials);
      
      if (res.data.data?.twoFactorRequired) {
        return res.data.data;
      }

      localStorage.setItem('token', res.data.data.accessToken);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sessionStorage.setItem(`login_time_${res.data.data.user._id}`, timeStr);

      setUser(res.data.data.user);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/google-login', { idToken });
      
      localStorage.setItem('token', res.data.data.accessToken);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sessionStorage.setItem(`login_time_${res.data.data.user._id}`, timeStr);

      setUser(res.data.data.user);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (userId, otp) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/verify2fa', { userId, otp });
      localStorage.setItem('token', res.data.data.accessToken);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sessionStorage.setItem(`login_time_${res.data.data.user._id}`, timeStr);

      setUser(res.data.data.user);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      if (user) {
        sessionStorage.removeItem(`login_time_${user._id}`);
      }
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await api.post('/auth/forgotpassword', { email });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const res = await api.put(`/auth/resetpassword/${token}`, { password });
      localStorage.setItem('token', res.data.data.accessToken);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sessionStorage.setItem(`login_time_${res.data.data.user._id}`, timeStr);

      setUser(res.data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      setLoading(true);
      const res = await api.put('/users/onboarding', onboardingData);
      setUser(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Onboarding failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const res = await api.put('/users/updatedetails', profileData);
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyAadharOTP = async (aadharNumber) => {
    try {
      setLoading(true);
      const res = await api.post('/users/aadhar/send-otp', { aadharNumber });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmAadharVerification = async (aadharNumber, otp) => {
    try {
      setLoading(true);
      const res = await api.post('/users/aadhar/verify', { aadharNumber, otp });
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (base64Image) => {
    try {
      setLoading(true);
      const res = await api.put('/users/avatar', { avatar: base64Image });
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      setLoading(true);
      const res = await api.delete('/users/avatar');
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (listingId) => {
    try {
      const res = await api.post(`/users/wishlist/${listingId}`);
      setUser(prev => ({ ...prev, wishlist: res.data.data }));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update wishlist');
      throw err;
    }
  };

  const updateConsents = async (consentData) => {
    try {
      setLoading(true);
      const res = await api.put('/users/consents', consentData);
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Consent update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      user, setUser, loading, error, signup, login, googleLogin, verify2FA, logout, 
      forgotPassword, resetPassword, completeOnboarding, 
      clearError, updateProfile, verifyAadharOTP, 
      confirmAadharVerification, uploadAvatar, deleteAvatar,
      toggleWishlist, updateConsents
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

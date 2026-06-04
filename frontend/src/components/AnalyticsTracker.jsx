import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AnalyticsTracker() {
   const location = useLocation();
   const { user } = useAuth();

   // Initialize session once on mount or when user changes
   useEffect(() => {
      if (user && user.role === 'admin') return;

      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
         sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
         sessionStorage.setItem('analytics_session_id', sessionId);
      }

      // Check if session has been initialized in this sessionStorage lifecycle
      const isInitialized = sessionStorage.getItem('analytics_session_initialized');
      if (!isInitialized) {
         const searchParams = new URLSearchParams(window.location.search);
         const utmSource = searchParams.get('utm_source') || '';
         const utmMedium = searchParams.get('utm_medium') || '';
         const utmCampaign = searchParams.get('utm_campaign') || '';
         const referrer = document.referrer || 'direct';
         const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

         api.post('/analytics/session', {
            sessionId,
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
            deviceType
         })
         .then(() => {
            sessionStorage.setItem('analytics_session_initialized', 'true');
         })
         .catch((err) => {
            console.error('Failed to initialize analytics session:', err);
         });
      } else if (user) {
         // If already initialized but user logs in, send an update event to bind user to session
         api.post('/analytics/session', {
            sessionId,
            deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
         }).catch(err => console.error('Failed to update session for user:', err));
      }
   }, [user]);

   // Track page views and heartbeat intervals on path change
   useEffect(() => {
      if (user && user.role === 'admin') return;

      const sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) return;

      const path = location.pathname;

      // Log page view immediately by sending a 1-second heartbeat
      api.post('/analytics/heartbeat', {
         sessionId,
         path,
         durationSeconds: 1
      }).catch(err => console.error('Failed to log page view heartbeat:', err));

      // Start interval to send heartbeat every 10 seconds
      const interval = setInterval(() => {
         api.post('/analytics/heartbeat', {
            sessionId,
            path,
            durationSeconds: 10
         }).catch(err => console.error('Failed to log interval heartbeat:', err));
      }, 10000);

      return () => {
         clearInterval(interval);
      };
   }, [location.pathname, user]);

   return null;
}

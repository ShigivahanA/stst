import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'error', duration = 5000) => {
    // Prevent duplicate toasts with the same message
    setToasts((prev) => {
      if (prev.find(t => t.message === message)) return prev;

      const id = Math.random().toString(36).substr(2, 9);

      if (duration) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return [...prev, { id, message, type }];
    });
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              className="pointer-events-auto"
            >
              <div className={`relative overflow-hidden bg-artisan-dark border-l-4 p-6 shadow-2xl flex items-start gap-4 ${toast.type === 'error' ? 'border-artisan-grey' :
                  toast.type === 'success' ? 'border-artisan-light/20' : 'border-artisan-grey'
                }`}>
                {/* Brutalist Background elements */}
                <div className="absolute top-0 right-0 p-1 opacity-5 text-[4rem] font-display font-black select-none pointer-events-none leading-none">
                  {toast.type === 'error' ? 'ERR' : 'OK'}
                </div>

                <div className="shrink-0 mt-1">
                  {toast.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-artisan-grey" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-artisan-light/40" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.3em]">
                    {toast.type === 'error' ? 'Error' : 'Success'}
                  </p>
                  <p className="text-xs font-display font-bold text-artisan-light uppercase tracking-widest leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                {/* Animated progress bar at bottom */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-artisan-light/10 origin-left"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

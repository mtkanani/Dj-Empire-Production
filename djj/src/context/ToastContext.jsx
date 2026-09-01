import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/common/Toast.jsx';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, duration);
  }, []);

  const hideToast = useCallback(() => {
    setToast({ message: '', type: 'info' });
  }, []);

  const success = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, info }}>
      {children}
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log(msg),
      hideToast: () => {},
      success: (msg) => alert(msg),
      error: (msg) => alert(msg),
      info: (msg) => console.log(msg),
    };
  }
  return context;
};

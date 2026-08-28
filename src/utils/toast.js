import toast from 'react-hot-toast';

/**
 * Enterprise Toast Notification Helper
 * Provides standardized success, error, warning, info, and promise toasts
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      id: typeof message === 'string' ? message : undefined,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      id: typeof message === 'string' ? message : undefined,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toast(message, {
      icon: '⚠️',
      style: {
        background: '#1e1b4b',
        color: '#fef08a',
        border: '1px solid #eab308',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#0f172a',
        color: '#93c5fd',
        border: '1px solid #3b82f6',
      },
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, options);
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, messages, options);
  },
};

export default notify;

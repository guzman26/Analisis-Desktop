import React, { useEffect, useState } from 'react';
import './Notification.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div
      className={`notification notification--${type} ${!isVisible ? 'notification--hidden' : ''}`}
    >
      <div className="notification__icon">{getIcon()}</div>
      <div className="notification__message">{message}</div>
      <button
        className="notification__close"
        onClick={handleClose}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

// Hook for managing notifications
export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

// Context for global notification state
interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (
    message: string,
    type: NotificationType,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined);

let notificationId = 0;

// Provider Component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (
    message: string,
    type: NotificationType,
    duration?: number
  ) => {
    const id = `notification-${notificationId++}`;
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Container Component
export const NotificationContainer: React.FC = () => {
  const context = React.useContext(NotificationContext);

  if (!context) {
    return null;
  }

  const { notifications, removeNotification } = context;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }

  const { addNotification } = context;

  const showSuccess = (message: string, duration?: number) => {
    addNotification(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    addNotification(message, 'error', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    addNotification(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    addNotification(message, 'info', duration);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

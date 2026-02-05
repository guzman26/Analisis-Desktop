import { toast } from 'sonner';

/**
 * Adapter hook that wraps Sonner toast with the existing Notification API
 * Maintains 100% compatibility with previous NotificationContext implementation
 *
 * Usage:
 * ```typescript
 * const { showSuccess, showError, showWarning, showInfo } = useNotifications();
 *
 * showSuccess('Operation completed successfully');
 * showError('Failed to save data', 5000); // Custom duration
 * ```
 */
export const useNotifications = () => {
  return {
    showSuccess: (message: string, duration?: number) => {
      toast.success(message, {
        duration: duration || 4000,
      });
    },

    showError: (message: string, duration?: number) => {
      toast.error(message, {
        duration: duration || 5000,
      });
    },

    showWarning: (message: string, duration?: number) => {
      toast.warning(message, {
        duration: duration || 4000,
      });
    },

    showInfo: (message: string, duration?: number) => {
      toast.info(message, {
        duration: duration || 4000,
      });
    },
  };
};

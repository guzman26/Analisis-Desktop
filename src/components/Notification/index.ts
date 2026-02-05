// Export the new Sonner-based adapter hook
export { useNotifications } from './useNotifications';

// Keep type exports for backwards compatibility (if needed)
export type {
  NotificationType,
  NotificationProps,
  NotificationItem,
} from './Notification';

// NotificationProvider, NotificationContainer, and Notification component
// are deprecated - consumers should use Sonner Toaster instead


import { toast } from "sonner";

// Re-export the toast function from sonner
export { toast };

// Export a dummy useToast function for compatibility
export const useToast = () => {
  return {
    toast,
    // Add other necessary properties that might be expected
    dismiss: (toastId?: string) => {},
    toasts: []
  };
};

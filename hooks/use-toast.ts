import { useCallback, useEffect } from "react";
import { toast } from "@/lib/toast-manager";

interface UseToastOptions {
  clearOnRouteChange?: boolean;
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function useToast(options?: UseToastOptions) {
  // Clear toasts on route change if specified
  useEffect(() => {
    if (options?.clearOnRouteChange) {
      // Clear on component unmount
      return () => {
        toast.clear();
      };
    }
  }, [options?.clearOnRouteChange]);

  const showSuccess = useCallback((message: string, force?: boolean) => {
    toast.success(message, { force });
  }, []);

  const showError = useCallback((message: string, force?: boolean) => {
    toast.error(message, { force });
  }, []);

  const showInfo = useCallback((message: string, force?: boolean) => {
    toast.info(message, { force });
  }, []);

  const showWarning = useCallback((message: string, force?: boolean) => {
    toast.warning(message, { force });
  }, []);

  // Handle API errors with context
  const handleApiError = useCallback(
    (error: ApiError | unknown, fallbackMessage = "Có lỗi xảy ra") => {
      const apiError = error as ApiError;
      if (apiError?.response?.status) {
        toast.apiError(
          apiError.response.status,
          apiError.response.data?.message || "",
          fallbackMessage
        );
      } else if (apiError?.message) {
        toast.error(apiError.message);
      } else {
        toast.error(fallbackMessage);
      }
    },
    []
  );

  // Handle form submission with loading state
  const handleFormSubmit = useCallback(
    async <T = unknown>(
      submitFn: () => Promise<T>,
      options?: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (result: T) => void;
        onError?: (error: unknown) => void;
      }
    ): Promise<T> => {
      try {
        if (options?.loadingMessage) {
          toast.info(options.loadingMessage);
        }

        const result = await submitFn();

        if (options?.successMessage) {
          toast.success(options.successMessage);
        }

        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        console.error("Form submission error:", error);

        if (options?.errorMessage) {
          toast.error(options.errorMessage);
        } else {
          handleApiError(error);
        }

        options?.onError?.(error);
        throw error; // Re-throw for component handling
      }
    },
    [handleApiError]
  );

  // Clear all toasts
  const clearAll = useCallback(() => {
    toast.clear();
  }, []);

  // Get debug stats
  const getStats = useCallback(() => {
    return toast.getStats();
  }, []);

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    handleApiError,
    handleFormSubmit,
    clear: clearAll,
    getStats,
  };
}

// Export for direct import
export { toast } from "@/lib/toast-manager";

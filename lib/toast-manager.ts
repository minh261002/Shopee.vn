import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  timestamp: number;
}

class ToastManager {
  private recentToasts: Map<string, ToastMessage> = new Map();
  private readonly DEBOUNCE_TIME = 2000; // 2 seconds
  private readonly MAX_SAME_TYPE_MESSAGES = 3; // Maximum same type messages

  private generateId(type: ToastType, message: string): string {
    return `${type}-${message.slice(0, 50)}`;
  }

  private shouldShowToast(type: ToastType, message: string): boolean {
    const id = this.generateId(type, message);
    const now = Date.now();

    // Check if same message was shown recently
    const recent = this.recentToasts.get(id);
    if (recent && now - recent.timestamp < this.DEBOUNCE_TIME) {
      return false;
    }

    // Check if too many same type messages
    const sameTypeCount = Array.from(this.recentToasts.values()).filter(
      (t) => t.type === type && now - t.timestamp < this.DEBOUNCE_TIME
    ).length;

    if (sameTypeCount >= this.MAX_SAME_TYPE_MESSAGES) {
      return false;
    }

    return true;
  }

  private addToRecent(type: ToastType, message: string): void {
    const id = this.generateId(type, message);
    this.recentToasts.set(id, {
      id,
      type,
      message,
      timestamp: Date.now(),
    });

    // Clean up old entries
    const now = Date.now();
    for (const [key, value] of this.recentToasts.entries()) {
      if (now - value.timestamp > this.DEBOUNCE_TIME * 2) {
        this.recentToasts.delete(key);
      }
    }
  }

  success(message: string, options?: { force?: boolean }): void {
    if (options?.force || this.shouldShowToast("success", message)) {
      sonnerToast.success(message);
      this.addToRecent("success", message);
    }
  }

  error(message: string, options?: { force?: boolean }): void {
    if (options?.force || this.shouldShowToast("error", message)) {
      sonnerToast.error(message);
      this.addToRecent("error", message);
    }
  }

  info(message: string, options?: { force?: boolean }): void {
    if (options?.force || this.shouldShowToast("info", message)) {
      sonnerToast.info(message);
      this.addToRecent("info", message);
    }
  }

  warning(message: string, options?: { force?: boolean }): void {
    if (options?.force || this.shouldShowToast("warning", message)) {
      sonnerToast.warning(message);
      this.addToRecent("warning", message);
    }
  }

  // Special method for API errors with categorization
  apiError(status: number, message: string, defaultMessage: string): void {
    let finalMessage = message || defaultMessage;

    // Categorize common API errors to avoid redundant messages
    switch (status) {
      case 401:
        finalMessage = "Phiên đăng nhập đã hết hạn";
        break;
      case 403:
        finalMessage = "Bạn không có quyền thực hiện hành động này";
        break;
      case 404:
        finalMessage = "Không tìm thấy dữ liệu";
        break;
      case 429:
        finalMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
        break;
      case 500:
        finalMessage = "Lỗi server nội bộ. Vui lòng thử lại sau.";
        break;
    }

    this.error(finalMessage);
  }

  // Clear all recent toasts (useful for page navigation)
  clear(): void {
    this.recentToasts.clear();
    sonnerToast.dismiss();
  }

  // Get stats for debugging
  getStats() {
    return {
      recentCount: this.recentToasts.size,
      recent: Array.from(this.recentToasts.values()),
    };
  }
}

// Export singleton instance
export const toastManager = new ToastManager();

// Export individual methods for easy use
export const toast = {
  success: (message: string, options?: { force?: boolean }) =>
    toastManager.success(message, options),
  error: (message: string, options?: { force?: boolean }) =>
    toastManager.error(message, options),
  info: (message: string, options?: { force?: boolean }) =>
    toastManager.info(message, options),
  warning: (message: string, options?: { force?: boolean }) =>
    toastManager.warning(message, options),
  apiError: (status: number, message: string, defaultMessage: string) =>
    toastManager.apiError(status, message, defaultMessage),
  clear: () => toastManager.clear(),
  getStats: () => toastManager.getStats(),
};

import { Alert } from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';

export interface BiometricError {
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
}

export class BiometricErrorHandler {
  /**
   * Parse and categorize biometric authentication errors
   */
  static parseError(error: any): BiometricError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const lowerMessage = errorMessage.toLowerCase();

    // User cancellation
    if (lowerMessage.includes('cancel') || lowerMessage.includes('user cancel')) {
      return {
        code: 'USER_CANCELLED',
        message: errorMessage,
        userMessage: 'Xác thực đã bị hủy.',
        recoverable: true,
      };
    }

    // Biometric not available
    if (lowerMessage.includes('not available') || lowerMessage.includes('not supported')) {
      return {
        code: 'NOT_AVAILABLE',
        message: errorMessage,
        userMessage: 'Đăng nhập sinh trắc học không khả dụng trên thiết bị này.',
        recoverable: false,
      };
    }

    // Biometric not enrolled
    if (lowerMessage.includes('not enrolled') || lowerMessage.includes('no biometric')) {
      return {
        code: 'NOT_ENROLLED',
        message: errorMessage,
        userMessage: 'Chưa thiết lập đăng nhập sinh trắc học trên thiết bị này. Vui lòng thiết lập trong cài đặt thiết bị.',
        recoverable: false,
      };
    }

    // Authentication failed
    if (lowerMessage.includes('authentication failed') || lowerMessage.includes('failed')) {
      return {
        code: 'AUTH_FAILED',
        message: errorMessage,
        userMessage: 'Đăng nhập sinh trắc học thất bại. Vui lòng thử lại.',
        recoverable: true,
      };
    }

    // Too many attempts
    if (lowerMessage.includes('too many') || lowerMessage.includes('lockout')) {
      return {
        code: 'LOCKOUT',
        message: errorMessage,
        userMessage: 'Quá nhiều lần thử thất bại. Vui lòng thử lại sau hoặc sử dụng mật khẩu thiết bị.',
        recoverable: false,
      };
    }

    // Hardware error
    if (lowerMessage.includes('hardware') || lowerMessage.includes('sensor')) {
      return {
        code: 'HARDWARE_ERROR',
        message: errorMessage,
        userMessage: 'Cảm biến sinh trắc học không khả dụng. Vui lòng thử lại sau.',
        recoverable: true,
      };
    }

    // System error
    if (lowerMessage.includes('system') || lowerMessage.includes('internal')) {
      return {
        code: 'SYSTEM_ERROR',
        message: errorMessage,
        userMessage: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.',
        recoverable: true,
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: 'Đã xảy ra lỗi không mong muốn trong quá trình xác thực sinh trắc học.',
      recoverable: true,
    };
  }

  /**
   * Show appropriate error dialog based on error type
   */
  static showErrorDialog(
    error: BiometricError,
    biometricType: BIOMETRY_TYPE | null,
    onRetry?: () => void,
    onFallback?: () => void
  ): void {
    const biometricName = this.getBiometricTypeName(biometricType);
    
    let title = 'Lỗi xác thực';
    let message = error.userMessage;

    // Customize title based on error type
    switch (error.code) {
      case 'USER_CANCELLED':
        // Don't show dialog for user cancellation
        return;
      case 'NOT_AVAILABLE':
        title = 'Sinh trắc học không khả dụng';
        break;
      case 'NOT_ENROLLED':
        title = 'Chưa thiết lập sinh trắc học';
        break;
      case 'AUTH_FAILED':
        title = 'Đăng nhập sinh trắc học thất bại';
        break;
      case 'LOCKOUT':
        title = 'Quá nhiều lần thử';
        break;
      case 'HARDWARE_ERROR':
        title = 'Lỗi cảm biến';
        break;
      case 'SYSTEM_ERROR':
        title = 'Lỗi hệ thống';
        break;
    }

    const buttons: any[] = [];

    // Add fallback option if available
    if (onFallback) {
      buttons.push({
        text: 'Dùng mật khẩu',
        onPress: onFallback,
      });
    }

    // Add retry option for recoverable errors
    if (error.recoverable && onRetry) {
      buttons.push({
        text: 'Thử lại',
        onPress: onRetry,
      });
    }

    // Always add OK/Cancel button
    buttons.push({
      text: buttons.length > 0 ? 'Hủy' : 'OK',
      style: 'cancel',
    });

    Alert.alert(title, message, buttons);
  }

  /**
   * Get user-friendly biometric type name (Vietnamese)
   */
  static getBiometricTypeName(biometryType: BIOMETRY_TYPE | null): string {
    // Always return generic Vietnamese term regardless of specific biometric type
    return 'Đăng nhập sinh trắc học';
  }

  /**
   * Show setup instructions for biometric authentication (Vietnamese)
   */
  static showSetupInstructions(biometryType: BIOMETRY_TYPE | null): void {
    const biometricName = this.getBiometricTypeName(biometryType);
    const instructions = 'Để sử dụng đăng nhập sinh trắc học:\n1. Vào Cài đặt thiết bị\n2. Thiết lập sinh trắc học (vân tay/khuôn mặt)\n3. Bật tính năng cho ứng dụng';

    Alert.alert(
      `Thiết lập ${biometricName}`,
      instructions,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Mở cài đặt', onPress: () => {
          // Note: Opening settings programmatically requires additional setup
          // For now, we'll just show the instructions
        }},
      ]
    );
  }

  /**
   * Show success message for biometric operations (Vietnamese)
   */
  static showSuccessMessage(operation: 'enabled' | 'disabled', biometryType: BIOMETRY_TYPE | null): void {
    const biometricName = this.getBiometricTypeName(biometryType);
    const message = operation === 'enabled'
      ? `${biometricName} đã được bật thành công cho tài khoản của bạn.`
      : `${biometricName} đã được tắt cho tài khoản của bạn.`;

    Alert.alert('Thành công', message, [{ text: 'OK' }]);
  }
}

export default BiometricErrorHandler;

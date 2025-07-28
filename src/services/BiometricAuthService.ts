import * as Keychain from 'react-native-keychain';
import { Alert } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

export interface StoredCredentials {
  username: string;
  password: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: Keychain.BIOMETRY_TYPE | null;
  error?: string;
}

class BiometricAuthService {
  private static readonly SERVICE_NAME = 'ReactNativeBiometricsApp';
  private static readonly BIOMETRIC_PROMPT_TITLE = 'Biometric Authentication';
  private static readonly BIOMETRIC_PROMPT_SUBTITLE = 'Use your biometric to authenticate';
  private static readonly BIOMETRIC_PROMPT_DESCRIPTION = 'Place your finger on the sensor or look at the camera to authenticate';
  private static readonly BIOMETRIC_PROMPT_FALLBACK = 'Use Password';
  private static readonly BIOMETRIC_PROMPT_CANCEL = 'Cancel';

  /**
   * Check if biometric authentication is available on the device
   */
  async getBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      
      if (biometryType) {
        return {
          isAvailable: true,
          biometryType,
        };
      } else {
        return {
          isAvailable: false,
          biometryType: null,
          error: 'Biometric authentication is not available on this device',
        };
      }
    } catch (error) {
      return {
        isAvailable: false,
        biometryType: null,
        error: `Error checking biometric capabilities: ${error}`,
      };
    }
  }

  /**
   * Store user credentials securely with biometric protection
   */
  async storeCredentials(username: string, password: string): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.getBiometricCapabilities();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      const options: Keychain.SetOptions = {
        service: BiometricAuthService.SERVICE_NAME,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessGroup: undefined, // Use default access group
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        storage: Keychain.STORAGE_TYPE.AES_GCM,
        authenticationPrompt: {
          title: BiometricAuthService.BIOMETRIC_PROMPT_TITLE,
          subtitle: BiometricAuthService.BIOMETRIC_PROMPT_SUBTITLE,
          description: BiometricAuthService.BIOMETRIC_PROMPT_DESCRIPTION,
          cancel: BiometricAuthService.BIOMETRIC_PROMPT_CANCEL,
        },
      };

      await Keychain.setGenericPassword(username, password, options);
      
      return {
        success: true,
      };
    } catch (error: any) {
      // Handle user cancellation
      if (error.message && error.message.includes('cancel')) {
        return {
          success: false,
          cancelled: true,
          error: 'Authentication was cancelled by user',
        };
      }
      
      return {
        success: false,
        error: `Failed to store credentials: ${error.message || error}`,
      };
    }
  }

  /**
   * Retrieve stored credentials using biometric authentication
   */
  async getStoredCredentials(): Promise<BiometricAuthResult & { credentials?: StoredCredentials }> {
    try {
      const capabilities = await this.getBiometricCapabilities();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      const options: Keychain.GetOptions = {
        service: BiometricAuthService.SERVICE_NAME,
        authenticationPrompt: {
          title: BiometricAuthService.BIOMETRIC_PROMPT_TITLE,
          subtitle: BiometricAuthService.BIOMETRIC_PROMPT_SUBTITLE,
          description: BiometricAuthService.BIOMETRIC_PROMPT_DESCRIPTION,
          cancel: BiometricAuthService.BIOMETRIC_PROMPT_CANCEL,
        },
      };

      const result = await Keychain.getGenericPassword(options);
      
      if (result && typeof result !== 'boolean') {
        return {
          success: true,
          credentials: {
            username: result.username,
            password: result.password,
          },
        };
      } else {
        return {
          success: false,
          error: 'No stored credentials found',
        };
      }
    } catch (error: any) {
      // Handle user cancellation
      if (error.message && error.message.includes('cancel')) {
        return {
          success: false,
          cancelled: true,
          error: 'Authentication was cancelled by user',
        };
      }
      
      return {
        success: false,
        error: `Failed to retrieve credentials: ${error.message || error}`,
      };
    }
  }

  /**
   * Check if credentials are stored
   */
  async hasStoredCredentials(): Promise<boolean> {
    try {
      const result = await Keychain.hasGenericPassword({
        service: BiometricAuthService.SERVICE_NAME,
      });
      return result;
    } catch (error) {
      console.warn('Error checking for stored credentials:', error);
      return false;
    }
  }

  /**
   * Remove stored credentials
   */
  async removeStoredCredentials(): Promise<BiometricAuthResult> {
    try {
      const success = await Keychain.resetGenericPassword({
        service: BiometricAuthService.SERVICE_NAME,
      });
      
      return {
        success,
        error: success ? undefined : 'Failed to remove stored credentials',
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to remove credentials: ${error.message || error}`,
      };
    }
  }

  /**
   * Get a user-friendly description of the available biometric type
   */
  getBiometricTypeDescription(biometryType: Keychain.BIOMETRY_TYPE | null): string {
    switch (biometryType) {
      case Keychain.BIOMETRY_TYPE.TOUCH_ID:
        return 'Touch ID';
      case Keychain.BIOMETRY_TYPE.FACE_ID:
        return 'Face ID';
      case Keychain.BIOMETRY_TYPE.FINGERPRINT:
        return 'Fingerprint';
      case Keychain.BIOMETRY_TYPE.FACE:
        return 'Face Recognition';
      case Keychain.BIOMETRY_TYPE.IRIS:
        return 'Iris Recognition';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Show an alert with biometric authentication error
   */
  showBiometricError(error: string, onRetry?: () => void): void {
    const buttons = onRetry 
      ? [
          { text: 'Cancel', style: 'cancel' as const },
          { text: 'Retry', onPress: onRetry },
        ]
      : [{ text: 'OK' }];

    Alert.alert(
      'Biometric Authentication Error',
      error,
      buttons
    );
  }
}

export default new BiometricAuthService();

import { useState, useEffect, useCallback } from 'react';
import BiometricAuthService, { 
  BiometricAuthResult, 
  StoredCredentials, 
  BiometricCapabilities 
} from '../services/BiometricAuthService';
import { BIOMETRY_TYPE } from 'react-native-keychain';

export interface UseBiometricAuthReturn {
  // Capabilities
  isAvailable: boolean;
  biometryType: BIOMETRY_TYPE | null;
  biometricTypeDescription: string;
  isLoading: boolean;
  
  // State
  hasStoredCredentials: boolean;
  
  // Actions
  checkCapabilities: () => Promise<void>;
  storeCredentials: (username: string, password: string) => Promise<BiometricAuthResult>;
  authenticateWithBiometrics: () => Promise<BiometricAuthResult & { credentials?: StoredCredentials }>;
  removeStoredCredentials: () => Promise<BiometricAuthResult>;
  checkStoredCredentials: () => Promise<void>;
  
  // Error handling
  showError: (error: string | any, biometryType?: BIOMETRY_TYPE | null, onRetry?: () => void, onFallback?: () => void) => void;
}

export const useBiometricAuth = (): UseBiometricAuthReturn => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometryType, setBiometryType] = useState<BIOMETRY_TYPE | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasStoredCredentials, setHasStoredCredentials] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  /**
   * Check biometric capabilities of the device
   */
  const checkCapabilities = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous calls

    setIsLoading(true);
    try {
      const capabilities: BiometricCapabilities = await BiometricAuthService.getBiometricCapabilities();
      setIsAvailable(capabilities.isAvailable);
      setBiometryType(capabilities.biometryType);
    } catch (error) {
      console.warn('Error checking biometric capabilities:', error);
      setIsAvailable(false);
      setBiometryType(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  /**
   * Check if credentials are stored
   */
  const checkStoredCredentials = useCallback(async () => {
    try {
      const hasCredentials = await BiometricAuthService.hasStoredCredentials();
      setHasStoredCredentials(hasCredentials);
    } catch (error) {
      console.warn('Error checking stored credentials:', error);
      setHasStoredCredentials(false);
    }
  }, []);

  /**
   * Store user credentials with biometric protection
   */
  const storeCredentials = useCallback(async (
    username: string,
    password: string
  ): Promise<BiometricAuthResult> => {
    if (!isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    try {
      const result = await BiometricAuthService.storeCredentials(username, password);

      if (result.success) {
        // Update stored credentials state directly
        const hasCredentials = await BiometricAuthService.hasStoredCredentials();
        setHasStoredCredentials(hasCredentials);
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to store credentials: ${error.message || error}`,
      };
    }
  }, [isAvailable]);

  /**
   * Authenticate using biometrics and retrieve stored credentials
   */
  const authenticateWithBiometrics = useCallback(async (): Promise<BiometricAuthResult & { credentials?: StoredCredentials }> => {
    if (!isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    if (!hasStoredCredentials) {
      return {
        success: false,
        error: 'No stored credentials found. Please login with username and password first.',
      };
    }

    try {
      const result = await BiometricAuthService.getStoredCredentials();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Biometric authentication failed: ${error.message || error}`,
      };
    }
  }, [isAvailable, hasStoredCredentials]);

  /**
   * Remove stored credentials
   */
  const removeStoredCredentials = useCallback(async (): Promise<BiometricAuthResult> => {
    try {
      const result = await BiometricAuthService.removeStoredCredentials();

      if (result.success) {
        // Update stored credentials state directly
        setHasStoredCredentials(false);
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to remove credentials: ${error.message || error}`,
      };
    }
  }, []);

  /**
   * Show biometric error alert with enhanced error handling
   */
  const showError = useCallback((error: string | any, biometryTypeOverride?: BIOMETRY_TYPE | null, onRetry?: () => void, onFallback?: () => void) => {
    BiometricAuthService.showBiometricError(error, biometryTypeOverride || biometryType, onRetry, onFallback);
  }, [biometryType]);

  /**
   * Get user-friendly description of biometric type
   */
  const biometricTypeDescription = BiometricAuthService.getBiometricTypeDescription(biometryType);

  // Initialize capabilities and check stored credentials on mount
  useEffect(() => {
    if (isInitialized) return;

    const initialize = async () => {
      setIsLoading(true);
      try {
        // Check capabilities first
        const capabilities: BiometricCapabilities = await BiometricAuthService.getBiometricCapabilities();
        setIsAvailable(capabilities.isAvailable);
        setBiometryType(capabilities.biometryType);

        // Then check stored credentials
        const hasCredentials = await BiometricAuthService.hasStoredCredentials();
        setHasStoredCredentials(hasCredentials);
      } catch (error) {
        console.warn('Error during biometric initialization:', error);
        setIsAvailable(false);
        setBiometryType(null);
        setHasStoredCredentials(false);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initialize();
  }, [isInitialized]);

  return {
    // Capabilities
    isAvailable,
    biometryType,
    biometricTypeDescription,
    isLoading,
    
    // State
    hasStoredCredentials,
    
    // Actions
    checkCapabilities,
    storeCredentials,
    authenticateWithBiometrics,
    removeStoredCredentials,
    checkStoredCredentials,
    
    // Error handling
    showError,
  };
};

export default useBiometricAuth;

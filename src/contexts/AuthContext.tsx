import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { BiometricAuthResult } from '../services/BiometricAuthService';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import UserPreferences from '../utils/UserPreferences';

// Mock user credentials for testing
const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'password123',
};

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Biometric authentication
  biometricLogin: () => Promise<boolean>;
  enableBiometricLogin: (username: string, password: string) => Promise<BiometricAuthResult>;
  disableBiometricLogin: () => Promise<BiometricAuthResult>;
  isBiometricAvailable: boolean;
  biometricType: BIOMETRY_TYPE | null;
  biometricTypeDescription: string;
  hasBiometricCredentials: boolean;
  isBiometricLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize biometric authentication hook
  const {
    isAvailable: isBiometricAvailable,
    biometryType,
    biometricTypeDescription,
    hasStoredCredentials: hasBiometricCredentials,
    isLoading: isBiometricLoading,
    storeCredentials,
    authenticateWithBiometrics,
    removeStoredCredentials,
    checkStoredCredentials,
    showError,
  } = useBiometricAuth();

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check mock credentials
    if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
      const mockUser: User = {
        id: '1',
        username: username,
        email: `${username}@example.com`,
      };
      setUser(mockUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      // Clear user state
      setUser(null);

      // Remove biometric credentials from secure storage
      const biometricRemovalResult = await removeStoredCredentials();
      if (biometricRemovalResult.success) {
        console.log('Biometric credentials removed successfully');
      } else {
        console.warn('Failed to remove biometric credentials:', biometricRemovalResult.error);
      }

      // Clear all user preferences and data
      await UserPreferences.clearAllAppData();

      // Force refresh biometric state to reflect the cleanup
      await checkStoredCredentials();

      console.log('User logout completed with full cleanup');
    } catch (error) {
      console.error('Error during logout cleanup:', error);
      // Still set user to null even if cleanup fails
      setUser(null);
    }
  };

  /**
   * Authenticate using biometric authentication
   */
  const biometricLogin = async (): Promise<boolean> => {
    if (!isBiometricAvailable || !hasBiometricCredentials) {
      return false;
    }

    setIsLoading(true);

    try {
      const result = await authenticateWithBiometrics();

      if (result.success && result.credentials) {
        // Validate the retrieved credentials against mock credentials
        const { username, password } = result.credentials;

        if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
          const mockUser: User = {
            id: '1',
            username: username,
            email: `${username}@example.com`,
          };
          setUser(mockUser);
          setIsLoading(false);
          return true;
        }
      }

      if (result.error && !result.cancelled) {
        // Don't show error for automatic retry, let the UI handle it
        console.log('Biometric authentication failed:', result.error);
      }

      setIsLoading(false);
      return false;
    } catch (error: any) {
      setIsLoading(false);
      showError(`Biometric authentication failed: ${error.message || error}`);
      return false;
    }
  };

  /**
   * Enable biometric authentication by storing credentials
   */
  const enableBiometricLogin = async (username: string, password: string): Promise<BiometricAuthResult> => {
    if (!isBiometricAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    try {
      const result = await storeCredentials(username, password);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to enable biometric login: ${error.message || error}`,
      };
    }
  };

  /**
   * Disable biometric authentication by removing stored credentials
   */
  const disableBiometricLogin = async (): Promise<BiometricAuthResult> => {
    try {
      const result = await removeStoredCredentials();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to disable biometric login: ${error.message || error}`,
      };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,

    // Biometric authentication
    biometricLogin,
    enableBiometricLogin,
    disableBiometricLogin,
    isBiometricAvailable,
    biometricType: biometryType,
    biometricTypeDescription,
    hasBiometricCredentials,
    isBiometricLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

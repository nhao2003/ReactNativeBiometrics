import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  BIOMETRIC_PROMPT_SHOWN: 'biometric_prompt_shown',
  LAST_USERNAME: 'last_username',
  BIOMETRIC_PROMPT_DISMISSED: 'biometric_prompt_dismissed',
};

export class UserPreferences {
  /**
   * Check if biometric prompt has been shown to the user
   */
  static async hasBiometricPromptBeenShown(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.BIOMETRIC_PROMPT_SHOWN);
      return value === 'true';
    } catch (error) {
      console.warn('Error checking biometric prompt status:', error);
      return false;
    }
  }

  /**
   * Mark that biometric prompt has been shown
   */
  static async setBiometricPromptShown(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BIOMETRIC_PROMPT_SHOWN, 'true');
    } catch (error) {
      console.warn('Error setting biometric prompt status:', error);
    }
  }

  /**
   * Check if user has dismissed biometric prompt (chose "Not Now")
   */
  static async hasBiometricPromptBeenDismissed(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.BIOMETRIC_PROMPT_DISMISSED);
      return value === 'true';
    } catch (error) {
      console.warn('Error checking biometric prompt dismissal:', error);
      return false;
    }
  }

  /**
   * Mark that user dismissed biometric prompt
   */
  static async setBiometricPromptDismissed(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BIOMETRIC_PROMPT_DISMISSED, 'true');
    } catch (error) {
      console.warn('Error setting biometric prompt dismissal:', error);
    }
  }

  /**
   * Clear biometric prompt dismissal (when user enables biometric)
   */
  static async clearBiometricPromptDismissed(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.BIOMETRIC_PROMPT_DISMISSED);
    } catch (error) {
      console.warn('Error clearing biometric prompt dismissal:', error);
    }
  }

  /**
   * Save the last used username
   */
  static async saveLastUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_USERNAME, username);
    } catch (error) {
      console.warn('Error saving last username:', error);
    }
  }

  /**
   * Get the last used username
   */
  static async getLastUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_USERNAME);
    } catch (error) {
      console.warn('Error getting last username:', error);
      return null;
    }
  }

  /**
   * Clear the last used username
   */
  static async clearLastUsername(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.LAST_USERNAME);
    } catch (error) {
      console.warn('Error clearing last username:', error);
    }
  }

  /**
   * Clear all user preferences and data
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.BIOMETRIC_PROMPT_SHOWN,
        KEYS.LAST_USERNAME,
        KEYS.BIOMETRIC_PROMPT_DISMISSED,
      ]);
      console.log('All user preferences cleared successfully');
    } catch (error) {
      console.warn('Error clearing user preferences:', error);
    }
  }

  /**
   * Reset all biometric-related preferences (for fresh start)
   */
  static async resetBiometricPreferences(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.BIOMETRIC_PROMPT_SHOWN,
        KEYS.BIOMETRIC_PROMPT_DISMISSED,
      ]);
      console.log('Biometric preferences reset successfully');
    } catch (error) {
      console.warn('Error resetting biometric preferences:', error);
    }
  }

  /**
   * Clear all app data (complete reset)
   */
  static async clearAllAppData(): Promise<void> {
    try {
      // Get all keys and clear everything
      const allKeys = await AsyncStorage.getAllKeys();
      if (allKeys.length > 0) {
        await AsyncStorage.multiRemove(allKeys);
        console.log('All app data cleared successfully');
      }
    } catch (error) {
      console.warn('Error clearing all app data:', error);
    }
  }
}

export default UserPreferences;

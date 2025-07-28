import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen: React.FC = () => {
  const {
    user,
    logout,
    isBiometricAvailable,
    biometricTypeDescription,
    hasBiometricCredentials,
    disableBiometricLogin,
    isBiometricLoading,
  } = useAuth();

  const [isDisablingBiometric, setIsDisablingBiometric] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleSettingPress = (settingName: string) => {
    Alert.alert('Settings', `${settingName} pressed - Feature coming soon!`);
  };

  const handleToggleBiometric = async () => {
    if (hasBiometricCredentials) {
      // Disable biometric authentication
      Alert.alert(
        'Disable Biometric Login',
        `Are you sure you want to disable ${biometricTypeDescription}? You will need to enter your username and password to login.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setIsDisablingBiometric(true);
              try {
                const result = await disableBiometricLogin();
                if (result.success) {
                  Alert.alert(
                    'Success',
                    `${biometricTypeDescription} has been disabled.`,
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert(
                    'Error',
                    result.error || 'Unable to disable biometric login.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                Alert.alert('Error', 'An unexpected error occurred.');
              } finally {
                setIsDisablingBiometric(false);
              }
            }
          },
        ]
      );
    } else {
      // Inform user how to enable biometric authentication
      Alert.alert(
        'Enable Biometric Login',
        `To enable ${biometricTypeDescription}, please login with your username and password. You will be prompted to enable biometric login after successful login.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* User Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Security Section */}
      {isBiometricAvailable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>{biometricTypeDescription}</Text>
              <Text style={styles.settingSubtext}>
                {hasBiometricCredentials
                  ? `Use ${biometricTypeDescription} for fast and secure login`
                  : `Enable ${biometricTypeDescription} for faster login`
                }
              </Text>
            </View>
            <View style={styles.switchContainer}>
              {(isDisablingBiometric || isBiometricLoading) ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Switch
                  value={hasBiometricCredentials}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: '#ddd', true: '#007AFF' }}
                  thumbColor={hasBiometricCredentials ? '#fff' : '#f4f3f4'}
                />
              )}
            </View>
          </View>
        </View>
      )}

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Notifications')}
        >
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Privacy')}
        >
          <Text style={styles.settingText}>Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Security')}
        >
          <Text style={styles.settingText}>Security</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Theme')}
        >
          <Text style={styles.settingText}>Theme</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Help Center')}
        >
          <Text style={styles.settingText}>Help Center</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('Contact Us')}
        >
          <Text style={styles.settingText}>Contact Us</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress('About')}
        >
          <Text style={styles.settingText}>About</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  switchContainer: {
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;

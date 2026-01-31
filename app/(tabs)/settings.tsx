import { useMealPlan } from '@/components/MealPlanContext';
import { Colors } from '@/constants/Colors';
import StorageService from '@/services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setApiKey, setUser, deleteAccount, logout } from '@/store/userSlice';
import { clearAllMeals } from '@/store/mealsSlice';
import { persistor } from '@/store/store';


import { useRouter } from 'expo-router';

const SettingsScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [storageStats, setStorageStats] = useState({
    hasPersonalInfo: false,
    hasMeals: false,
    hasApiKey: false,
    isFirstTime: true,
  });

  const userData = useSelector((state: any) => state.user);
  const meals = useSelector((state: any) => state.meals.meals);

  const dispatch = useDispatch();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (userData.apiKey) {
        setGeminiApiKey(userData.apiKey);
      }

      const stats = await StorageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!geminiApiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key.');
      return;
    }

    try {
      dispatch(setApiKey(geminiApiKey.trim()));
      setShowApiKeyModal(false);
      Alert.alert('Success', 'API key saved successfully!');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  const handleClearApiKey = async () => {
    Alert.alert(
      'Clear API Key',
      'Are you sure you want to clear your Gemini API key? This will disable AI recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              dispatch(setApiKey(''));
              setGeminiApiKey('');
              Alert.alert('Success', 'API key cleared successfully!');
            } catch (error) {
              console.error('Error clearing API key:', error);
              Alert.alert('Error', 'Failed to clear API key.');
            }
          }
        },
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete ALL data including your profile, meals, and secure storage. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Clear Redux State
              dispatch(clearAllMeals());
              dispatch(deleteAccount());

              // 2. Clear Secure Storage (StorageService)
              await StorageService.clearAllData();

              // 3. Clear Redux Persistence (AsyncStorage)
              await persistor.purge();

              // 4. Reset Local State
              setGeminiApiKey('');
              setStorageStats({
                hasPersonalInfo: false,
                hasMeals: false,
                hasApiKey: false,
                isFirstTime: true,
              });

              Alert.alert('Success', 'App has been reset to factory settings.');
              // router.replace('/auth/register'); // Optional: Force redirect
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data completely.');
            }
          }
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            dispatch(logout()); // Sets isAuthenticated = false
          }
        }
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showSwitch = false,
    switchValue = false,
    onSwitchChange = () => { },
    showArrow = true,
    isLast = false
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showArrow?: boolean;
    isLast?: boolean;
  }) => (
    <View>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.surface }]}
        onPress={onPress}
        disabled={!onPress && !showSwitch}
      >
        <View style={[styles.settingIcon, { backgroundColor: colors.surfaceHighlight }]}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.icon }]}>{subtitle}</Text>}
        </View>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={'#fff'}
          />
        ) : showArrow && onPress ? (
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        ) : null}
      </TouchableOpacity>
      {!isLast && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
    </View>
  );

  const SettingsGroup = ({ children }: { children: React.ReactNode }) => (
    <View style={[styles.settingsGroup, { ...colors.glass, ...colors.shadow }]}>
      {children}
    </View>
  );

  const ApiKeyModal = () => (
    <Modal
      visible={showApiKeyModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowApiKeyModal(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowApiKeyModal(false)} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Gemini API Key</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>How to get your API key:</Text>
            <Text style={[styles.modalText, { color: colors.icon }]}>
              1. Go to Google AI Studio (https://makersuite.google.com/app/apikey)
            </Text>
            <Text style={[styles.modalText, { color: colors.icon }]}>
              2. Sign in with your Google account
            </Text>
            <Text style={[styles.modalText, { color: colors.icon }]}>
              3. Click "Create API Key"
            </Text>
            <Text style={[styles.modalText, { color: colors.icon }]}>
              4. Copy the generated key (starts with "AIza") and paste it below.
            </Text>
            <Text style={[styles.modalText, { color: colors.primary, marginTop: 8 }]}>
              Note: The AI features improve the more updated your profile is!
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>API Key</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }
              ]}
              value={geminiApiKey}
              onChangeText={setGeminiApiKey}
              placeholder="Enter your Gemini API key"
              placeholderTextColor={colors.icon}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveApiKey}
          >
            <Text style={styles.saveButtonText}>Save API Key</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        {/* AI Configuration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Configuration</Text>
          <SettingsGroup>
            <SettingItem
              icon="key"
              title="Gemini API Key"
              subtitle={userData.apiKey ? "API key configured" : "Required for AI recommendations"}
              onPress={() => setShowApiKeyModal(true)}
              isLast={!userData.apiKey}
            />
            {userData.apiKey && (
              <SettingItem
                icon="trash-outline"
                title="Clear API Key"
                subtitle="Remove stored API key"
                onPress={handleClearApiKey}
                isLast={true}
              />
            )}
          </SettingsGroup>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          <SettingsGroup>
            <SettingItem
              icon="notifications"
              title="Notifications"
              subtitle="Get reminders for meals"
              showSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
              showArrow={false}
              isLast={true}
            />
          </SettingsGroup>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>
          <SettingsGroup>
            <SettingItem
              icon="person"
              title="Personal Information"
              subtitle={userData.name ? "Edit Profile" : "No profile data"}
              onPress={() => router.push('/profile/edit')}
            />
            <SettingItem
              icon="restaurant"
              title="Meal Data"
              subtitle={`${meals.length} meals saved`}
              onPress={() => router.push('/settings/meals')}
              isLast={true}
            />
          </SettingsGroup>
        </View>

        {/* Redux State Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Redux State (Persisted)</Text>
          <View style={[styles.statsContainer, { ...colors.glass, ...colors.shadow }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Auth Status</Text>
              <Text style={[styles.statValue, { color: userData.isAuthenticated ? colors.success : colors.danger }]}>
                {userData.isAuthenticated ? 'Logged In' : 'Logged Out'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Onboarding</Text>
              <Text style={[styles.statValue, { color: userData.isOnboarded ? colors.success : colors.warning }]}>
                {userData.isOnboarded ? 'Completed' : 'Pending'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Profile Name</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userData.name || 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Total Meals</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {meals.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>API Key</Text>
              <Text style={[styles.statValue, { color: userData.apiKey ? colors.success : colors.danger }]}>
                {userData.apiKey ? 'Present' : 'Missing'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Target Calories</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userData.targetCalories ? `${userData.targetCalories} kcal` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Danger Zone</Text>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.danger + '15' }]}
            onPress={handleClearAllData}
          >
            <View style={styles.dangerButtonContent}>
              <Ionicons name="trash" size={24} color={colors.danger} />
              <View style={styles.dangerButtonText}>
                <Text style={[styles.dangerButtonTitle, { color: colors.danger }]}>Clear All Data</Text>
                <Text style={[styles.dangerButtonSubtitle, { color: colors.danger }]}>
                  Delete all personal info, meals, keys
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.surface }]}
            onPress={handleLogout}
          >
            <View style={styles.dangerButtonContent}>
              <Ionicons name="log-out-outline" size={24} color={colors.primary} />
              <View style={styles.dangerButtonText}>
                <Text style={[styles.dangerButtonTitle, { color: colors.primary }]}>Log Out</Text>
                <Text style={[styles.dangerButtonSubtitle, { color: colors.icon }]}>
                  Sign out of your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Information</Text>
          <SettingsGroup>
            <SettingItem
              icon="information-circle"
              title="Version"
              subtitle="1.0.0"
              showArrow={false}
            />
            <SettingItem
              icon="document-text"
              title="Privacy Policy"
              onPress={() => { }}
            />
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              onPress={() => { }}
              isLast={true}
            />
          </SettingsGroup>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView >

      {/* API Key Modal */}
      < ApiKeyModal />
    </SafeAreaView >
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsGroup: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  separator: {
    height: 1,
    marginLeft: 56,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statsContainer: {
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  localStorageContainer: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  localStorageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  localStorageDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  localStorageItems: {
    gap: 8,
  },
  localStorageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  localStorageItemText: {
    fontSize: 14,
    marginLeft: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  dangerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerButtonText: {
    marginLeft: 12,
  },
  dangerButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButtonSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
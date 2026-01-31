import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassCard } from '@/components/GlassCard';
import { PrimaryButton } from '@/components/PrimaryButton';
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

  /* Nutrition Summary Card */
  const NutritionSummary = () => {
    const { getTotalNutrition, nutritionalData } = useMealPlan();
    const total = getTotalNutrition();

    // Data Status Checks
    const hasPersonalInfo = !!(userData.name && userData.targetCalories);
    const hasMeals = meals && meals.length > 0;
    const hasApiKey = !!geminiApiKey;

    const StatusRow = ({ label, isSaved }: { label: string; isSaved: boolean }) => (
      <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: colors.text }]}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons
            name={isSaved ? "checkmark-circle" : "alert-circle"}
            size={16}
            color={isSaved ? "green" : "red"}
          />
          <Text style={[styles.statValue, { color: isSaved ? "green" : "red" }]}>
            {isSaved ? "Saved" : "Missing"}
          </Text>
        </View>
      </View>
    );

    return (
      <View style={[styles.statsContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="stats-chart" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.sectionTitle, { marginBottom: 0, fontSize: 16 }]}>Data Status</Text>
        </View>
        <StatusRow label="Personal Info" isSaved={hasPersonalInfo} />
        <StatusRow label="All Meals" isSaved={hasMeals} />
        <StatusRow label="Gemini API" isSaved={hasApiKey} />
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        {/* User Profile Section */}
        <TouchableOpacity onPress={() => router.push('/profile/edit')}>
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {userData.name || "Guest User"}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.icon }]}>
                  {userData.email || "No email linked"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Nutrition Overview */}
        <View style={styles.section}>
          <NutritionSummary />
        </View>

        {/* AI Configuration */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Configuration</Text>
        <SettingsGroup>
          <SettingItem
            icon="key"
            title="Gemini API Key"
            subtitle={geminiApiKey ? "••••••••••••••••" : "Not set"}
            onPress={() => setShowApiKeyModal(true)}
            isLast={true}
          />
        </SettingsGroup>

        {/* App Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
        <SettingsGroup>
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage alerts"
            onPress={() => router.push('/profile/notifications')}
            isLast={true}
          />
        </SettingsGroup>

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
              onPress={() => router.push('/profile/privacy')}
            />
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              onPress={() => router.push('/profile/help')}
              isLast={true}
            />
          </SettingsGroup>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView >

      {/* API Key Modal */}
      < ApiKeyModal />
    </ScreenWrapper >
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
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    padding: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
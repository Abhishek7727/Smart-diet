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
import { setApiKey, setUser } from '@/store/userSlice';
import { clearAllMeals } from '@/store/mealsSlice';


const SettingsScreen = () => {
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
  const dispatch = useDispatch();
  const { clearPersonalInfo } = useMealPlan(); // Keeping context usage for now if it wraps logic, but ideally direct dispatch
  // Actually, clearPersonalInfo in context does nothing important now? 
  // Let's use Redux actions directly where possible.

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
      'Clear All localStorage Data',
      'This will permanently delete ALL data stored in your device:\n\n• Personal information\n• Meal data\n• API keys\n• App settings\n\nThis action cannot be undone and will reset the app to its initial state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert(
                'Clearing Data...',
                'Please wait while we clear all localStorage data.',
                [],
                { cancelable: false }
              );

              // Clear all Redux data
              dispatch(clearAllMeals());
              dispatch(setUser({ apiKey: null, name: '', email: '', targetCalories: '', age: '', weight: '', height: '' }));

              setGeminiApiKey('');

              Alert.alert(
                'Data Cleared Successfully!',
                'All localStorage data has been permanently deleted. The app has been reset to its initial state.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error clearing all data:', error);
              Alert.alert(
                'Error',
                'Failed to clear all data. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        },
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
              subtitle={storageStats.hasApiKey ? "API key configured" : "Required for AI recommendations"}
              onPress={() => setShowApiKeyModal(true)}
              isLast={!storageStats.hasApiKey}
            />
            {storageStats.hasApiKey && (
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
              subtitle={userData.name ? "Profile completed" : "No profile data"}
              onPress={() => { }}
            />
            <SettingItem
              icon="restaurant"
              title="Meal Data"
              subtitle={storageStats.hasMeals ? "Meals saved" : "No meal data"}
              onPress={() => { }}
              isLast={true}
            />
          </SettingsGroup>
        </View>

        {/* Storage Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Storage Statistics</Text>
          <View style={[styles.statsContainer, { ...colors.glass, ...colors.shadow }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Personal Info</Text>
              <Text style={[styles.statValue, { color: storageStats.hasPersonalInfo ? colors.success : colors.danger }]}>
                {storageStats.hasPersonalInfo ? 'Saved' : 'Not Set'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Meals</Text>
              <Text style={[styles.statValue, { color: storageStats.hasMeals ? colors.success : colors.danger }]}>
                {storageStats.hasMeals ? 'Saved' : 'None'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>API Key</Text>
              <Text style={[styles.statValue, { color: storageStats.hasApiKey ? colors.success : colors.danger }]}>
                {storageStats.hasApiKey ? 'Configured' : 'Not Set'}
              </Text>
            </View>
          </View>

          {/* localStorage Details */}
          <View style={[styles.localStorageContainer, { ...colors.glass, ...colors.shadow }]}>
            <Text style={[styles.localStorageTitle, { color: colors.text }]}>localStorage Contents</Text>
            <Text style={[styles.localStorageDescription, { color: colors.icon }]}>
              This shows what data is currently stored in your device's localStorage:
            </Text>
            <View style={styles.localStorageItems}>
              <View style={styles.localStorageItem}>
                <Ionicons name="person" size={16} color={colors.primary} />
                <Text style={[styles.localStorageItemText, { color: colors.text }]}>
                  Personal Information: {storageStats.hasPersonalInfo ? '✓' : '✗'}
                </Text>
              </View>
              <View style={styles.localStorageItem}>
                <Ionicons name="restaurant" size={16} color={colors.primary} />
                <Text style={[styles.localStorageItemText, { color: colors.text }]}>
                  Meal Data: {storageStats.hasMeals ? '✓' : '✗'}
                </Text>
              </View>
              <View style={styles.localStorageItem}>
                <Ionicons name="key" size={16} color={colors.primary} />
                <Text style={[styles.localStorageItemText, { color: colors.text }]}>
                  API Keys: {storageStats.hasApiKey ? '✓' : '✗'}
                </Text>
              </View>
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
      </ScrollView>

      {/* API Key Modal */}
      <ApiKeyModal />
    </SafeAreaView>
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
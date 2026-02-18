import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomBottomNav, NAV_ITEMS } from '@/components/CustomBottomNav';

import HomeScreen from './index';
import MealsScreen from './meals';
import ProfileScreen from './profile';
import SettingsScreen from './settings';

export default function TabLayout() {

  const [activeTab, setActiveTab] = useState('home');
  const handleTabPress = (id: string) => {
    setActiveTab(id);
  };
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleTabPress} />;
      case 'meals':
        return <MealsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigate={handleTabPress} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Custom Bottom Navigation */}
      <CustomBottomNav
        items={NAV_ITEMS}
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1e3ec',
  },
  content: {
    flex: 1,
  },
});
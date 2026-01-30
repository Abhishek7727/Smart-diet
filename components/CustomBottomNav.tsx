import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { Colors } from '@/constants/Colors';

export interface NavItem {
  id: string;
  icon: string;
  activeIcon: string;
  label: string;
}

interface CustomBottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabPress: (id: string) => void;
  // Deprecated/Unused props removed/ignored for new branding
}

export const CustomBottomNav: React.FC<CustomBottomNavProps> = ({
  items,
  activeTab,
  onTabPress,
}) => {
  // We use fixed neon colors for the new theme
  const activeColor = Colors.dark.primary;
  const inactiveColor = Colors.dark.icon;

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabRow}>
          {items.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.navItem}
                onPress={() => onTabPress(item.id)}
                activeOpacity={0.7}
              >
                <Animated.View style={[
                  styles.iconContainer,
                  isActive && {
                    backgroundColor: 'rgba(212, 255, 0, 0.15)', // Neon Lime low opacity
                    shadowColor: activeColor,
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                  }
                ]}>
                  <Ionicons
                    name={isActive ? item.activeIcon as any : item.icon as any}
                    size={24}
                    color={isActive ? activeColor : inactiveColor}
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  blurContainer: {
    width: '100%',
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 20, 0.75)', // Slight dark tint for glass
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Home',
  },
  {
    id: 'meals',
    icon: 'restaurant-outline',
    activeIcon: 'restaurant',
    label: 'Meals',
  },
  {
    id: 'profile',
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profile',
  },
  {
    id: 'settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
    label: 'Settings',
  },
]; 
import { useMealPlan } from '@/components/MealPlanContext';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Share, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ThemedBackground } from '@/components/ThemedBackground';
import { GlassCard } from '@/components/GlassCard';

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { getTotalNutrition, nutritionalData } = useMealPlan();
  const totalNutrition = getTotalNutrition();
  const userData = useSelector((state: any) => state.user);
  const router = useRouter();

  const handleAction = async (action: string) => {
    switch (action) {
      case 'Edit Profile':
        router.push('/profile/edit');
        break;
      case 'Notifications':
        router.push('/profile/notifications');
        break;
      case 'Help & Support':
        router.push('/profile/help');
        break;
      case 'Share Progress':
        try {
          await Share.share({
            message: `Check out my progress on Smart Diet! I've burned ${totalNutrition.calories} calories today!`,
          });
        } catch (error) {
          Alert.alert('Error', 'Could not share content');
        }
        break;
    }
  };


  const ProfileCard = ({
    icon,
    color,
    title,
    value,
    subtitle
  }: {
    icon: string;
    color: string;
    title: string;
    value: string;
    subtitle?: string;
  }) => (
    <GlassCard style={styles.profileCard}>
      <View style={[styles.profileIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <View style={styles.profileContent}>
        <Text style={[styles.profileTitle, { color: colors.icon }]}>{title}</Text>
        <Text style={[styles.profileValue, { color: colors.text }]}>{value}</Text>
        {subtitle && <Text style={[styles.profileSubtitle, { color: colors.tabIconDefault }]}>{subtitle}</Text>}
      </View>
    </GlassCard>
  );

  const AchievementCard = ({
    icon,
    title,
    description,
    achieved
  }: {
    icon: string;
    title: string;
    description: string;
    achieved: boolean;
  }) => (
    <GlassCard style={[
      styles.achievementCard,
      !achieved && { opacity: 0.7, borderWidth: 1, borderColor: colors.border, backgroundColor: 'transparent' }
    ]}>
      <View style={[
        styles.achievementIcon,
        { backgroundColor: achieved ? colors.surfaceHighlight : colors.border }
      ]}>
        <Ionicons name={icon as any} size={20} color={achieved ? colors.primary : colors.icon} />
      </View>
      <View style={styles.achievementContent}>
        <Text style={[
          styles.achievementTitle,
          { color: achieved ? colors.text : colors.icon }
        ]}>
          {title}
        </Text>
        <Text style={[styles.achievementDescription, { color: colors.icon }]}>{description}</Text>
      </View>
    </GlassCard>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surfaceHighlight }]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <GlassCard style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: 'white' }]}>{userData.name?.[0] || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{userData.name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: colors.icon }]}>{userData.email || 'user@example.com'}</Text>
            </View>
          </GlassCard>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <ProfileCard
              icon="flame"
              color={colors.warning}
              title="Total Calories"
              value={`${totalNutrition.calories} kcal`}
              subtitle={`${Math.round((totalNutrition.calories / nutritionalData.calories) * 100)}% of goal`}
            />
            <ProfileCard
              icon="trophy"
              color="#FFD700"
              title="Streak"
              value="7 days"
              subtitle="Current streak"
            />
            <ProfileCard
              icon="checkmark-circle"
              color={colors.success}
              title="Meals Completed"
              value="3/4"
              subtitle="Today's progress"
            />
            <ProfileCard
              icon="trending-up"
              color="#2196F3"
              title="Weekly Average"
              value="85%"
              subtitle="Goal completion"
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <AchievementCard
            icon="star"
            title="First Week"
            description="Complete 7 days of meal planning"
            achieved={true}
          />
          <AchievementCard
            icon="nutrition"
            title="Protein Master"
            description="Meet protein goals for 5 consecutive days"
            achieved={true}
          />
          <AchievementCard
            icon="leaf"
            title="Healthy Eater"
            description="Stay within calorie goals for 10 days"
            achieved={false}
          />
          <AchievementCard
            icon="fitness"
            title="Consistency King"
            description="Plan meals for 30 consecutive days"
            achieved={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {[
              { icon: 'person-outline', label: 'Edit Profile' },
              { icon: 'notifications-outline', label: 'Notifications' },
              { icon: 'help-circle-outline', label: 'Help & Support' },
              { icon: 'share-outline', label: 'Share Progress' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => handleAction(action.label)}
              >
                <GlassCard style={styles.actionButton}>
                  <Ionicons name={action.icon as any} size={20} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.text }]}>{action.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.icon} style={{ marginLeft: 'auto' }} />
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  userSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  profileValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 12,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

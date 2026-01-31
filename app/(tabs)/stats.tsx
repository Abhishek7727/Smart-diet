import { useMealPlan } from '@/components/MealPlanContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { LineChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Stats Screen Component
const StatsScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [selectedView, setSelectedView] = useState('Grid');
  const { nutritionalData, getTotalNutrition } = useMealPlan();
  const userData = useSelector((state: any) => state.user);
  const totalNutrition = getTotalNutrition();

  // Process weight history for the chart
  const weightHistory = userData?.weightHistory || [];

  // Get last 7 entries or all if less than 7
  const recentHistory = weightHistory.slice(-7);

  const chartData = {
    labels: recentHistory.length > 0
      ? recentHistory.map((h: { date: string }) => {
        const d = new Date(h.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      })
      : ['Now'],
    datasets: [
      {
        data: recentHistory.length > 0
          ? recentHistory.map((h: { weight: number }) => h.weight)
          : [userData?.weight ? parseFloat(userData.weight) : 0],
        strokeWidth: 3,
        color: (opacity = 1) => colors.primary,
      },
    ],
    legend: ['Weight (kg)']
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent', // colors.surface,
    backgroundGradientTo: 'transparent', // colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.icon,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const StatCard = ({
    icon,
    color,
    title,
    value,
    target
  }: {
    icon: string;
    color: string;
    title: string;
    value: number;
    target: number;
  }) => (
    <View style={[styles.statCard, { ...colors.glass, ...colors.shadow }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={16} color="white" />
        </View>
        <Ionicons name="expand-outline" size={16} color={colors.icon} />
      </View>
      <Text style={[styles.statTitle, { color: colors.icon }]}>{title}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {value}/{target}{title === 'Calorie' ? ' kcal' : 'g'}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your Stats</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile/edit')}>
            <Ionicons name="pencil" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Update Weight Shortcut */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceHighlight,
              padding: 16,
              borderRadius: 16,
              gap: 12
            }}
            onPress={() => router.push('/profile/edit')}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="scale-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Update Weight</Text>
              <Text style={{ fontSize: 13, color: colors.icon }}>Track your progress</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Smiley Icon */}
        <View style={styles.smileyContainer}>
          <View style={[styles.smileyIcon, { ...colors.glass, ...colors.shadow }]}>
            <Text style={styles.smileyText}>😊</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={StyleSheet.flatten([styles.chart, colors.shadow])}
          />
        </View>

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { ...colors.glass, ...colors.shadow }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'Grid' && { backgroundColor: colors.surfaceHighlight }
            ]}
            onPress={() => setSelectedView('Grid')}
          >
            <Ionicons
              name="grid"
              size={16}
              color={selectedView === 'Grid' ? colors.text : colors.icon}
            />
            <Text style={[
              styles.toggleText,
              selectedView === 'Grid' ? { color: colors.text, fontWeight: '600' } : { color: colors.icon }
            ]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'Compact' && { backgroundColor: colors.surfaceHighlight }
            ]}
            onPress={() => setSelectedView('Compact')}
          >
            <Ionicons
              name="list"
              size={16}
              color={selectedView === 'Compact' ? colors.text : colors.icon}
            />
            <Text style={[
              styles.toggleText,
              selectedView === 'Compact' ? { color: colors.text, fontWeight: '600' } : { color: colors.icon }
            ]}>Compact</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              icon="flame"
              color={colors.warning}
              title="Calorie"
              value={totalNutrition.calories}
              target={nutritionalData.calories}
            />
            <StatCard
              icon="water"
              color="#2196F3"
              title="Protein"
              value={totalNutrition.protein}
              target={nutritionalData.protein}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="leaf"
              color={colors.success}
              title="Carbs"
              value={totalNutrition.carbs}
              target={nutritionalData.carbs}
            />
            <StatCard
              icon="fitness"
              color={colors.danger}
              title="Fat"
              value={totalNutrition.fat}
              target={nutritionalData.fat}
            />
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default StatsScreen;

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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  smileyContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  smileyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyText: {
    fontSize: 24,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
    overflow: 'hidden',
    paddingBottom: 20, // Space for shadow
  },
  chart: {
    borderRadius: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 24,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 6,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
}); 
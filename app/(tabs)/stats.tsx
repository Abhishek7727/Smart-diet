import { useMealPlan } from '@/components/MealPlanContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Stats Screen Component
const StatsScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [selectedView, setSelectedView] = useState('Grid');
  const { nutritionalData, getTotalNutrition } = useMealPlan();
  const totalNutrition = getTotalNutrition();

  const chartData = {
    labels: ['22 Mar', '23 Mar', '24 Mar', '25 Mar', '26 Mar'],
    datasets: [
      {
        data: [72, 64, 58, 98, 80],
        strokeWidth: 3,
        color: (opacity = 1) => colors.primary,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
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
    <View style={[styles.statCard, { backgroundColor: colors.surface, ...colors.shadow }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your Stats</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="person-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Smiley Icon */}
        <View style={styles.smileyContainer}>
          <View style={[styles.smileyIcon, { backgroundColor: colors.surface, ...colors.shadow }]}>
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
            style={[styles.chart, colors.shadow]}
          />
        </View>

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.surface, ...colors.shadow }]}>
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
    </SafeAreaView>
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
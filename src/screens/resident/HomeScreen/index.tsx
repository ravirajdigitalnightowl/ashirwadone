import React, { useRef, useEffect, useCallback, useContext, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Animated, StatusBar, ActivityIndicator, RefreshControl, StyleSheet, Platform, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStyles } from './styles'; 
import { ThemeContext } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/colors';

// Real Hook Import
import { useMyTickets } from '../../../hooks/useResident';

// ==========================================
// RESIDENT HOME SCREEN & COMPLAINT CARD
// ==========================================

interface ComplaintCardProps {
  item: any; 
  index: number;
  theme: ThemeColors;
  styles: any;
  onPress: () => void; 
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ComplaintCard: React.FC<ComplaintCardProps> = React.memo(({ item, index, theme, styles, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 6, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, translateY, index]);

  const statusColor = 
    item.status === 'Pending' ? theme.status.pending : 
    item.status === 'Resolved' ? theme.status.resolved : 
    theme.status.inProgress;

  const getIcon = (category: string) => {
    if (category?.toLowerCase().includes('plumb')) return 'pipe-leak';
    if (category?.toLowerCase().includes('elect')) return 'lightning-bolt';
    return 'tools';
  };

  return (
    <AnimatedTouchable 
      activeOpacity={0.8} 
      onPress={onPress} 
      style={[styles.card, { opacity: fadeAnim, transform: [{ translateY }] }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryContainer}>
          <MaterialCommunityIcons name={getIcon(item.category)} size={14} color={theme.primary} />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.footerRow}>
        <MaterialCommunityIcons name="calendar-clock" size={14} color={theme.iconMuted} />
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </AnimatedTouchable>
  );
});

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 🔥 UPDATE: Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Today');
  const [isMonthView, setIsMonthView] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // React Query Hook (Infinite Query)
  const { 
    data, 
    isLoading, 
    refetch, 
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMyTickets(
    statusFilter, 
    isMonthView ? undefined : dateFilter, 
    isMonthView ? dateFilter : undefined, 
    selectedYear
  );

  // 🔥 FIX: Extracting data correctly for Infinite Query
  const tickets = data?.pages?.flatMap(page => page?.data?.tickets || []) || [];

  const handleFabPressIn = () => Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  
  const handleFabPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    navigation.navigate('CreateComplaint');
  };

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <ComplaintCard 
        item={item} 
        index={index} 
        theme={theme} 
        styles={styles} 
        onPress={() => navigation.navigate('ComplaintDetail', { ticketId: item._id })} 
      />
    ),
    [theme, styles, navigation]
  );

  // Arrays for filters
  const standardDateFilters = ['Today', 'This Week', 'This Month', 'By Month'];
  const monthFilters = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>My Complaints</Text>
          <Text style={styles.subtitle}>Track and manage your society issues</Text>
        </View>
      </View>

      {/* Date Filter (Primary - Inline Expand Logic) */}
      <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
          
          {isMonthView ? (
            <>
              {/* Back Button to exit Month View */}
              <TouchableOpacity 
                style={{
                  width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surface, 
                  justifyContent: 'center', alignItems: 'center', marginRight: 10, 
                  borderWidth: 1, borderColor: theme.border
                }} 
                onPress={() => setIsMonthView(false)}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color={theme.textMain} />
              </TouchableOpacity>

              {/* Year Selector */}
              <TouchableOpacity onPress={() => setSelectedYear(String(Number(selectedYear) - 1))} style={{ marginRight: 10 }}>
                <MaterialCommunityIcons name="chevron-left" size={20} color={theme.textMain} />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: '800', color: theme.primary, marginRight: 10 }}>{selectedYear}</Text>
              <TouchableOpacity onPress={() => setSelectedYear(String(Number(selectedYear) + 1))} style={{ marginRight: 10 }}>
                <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMain} />
              </TouchableOpacity>

              {/* Months List */}
              {monthFilters.map((month) => (
                <TouchableOpacity 
                  key={month}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10,
                    backgroundColor: dateFilter === month ? theme.primary + '20' : 'transparent', 
                    borderWidth: 1, borderColor: dateFilter === month ? theme.primary : theme.border
                  }}
                  onPress={() => setDateFilter(month)}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: dateFilter === month ? theme.primary : theme.textMuted }}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              {/* Standard Filters List */}
              {standardDateFilters.map((range) => (
                <TouchableOpacity 
                  key={range}
                  style={{
                    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10,
                    backgroundColor: (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) ? theme.primary + '20' : 'transparent', 
                    borderWidth: 1, borderColor: (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) ? theme.primary : theme.border
                  }}
                  onPress={() => { 
                    if (range === 'By Month') {
                      setIsMonthView(true);
                      setDateFilter(monthFilters[new Date().getMonth()]); // Default to current month
                    } else {
                      setDateFilter(range);
                    }
                  }}
                >
                  <Text style={{ 
                    fontSize: 12, 
                    fontWeight: '700', 
                    color: (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) ? theme.primary : theme.textMuted 
                  }}>
                    {range === 'By Month' && monthFilters.includes(dateFilter) ? dateFilter : range}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Status Filter (Secondary) */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Pending', 'In-Progress', 'Resolved'].map((status) => (
            <TouchableOpacity 
              key={status}
              style={{
                paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginRight: 8,
                backgroundColor: statusFilter === status ? theme.primary : theme.surface,
                borderWidth: 1, borderColor: statusFilter === status ? theme.primary : theme.border
              }}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: statusFilter === status ? '#FFF' : theme.textMuted }}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 🔥 UPDATE: FlatList with Infinite Scroll */}
      {isLoading && !isRefetching ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No complaints found.</Text>}
          // Infinite Scroll Props
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}

      <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPressIn={handleFabPressIn} 
          onPressOut={handleFabPressOut} 
          style={styles.fabTouchArea} 
        >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;
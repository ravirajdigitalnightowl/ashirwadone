import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// Real Hook Import
import { useWorkerTasks } from '../../hooks/useWorker';

const WorkerHistoryScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // 🔥 UPDATE: Default dateFilter 'Today' set kiya aur isMonthView state add ki
  const [dateFilter, setDateFilter] = useState('Today');
  const [isMonthView, setIsMonthView] = useState(false);

  // 🔥 UPDATE: Pagination hata diya gaya hai
  const { data, isLoading, refetch, isRefetching } = useWorkerTasks('Resolved', dateFilter);
  
  // Sirf resolved tasks filter karein
  const historyTasks = (data?.data?.tasks || []).filter((t: any) => t.status === 'Resolved');

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.historyCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('WorkerTaskDetails', { ticketId: item._id })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="check-circle" size={24} color={theme.status.resolved} />
        </View>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>#{item._id.slice(-6).toUpperCase()} • Flat {item.createdBy?.flatNo || 'N/A'}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>
        {new Date(item.updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </Text>
    </TouchableOpacity>
  );

  // Arrays for filters
  const standardDateFilters = ['Today', 'This Week', 'This Month', 'By Month'];
  const monthFilters = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completed Jobs</Text>
        <Text style={styles.headerSub}>Your past performance</Text>
      </View>

      {/* 🔥 UPDATE: Date Filter (Inline Expand Logic) */}
      <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, backgroundColor: theme.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
          
          {isMonthView ? (
            <>
              {/* Back Button to exit Month View */}
              <TouchableOpacity 
                style={styles.backIconBtn} 
                onPress={() => setIsMonthView(false)}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color={theme.textMain} />
              </TouchableOpacity>

              {/* Months List */}
              {monthFilters.map((month) => (
                <TouchableOpacity 
                  key={month}
                  style={[
                    styles.timeChip, 
                    dateFilter === month && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                  ]}
                  onPress={() => setDateFilter(month)}
                >
                  <Text style={[styles.timeChipText, dateFilter === month && { color: theme.primary }]}>{month}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              {/* Standard Filters List */}
              {standardDateFilters.map((range) => (
                <TouchableOpacity 
                  key={range}
                  style={[
                    styles.timeChip, 
                    (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) 
                      && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                  ]}
                  onPress={() => { 
                    if (range === 'By Month') {
                      setIsMonthView(true);
                    } else {
                      setDateFilter(range);
                    }
                  }}
                >
                  <Text style={[
                    styles.timeChipText, 
                    (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) 
                      && { color: theme.primary }
                  ]}>
                    {range === 'By Month' && monthFilters.includes(dateFilter) ? dateFilter : range}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {isLoading && !isRefetching ? (
         <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={historyTasks}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No completed jobs yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.textMain },
  headerSub: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  listContainer: { padding: 20, paddingBottom: 40 },
  historyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 16, fontWeight: '700', color: theme.textMain },
  subtitle: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  dateText: { fontSize: 12, fontWeight: '600', color: theme.textMuted },
  
  // Naye filter chip styles
  timeChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  timeChipText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  
  // Back Icon
  backIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: theme.border },
});

export default WorkerHistoryScreen;
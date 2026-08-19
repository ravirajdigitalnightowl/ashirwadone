import React, { useCallback, useContext, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

import { useAllTickets } from '../../hooks/useAdmin';

const AdminComplaintsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  // 🔥 UPDATE: Default dateFilter ab 'Today' set kar diya gaya hai
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In-Progress' | 'Resolved'>('All');
  const [dateFilter, setDateFilter] = useState('Today');
  
  // Inline Chip toggle ke liye state
  const [isMonthView, setIsMonthView] = useState(false);

  // React Query Hook (Stats aur Pagination hata diya hai)
  const { data: ticketsData, isLoading: loadingTickets, refetch, isRefetching } = useAllTickets(statusFilter, dateFilter);

  const allTickets = ticketsData?.data?.tickets || [];

  const renderTicket = useCallback(({ item }: any) => {
    const statusColor = item.status === 'Pending' ? theme.status.pending : item.status === 'Resolved' ? theme.status.resolved : theme.status.inProgress;
    
    const tower = item.createdBy?.tower ? `Tower ${item.createdBy.tower}, ` : '';
    const flatNo = item.createdBy?.flatNo || 'N/A';
    const address = `${tower}Flat ${flatNo}`;

    return (
      <TouchableOpacity 
        style={styles.ticketCard} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id })}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketId} numberOfLines={1} ellipsizeMode="tail">
            #{item._id.slice(-6).toUpperCase()} • {address}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <View style={styles.ticketFooter}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.iconMuted} />
          <Text style={styles.ticketTime}>
            {new Date(item.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [theme, navigation]);

  // Arrays for filters
  const standardDateFilters = ['Today', 'This Week', 'This Month', 'By Month'];
  const monthFilters = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      <View style={styles.header}>
        <View>
          {/* 🔥 UPDATE: Title aur subtitle ko Complaints context ke hisaab se change kiya */}
          <Text style={styles.greeting}>Complaints</Text>
          <Text style={styles.subtitle}>Manage all society requests here</Text>
        </View>
      </View>

      {/* Date Filter (Primary - Inline Expand Logic) IS ON TOP */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
          
          {isMonthView ? (
            <>
              {/* Back Button to exit Month View */}
              <TouchableOpacity 
                style={styles.backIconBtn} 
                onPress={() => setIsMonthView(false)}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={theme.textMain} />
              </TouchableOpacity>

              {/* Months List */}
              {monthFilters.map((month) => (
                <TouchableOpacity 
                  key={month}
                  style={[
                    styles.filterTab, 
                    dateFilter === month && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                  ]}
                  onPress={() => setDateFilter(month)}
                >
                  <Text style={[styles.filterText, dateFilter === month && { color: theme.primary }]}>{month}</Text>
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
                    styles.filterTab, 
                    // 'By Month' ko tabhi highlight karein agar current dateFilter kisi specific month ka naam ho
                    (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) 
                      && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                  ]}
                  onPress={() => { 
                    if (range === 'By Month') {
                      setIsMonthView(true); // Switch to Month view
                    } else {
                      setDateFilter(range); // Set Standard filter
                    }
                  }}
                >
                  <Text style={[
                    styles.filterText, 
                    (dateFilter === range || (range === 'By Month' && monthFilters.includes(dateFilter))) 
                      && { color: theme.primary }
                  ]}>
                    {/* Agar specific month selected hai toh button pe wo month dikhaye, nahi toh 'By Month' */}
                    {range === 'By Month' && monthFilters.includes(dateFilter) ? dateFilter : range}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Status Filter (Secondary) IS BELOW */}
      <View style={[styles.filterContainer, { marginBottom: 16 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Pending', 'In-Progress', 'Resolved'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.filterTab, statusFilter === tab && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setStatusFilter(tab as any)}
            >
              <Text style={[styles.filterText, statusFilter === tab && { color: '#FFFFFF' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Data Loading */}
      {loadingTickets && !isRefetching ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={allTickets}
          keyExtractor={item => item._id}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No tickets found.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
  greeting: { fontSize: 28, fontWeight: '800', color: theme.textMain },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4 },

  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12 },
  filterTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.border, marginRight: 8, backgroundColor: theme.surface },
  filterText: { fontSize: 13, fontWeight: '600', color: theme.textMuted },
  
  // Back Icon
  backIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: theme.border },

  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  ticketCard: { backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: theme.shadow, shadowOpacity: 0.05, shadowRadius: 8 },
  
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { flex: 1, fontSize: 14, fontWeight: '700', color: theme.textMuted, marginRight: 12 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  ticketTitle: { fontSize: 18, fontWeight: '700', color: theme.textMain, marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center' },
  ticketTime: { fontSize: 13, color: theme.textMuted, marginLeft: 4, fontWeight: '500' },
});

export default AdminComplaintsScreen;
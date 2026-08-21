import React, { useContext } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

import { useAdminStats, useAllTickets } from '../../hooks/useAdmin';

const AdminDashboardScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { userData } = useContext(AuthContext);

  // 1. Fetch Stats
  const { data: statsRes, isLoading: loadingStats, refetch: refetchStats, isRefetching: isRefetchingStats } = useAdminStats();
  
  // 2. Fetch Latest Tickets (Default 'All' & 'This Month')
  const { data: ticketsRes, isLoading: loadingTickets, refetch: refetchTickets, isRefetching: isRefetchingTickets } = useAllTickets('All', 'This Month');

  // Backend response extraction
  const stats = statsRes?.data || {};

  // 🔥 FIX: useInfiniteQuery ka data sahi tarike se extract kiya gaya hai
  // Saale pages ko flatten karke ek array banaya, phir usme se shuru ke 4 liye
  const allFetchedTickets = ticketsRes?.pages?.flatMap(page => page?.data?.tickets || []) || [];
  const recentComplaints = allFetchedTickets.slice(0, 4);

  const isLoading = loadingStats || loadingTickets;
  const isRefetching = isRefetchingStats || isRefetchingTickets;

  const onRefresh = () => {
    refetchStats();
    refetchTickets();
  };

  const StatCard = ({ title, count, icon, color, bgColor, onPress }: any) => (
    <TouchableOpacity 
      style={styles.statCard} 
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statCount}>{count ?? 0}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Overview</Text>
        <Text style={styles.subtitle}>Welcome back, {userData?.name?.split(' ')[0] || 'Admin'}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {isLoading && !isRefetching ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* 📊 SUMMARY GRID */}
            <Text style={styles.sectionTitle}>Society Metrics</Text>
            <View style={styles.gridContainer}>
              <StatCard 
                title="Total Residents" 
                count={stats.totalResidents} 
                icon="home-group" 
                color={theme.primary} 
                bgColor={theme.primaryLight} 
                onPress={() => navigation.navigate('ResidentsTab')}
              />
              <StatCard 
                title="Active Staff" 
                count={stats.totalWorkers} 
                icon="account-hard-hat" 
                color="#8B5CF6" 
                bgColor="#EDE9FE" 
                onPress={() => navigation.navigate('StaffTab')}
              />
              <StatCard 
                title="Pending Complaints" 
                count={stats.pending} 
                icon="alert-circle-outline" 
                color={theme.status.pending} 
                bgColor={theme.status.pending + '20'} 
                onPress={() => navigation.navigate('ComplaintsTab')}
              />
              <StatCard 
                title="Active Visitors" 
                count={stats.activeVisitors} 
                icon="boom-gate" 
                color={theme.status.resolved} 
                bgColor={theme.status.resolved + '20'} 
                onPress={() => navigation.navigate('AdminVisitorsScreen')}
              />
            </View>

            {/* ⚡ QUICK ACTIONS */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddResidentScreen')}
              >
                <View style={styles.actionIconBox}>
                  <MaterialCommunityIcons name="account-plus-outline" size={24} color={theme.primary} />
                </View>
                <Text style={styles.actionText}>Add Resident</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtn} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddWorkerScreen')}
              >
                <View style={styles.actionIconBox}>
                  <MaterialCommunityIcons name="account-hard-hat" size={24} color={theme.primary} />
                </View>
                <Text style={styles.actionText}>Add Staff</Text>
              </TouchableOpacity>
            </View>

            {/* 🔥 NAYA: LATEST 4 COMPLAINTS SECTION */}
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Complaints</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ComplaintsTab')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recentComplaints.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons name="check-all" size={32} color={theme.status.resolved} />
                <Text style={styles.emptyText}>No recent complaints!</Text>
              </View>
            ) : (
              recentComplaints.map((ticket: any) => {
                const statusColor = ticket.status === 'Pending' ? theme.status.pending : ticket.status === 'Resolved' ? theme.status.resolved : theme.status.inProgress;
                const flatNo = ticket.createdBy?.flatNo || 'N/A';

                return (
                  <TouchableOpacity 
                    key={ticket._id}
                    style={styles.ticketCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket._id })}
                  >
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketTitle} numberOfLines={1}>{ticket.title}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor }]}>
                        <Text style={styles.badgeText}>{ticket.status}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.ticketFooter}>
                      <Text style={styles.ticketAddress}>Flat {flatNo}</Text>
                      <Text style={styles.ticketTime}>
                        {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  greeting: { fontSize: 28, fontWeight: '800', color: theme.textMain },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginTop: 10 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: theme.surface, padding: 20, borderRadius: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: theme.border },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statCount: { fontSize: 28, fontWeight: '900', color: theme.textMain, marginBottom: 4 },
  statTitle: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },

  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { width: '48%', backgroundColor: theme.surface, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border, elevation: 1 },
  actionIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionText: { fontSize: 14, fontWeight: '700', color: theme.textMain },

  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: theme.primary, marginBottom: 16 },
  
  ticketCard: { backgroundColor: theme.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.border, elevation: 1 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketTitle: { fontSize: 16, fontWeight: '700', color: theme.textMain, flex: 1, marginRight: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketAddress: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },
  ticketTime: { fontSize: 12, color: theme.textMuted },
  
  emptyCard: { backgroundColor: theme.surface, padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed' },
  emptyText: { fontSize: 14, color: theme.textMuted, marginTop: 8, fontWeight: '600' }
});

export default AdminDashboardScreen;
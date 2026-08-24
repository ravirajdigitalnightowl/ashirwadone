import React, { useContext, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';

// Real Hook Import
import { useWorkerTasks } from '../../hooks/useWorker';

const WorkerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { userData } = useContext(AuthContext);

  const { data, isLoading, refetch, isRefetching } = useWorkerTasks();
  const allTasks = data?.data?.tasks || [];
  
  // Sirf active tasks filter karein (Resolved hata dein)
  const activeTasks = allTasks.filter((t: any) => t.status !== 'Resolved');

  const renderTicket = useCallback(({ item }: { item: any }) => {
    const statusColor = item.status === 'Pending' ? theme.status.pending : theme.status.inProgress;
    
    // Tower aur FlatNo ko combine karke address banaya gaya hai
    const flatNo = item.createdBy?.flatNo || 'N/A';
    const tower = item.createdBy?.tower ? `${item.createdBy.tower} - ` : '';
    const displayAddress = `${tower}Flat ${flatNo}`;
    
    return (
      <TouchableOpacity 
        style={styles.ticketCard} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('WorkerTaskDetails', { ticketId: item._id })}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.flatBadge}>
            <MaterialCommunityIcons name="home-outline" size={14} color={theme.primary} />
            <Text style={styles.flatText}>{displayAddress}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{item.status === 'Pending' ? 'Assigned' : item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.ticketTitle}>{item.title}</Text>
        
        <View style={styles.ticketFooter}>
          <View style={styles.timeRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={theme.iconMuted} />
            {/* 🔥 UPDATE: Date ke sath time dikhaya gaya hai */}
            <Text style={styles.ticketTime}>
              Assigned on {new Date(item.updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.iconMuted} />
        </View>
      </TouchableOpacity>
    );
  }, [theme, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {userData?.name || 'Staff'}</Text>
          <Text style={styles.subtitle}>You have {activeTasks.length} active tasks today</Text>
        </View>
      </View>

      {isLoading && !isRefetching ? (
         <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={activeTasks}
          keyExtractor={item => item._id}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <MaterialCommunityIcons name="check-all" size={50} color={theme.iconMuted} />
               <Text style={styles.emptyText}>No tasks assigned right now!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  ticketCard: { backgroundColor: theme.surface, padding: 18, borderRadius: 16, marginBottom: 16, elevation: 2, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05, shadowRadius: 8, borderLeftWidth: 4, borderLeftColor: theme.primary },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  flatBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  flatText: { color: theme.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  ticketTitle: { fontSize: 18, fontWeight: '700', color: theme.textMain, marginBottom: 16 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  ticketTime: { fontSize: 13, color: theme.textMuted, marginLeft: 6, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { color: theme.textMuted, fontSize: 16, marginTop: 12, fontWeight: '500' }
});

export default WorkerDashboardScreen;
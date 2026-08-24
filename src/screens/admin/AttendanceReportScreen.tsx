import React, { useState, useContext } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { useAttendanceReport } from '../../hooks/useAdmin';

const AttendanceReportScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const today = new Date();
  const [selectedMonth] = useState(today.toLocaleString('default', { month: 'long' }));
  const [selectedYear] = useState(today.getFullYear().toString());

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useAttendanceReport(undefined, selectedMonth, selectedYear);
  const records = data?.pages?.flatMap(page => page?.data?.attendance || []) || [];

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.name}>{item.workerId?.name || 'Unknown Worker'}</Text>
          {/* 🔥 UPDATE: Designation bhi yahan dikhega */}
          <Text style={styles.dept}>
            {item.workerId?.designation ? `${item.workerId.designation} • ` : ''}{item.workerId?.department || 'N/A'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Present' ? theme.status.resolved + '20' : theme.status.pending + '20' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Present' ? theme.status.resolved : theme.status.pending }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.timeRow}>
        <MaterialCommunityIcons name="login" size={16} color={theme.status.resolved} />
        <Text style={styles.timeText}>In: {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</Text>
        <MaterialCommunityIcons name="logout" size={16} color={theme.status.pending} style={{ marginLeft: 20 }} />
        <Text style={styles.timeText}>Out: {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Report</Text>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterText}>{selectedMonth} {selectedYear}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} /> : null}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No attendance records found.</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain, marginLeft: 16 },
  filterRow: { padding: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, alignItems: 'center' },
  filterText: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: theme.textMain },
  dept: { fontSize: 13, color: theme.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 13, color: theme.textMuted, marginLeft: 4 }
});

export default AttendanceReportScreen;
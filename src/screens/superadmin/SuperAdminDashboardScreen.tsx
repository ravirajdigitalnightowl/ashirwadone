import React, { useContext } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Switch, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext'; // 🔥 Import AuthContext
import { useGetSocieties, useToggleSocietyStatus } from '../../hooks/useSuperAdmin';

const SuperAdminDashboardScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  // 🔥 Logout function nikala
  const { logout } = useContext(AuthContext);

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetSocieties();
  const { mutate: toggleStatus } = useToggleSocietyStatus();

  const societies = data?.pages?.flatMap(page => page?.data?.societies || []) || [];

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="office-building" size={28} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.societyName}>{item.name}</Text>
          <Text style={styles.societyAddress}>{item.city}, {item.state}</Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleStatus(item._id)}
          trackColor={{ false: theme.border, true: theme.status.resolved }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Societies</Text>
        {/* 🔥 NAYA: Logout Button */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={societies}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} /> : null}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateSocietyScreen')}>
        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: theme.textMain },
  // 🔥 NAYA: Logout Button Style
  logoutBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 20 },
  card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  societyName: { fontSize: 18, fontWeight: 'bold', color: theme.textMain },
  societyAddress: { fontSize: 14, color: theme.textMuted, marginTop: 2 },
  fab: { position: 'absolute', bottom: 30, right: 24, backgroundColor: theme.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 }
});

export default SuperAdminDashboardScreen;
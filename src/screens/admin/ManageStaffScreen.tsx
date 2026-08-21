import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Switch, StyleSheet, Platform, ActivityIndicator, RefreshControl, TextInput, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

import { useWorkers, useToggleWorkerStatus, useDepartments } from '../../hooks/useAdmin';

// 🔥 NAYA: Optimistic UI Card Component
// Yeh card apni state khud manage karega taaki Switch smoothly chale bina flicker ke
const WorkerCard = React.memo(({ item, theme, styles, navigation, handleToggle }: any) => {
  const [localIsActive, setLocalIsActive] = useState(item.isActive);

  // Agar server se background mein data update hota hai, toh usko sync kar lega
  useEffect(() => {
    setLocalIsActive(item.isActive);
  }, [item.isActive]);

  const onSwitchToggle = () => {
    const currentStatus = localIsActive;
    setLocalIsActive(!currentStatus); // 🔥 Instant UI Update (No Flicker)
    handleToggle(item._id, currentStatus); // Backend ko original status bhej diya toggle karne ke liye
  };

  return (
    <View style={[styles.workerCard, !localIsActive && styles.inactiveCard]}>
      <View style={[styles.cardLeft, !localIsActive && { opacity: 0.5 }]}>
        <View style={[styles.iconBox, !localIsActive && styles.inactiveIconBox]}>
          <MaterialCommunityIcons 
            name={item.department === 'Security' ? 'shield-account' : 'account-hard-hat'} 
            size={24} 
            color={localIsActive ? theme.primary : theme.textMuted} 
          />
        </View>
        <View style={styles.workerInfo}>
          <Text style={[styles.workerName, !localIsActive && styles.inactiveText]}>{item.name}</Text>
          <Text style={styles.workerDept}>{item.department || 'Staff'} • {item.phone}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Text style={[styles.statusText, { color: localIsActive ? theme.status.resolved : theme.status.pending, marginRight: 8 }]}>
              {localIsActive ? 'Active' : 'Suspended'}
            </Text>

            {localIsActive && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.isOnDuty ? theme.status.resolved : theme.textMuted, marginRight: 4 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: item.isOnDuty ? theme.status.resolved : theme.textMuted, textTransform: 'uppercase' }}>
                  {item.isOnDuty ? 'On Duty' : 'Off Duty'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.actionArea}>
        <TouchableOpacity 
          style={{ padding: 4, marginBottom: 6 }}
          onPress={() => navigation.navigate('EditWorkerScreen', { worker: item })}
        >
            <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
        
        <Switch
          value={localIsActive}
          onValueChange={onSwitchToggle}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.surface}
        />
      </View>
    </View>
  );
});

const ManageStaffScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 🔥 FIX: Extracted Infinite Query properties
  const { 
    data, 
    isLoading, 
    refetch, 
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useWorkers(debouncedSearch, selectedDept);
  
  const { data: deptData } = useDepartments();
  const { mutate: toggleStatus } = useToggleWorkerStatus();

  // 🔥 FIX: Correct way to extract data from useInfiniteQuery
  const workers = data?.pages?.flatMap(page => page?.data?.workers || []) || [];
  const activeDepartments = deptData?.data?.departments?.filter((d: any) => d.isActive) || [];

  // 🔥 FIX: Infinite Scroll Load More handler
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleStatus({ workerId: id, isActive: !currentStatus });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Staff Directory</Text>
          <Text style={styles.headerSub}>Manage society workers</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color={theme.iconMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, phone, email..."
          placeholderTextColor={theme.textMuted}
          value={searchInput}
          onChangeText={setSearchInput}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => setSearchInput('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.iconMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedDept === 'All' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSelectedDept('All')}
          >
            <Text style={[styles.filterChipText, selectedDept === 'All' && { color: '#FFFFFF' }]}>All Staff</Text>
          </TouchableOpacity>
          
          {activeDepartments.map((dept: any) => (
            <TouchableOpacity 
              key={dept._id}
              style={[styles.filterChip, selectedDept === dept.name && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setSelectedDept(dept.name)}
            >
              <Text style={[styles.filterChipText, selectedDept === dept.name && { color: '#FFFFFF' }]}>{dept.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ManageDepartmentsScreen')}
        style={styles.manageDeptBtn}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="office-building-cog-outline" size={24} color={theme.primary} style={{ marginRight: 12 }} />
          <View>
            <Text style={styles.manageDeptTitle}>Manage Departments</Text>
            <Text style={styles.manageDeptSub}>Add or edit staff categories</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={theme.primary} />
      </TouchableOpacity>

      {isLoading && !isRefetching ? (
         <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item._id}
          // 🔥 NAYA: Extracted Component ko render item mein pass kiya
          renderItem={({ item }) => (
            <WorkerCard 
              item={item} 
              theme={theme} 
              styles={styles} 
              navigation={navigation} 
              handleToggle={handleToggle} 
            />
          )}
          // 🔥 FIX: Infinite Scroll Props
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={theme.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No staff members found.</Text>}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddWorkerScreen')}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        <Text style={styles.fabText}>ADD STAFF</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  headerSub: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: theme.textMain },
  filterWrapper: { marginTop: 12, marginBottom: 4 },
  filterScroll: { paddingHorizontal: 20, paddingBottom: 8 },
  filterChip: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  filterChipText: { fontSize: 13, fontWeight: '600', color: theme.textMuted },

  manageDeptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.primaryLight, padding: 16, borderRadius: 12, marginHorizontal: 20, marginTop: 12, marginBottom: 4, borderWidth: 1, borderColor: theme.primary + '30' },
  manageDeptTitle: { fontSize: 16, fontWeight: 'bold', color: theme.primary },
  manageDeptSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },

  listContainer: { padding: 20, paddingBottom: 100 },
  workerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.05, shadowRadius: 8 },
  
  inactiveCard: { backgroundColor: theme.background },
  
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  inactiveIconBox: { backgroundColor: theme.border },
  
  workerInfo: { flex: 1 },
  workerName: { fontSize: 16, fontWeight: '700', color: theme.textMain, marginBottom: 2 },
  inactiveText: { textDecorationLine: 'line-through', color: theme.textMuted },
  workerDept: { fontSize: 13, color: theme.textMuted, marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  actionArea: { alignItems: 'flex-end', justifyContent: 'space-between', height: 60 },

  fab: { position: 'absolute', bottom: 30, right: 24, backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, shadowColor: theme.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  fabText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.5 },
});

export default ManageStaffScreen;
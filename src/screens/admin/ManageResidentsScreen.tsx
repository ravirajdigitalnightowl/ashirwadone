import React, { useContext, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Switch, StyleSheet, Platform, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';

// 🔥 Hooks Import
import { useResidents, useToggleResidentStatus } from '../../hooks/useAdmin';

// 🔥 NAYA: Optimistic UI Card Component for Residents
// Yeh card apni state khud manage karega taaki Switch smoothly chale bina flicker ke
const ResidentCard = React.memo(({ item, theme, styles, navigation, handleToggle }: any) => {
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
          <MaterialCommunityIcons name="home-account" size={24} color={localIsActive ? theme.primary : theme.textMuted} />
        </View>
        <View style={styles.workerInfo}>
          <Text style={[styles.workerName, !localIsActive && styles.inactiveText]}>{item.name}</Text>
          
          {/* 🔥 UPDATE: Floor field bhi add kiya display mein */}
          <Text style={styles.workerDept}>
            {item.tower ? `${item.tower} - ` : ''}{item.floor ? `${item.floor} - ` : ''}Flat {item.flatNo} • {item.phone}
          </Text>
          
          <Text style={[styles.statusText, { color: localIsActive ? theme.status.resolved : theme.status.pending }]}>
            {localIsActive ? 'Active' : 'Suspended'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionArea}>
        <TouchableOpacity 
          style={{ padding: 4, marginBottom: 6 }}
          onPress={() => navigation.navigate('EditResidentScreen', { resident: item })}
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


const ManageResidentsScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // Search States
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce effect (500ms delay to prevent too many API calls)
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
  } = useResidents(debouncedSearch);
  
  const { mutate: toggleStatus } = useToggleResidentStatus();

  // 🔥 FIX: Correct way to extract data from useInfiniteQuery
  const residents = data?.pages?.flatMap(page => page?.data?.residents || []) || [];

  // 🔥 FIX: Infinite Scroll Load More handler
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleStatus({ userId: id, isActive: !currentStatus });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Society Residents</Text>
          <Text style={styles.headerSub}>Manage all registered flats</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color={theme.iconMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, phone, flat, tower..."
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

      {isLoading && !isRefetching ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={residents}
          keyExtractor={(item) => item._id}
          // 🔥 NAYA: Extracted Component ko render item mein pass kiya
          renderItem={({ item }) => (
            <ResidentCard 
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
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 40 }}>No residents found.</Text>}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddResidentScreen')}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        <Text style={styles.fabText}>ADD RESIDENT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Platform.OS === 'ios' ? 20 : 40 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: theme.textMain },
  headerSub: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: theme.textMain },

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
  fabText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.5 },
});

export default ManageResidentsScreen;
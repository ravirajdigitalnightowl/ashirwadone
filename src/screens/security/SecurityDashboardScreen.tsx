
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, 
  Platform, ActivityIndicator, RefreshControl, Modal, Image, ScrollView,
  DeviceEventEmitter, TextInput, Alert 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { useActiveVisitors, useMarkExit, useVerifyPasscode } from '../../hooks/useVisitor';

const SecurityDashboardScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { userData } = useContext(AuthContext);

  // 🔥 UPDATE: Default dateFilter 'Today' set kiya aur isMonthView state add ki (Pagination removed)
  const [timeRange, setTimeRange] = useState('Today');
  const [isMonthView, setIsMonthView] = useState(false);

  // Filtering from backend (Pagination logic removed)
  const { data, isLoading, refetch, isRefetching } = useActiveVisitors(timeRange);
  const { mutate: markExit, isPending: isExiting } = useMarkExit();

  const [activeFilter, setActiveFilter] = useState('Inside');
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const [passcodeModalVisible, setPasscodeModalVisible] = useState(false);
  const [passcode, setPasscode] = useState('');

  const { mutate: verifyPasscode, isPending: isVerifying } = useVerifyPasscode(() => {
    setPasscodeModalVisible(false);
    setPasscode('');
  });

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('REFRESH_VISITORS', () => {
      refetch(); // Page reset removed
    });
    return () => listener.remove();
  }, [refetch]);

  const visitors = data?.data?.visitors || [];

  const filteredVisitors = visitors.filter((v: any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Inside') return v.status === 'Approved' || v.status === 'Entered';
    if (activeFilter === 'Pending') return v.status === 'Pending';
    if (activeFilter === 'Expected') return v.status === 'Expected'; 
    if (activeFilter === 'Exited') return v.status === 'Exited';
    if (activeFilter === 'Denied') return v.status === 'Denied';
    return true;
  });

  const handleExit = (id: string) => {
    markExit(id, {
      onSuccess: () => {
        setModalVisible(false);
      }
    });
  };

  const handleVerifyPasscode = () => {
    if (passcode.length === 6) {
      verifyPasscode(passcode);
    } else {
      Alert.alert('Invalid', 'Passcode must be exactly 6 digits.');
    }
  };

  const openVisitorDetails = (visitor: any) => {
    setSelectedVisitor(visitor);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Expected') return '#F59E0B'; 
    if (status === 'Pending') return theme.status.pending;
    if (status === 'Approved' || status === 'Entered') return theme.status.resolved;
    if (status === 'Denied') return '#EF4444'; 
    return theme.textMuted; 
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${day} ${month} • ${time}`;
  };

  const getDisplayTime = (item: any) => {
    if (item.status === 'Exited' && item.exitTime) {
      return `Exited: ${formatTime(item.exitTime)}`;
    } else if ((item.status === 'Approved' || item.status === 'Entered') && item.entryTime) {
      return `Entered: ${formatTime(item.entryTime)}`;
    } else if (item.status === 'Expected') {
      return `Expected: ${formatTime(item.expectedDate || item.createdAt)}`;
    }
    return formatTime(item.createdAt);
  };

  const renderVisitorCard = ({ item }: any) => (
    <View style={styles.card}> 
      <TouchableOpacity 
        style={styles.cardContent} 
        activeOpacity={0.7} 
        onPress={() => openVisitorDetails(item)}
      >
        <TouchableOpacity 
          style={styles.thumbnailContainer}
          activeOpacity={0.8}
          onPress={() => item.photoUrl && setFullScreenImage(item.photoUrl)}
        >
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.thumbnail} />
          ) : (
            <MaterialCommunityIcons name="account" size={30} color={theme.primary} />
          )}
        </TouchableOpacity>

        <View style={styles.visitorInfo}>
          <Text style={styles.visitorName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.visitorDetails}>
            {item.tower ? `${item.tower} - ` : ''}Flat {item.flatNo}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialCommunityIcons 
              name={item.visitorType === 'Delivery' ? 'bike' : item.visitorType === 'Cab' ? 'car' : 'account-clock'} 
              size={14} color={theme.textMuted} 
            />
            <Text style={styles.typeText}>{item.visitorType}</Text>
          </View>
        </View>

        <View style={styles.actionArea}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status === 'Approved' ? 'Inside' : item.status}</Text>
          </View>
          <Text style={styles.timeText}>{getDisplayTime(item)}</Text>
        </View>
      </TouchableOpacity>

      {(item.status === 'Approved' || item.status === 'Entered') && (
        <TouchableOpacity 
          style={styles.quickExitBtn} 
          onPress={() => handleExit(item._id)}
          disabled={isExiting}
        >
          <MaterialCommunityIcons name="logout-variant" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.quickExitBtnText}>MARK EXIT</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Arrays for filters
  const standardDateFilters = ['Today', 'This Week', 'This Month', 'By Month'];
  const monthFilters = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Gate Dashboard</Text>
          <Text style={styles.subtitle}>{userData?.name || 'Security'} • Active Duty</Text>
        </View>
      </View>

      {/* 🔥 UPDATE: Date Filter (Primary - Inline Expand Logic) IS ON TOP */}
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
                    timeRange === month && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                  ]}
                  onPress={() => setTimeRange(month)}
                >
                  <Text style={[styles.timeChipText, timeRange === month && { color: theme.primary }]}>{month}</Text>
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
                    (timeRange === range || (range === 'By Month' && monthFilters.includes(timeRange))) 
                      && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
                  ]}
                  onPress={() => { 
                    if (range === 'By Month') {
                      setIsMonthView(true);
                    } else {
                      setTimeRange(range);
                    }
                  }}
                >
                  <Text style={[
                    styles.timeChipText,
                    (timeRange === range || (range === 'By Month' && monthFilters.includes(timeRange))) 
                      && { color: theme.primary }
                  ]}>
                    {range === 'By Month' && monthFilters.includes(timeRange) ? timeRange : range}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Status Filter (Secondary) IS BELOW */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['Inside', 'Expected', 'Pending', 'Exited', 'Denied', 'All'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[styles.filterChip, activeFilter === filter && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && { color: '#FFF' }]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 🔥 UPDATE: Data Loading and pagination removed */}
      {isLoading && !isRefetching ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredVisitors}
          keyExtractor={(item) => item._id}
          renderItem={renderVisitorCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={theme.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={50} color={theme.border} />
              <Text style={styles.emptyText}>No visitors found in this category.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => navigation.navigate('AddVisitorScreen')}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        <Text style={styles.fabText}>NEW ENTRY</Text>
      </TouchableOpacity>

      {/* VISITOR DETAILS MODAL */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Visitor Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            {selectedVisitor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalTopSection}>
                  <TouchableOpacity 
                    style={styles.modalPhotoContainer}
                    activeOpacity={0.8}
                    onPress={() => selectedVisitor.photoUrl && setFullScreenImage(selectedVisitor.photoUrl)}
                  >
                    {selectedVisitor.photoUrl ? (
                      <Image source={{ uri: selectedVisitor.photoUrl }} style={styles.modalPhoto} />
                    ) : (
                      <MaterialCommunityIcons name="account" size={50} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.modalName}>{selectedVisitor.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedVisitor.status), alignSelf: 'flex-start', marginTop: 4 }]}>
                      <Text style={styles.statusText}>{selectedVisitor.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Destination</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.tower ? `${selectedVisitor.tower}-` : ''}{selectedVisitor.flatNo}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Visitor Type</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.visitorType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone No.</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Vehicle No.</Text>
                    <Text style={styles.detailValue}>{selectedVisitor.vehicleNo || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.logSection}>
                  <Text style={styles.logTitle}>Entry Logs</Text>
                  <View style={styles.logRow}>
                    <MaterialCommunityIcons name="login" size={18} color={theme.textMuted} />
                    <Text style={styles.logText}>Created: {formatTime(selectedVisitor.createdAt)}</Text>
                  </View>
                  {selectedVisitor.entryTime && (
                    <View style={styles.logRow}>
                      <MaterialCommunityIcons name="door-open" size={18} color={theme.status.resolved} />
                      <Text style={styles.logText}>Entered: {formatTime(selectedVisitor.entryTime)}</Text>
                    </View>
                  )}
                  {selectedVisitor.exitTime && (
                    <View style={styles.logRow}>
                      <MaterialCommunityIcons name="logout" size={18} color={'#EF4444'} />
                      <Text style={styles.logText}>Exited: {formatTime(selectedVisitor.exitTime)}</Text>
                    </View>
                  )}
                </View>

                {(selectedVisitor.status === 'Approved' || selectedVisitor.status === 'Entered') && (
                  <TouchableOpacity 
                    style={styles.modalExitBtn} 
                    onPress={() => handleExit(selectedVisitor._id)}
                    disabled={isExiting}
                  >
                    {isExiting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="logout-variant" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.modalExitBtnText}>MARK EXIT FROM PREMISES</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {selectedVisitor.status === 'Expected' && (
                  <TouchableOpacity 
                    style={[styles.modalExitBtn, { backgroundColor: theme.primary }]} 
                    onPress={() => {
                      setModalVisible(false);
                      setPasscodeModalVisible(true);
                    }}
                  >
                    <MaterialCommunityIcons name="dialpad" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalExitBtnText}>ENTER PASSCODE</Text>
                  </TouchableOpacity>
                )}

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* FULL SCREEN IMAGE MODAL */}
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade" onRequestClose={() => setFullScreenImage(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }} onPress={() => setFullScreenImage(null)}>
            <MaterialCommunityIcons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {fullScreenImage && (
              <Image source={{ uri: fullScreenImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* PASSCODE ENTRY MODAL */}
      <Modal visible={passcodeModalVisible} transparent animationType="fade" onRequestClose={() => { setPasscodeModalVisible(false); setPasscode(''); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 'auto', paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Passcode</Text>
              <TouchableOpacity onPress={() => { setPasscodeModalVisible(false); setPasscode(''); }} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: theme.textMuted, marginBottom: 20 }}>
              Ask the visitor for the 6-digit pre-approved passcode.
            </Text>

            <TextInput
              style={{
                backgroundColor: theme.background,
                borderWidth: 2,
                borderColor: theme.primary,
                borderRadius: 12,
                fontSize: 32,
                fontWeight: '800',
                letterSpacing: 10,
                textAlign: 'center',
                paddingVertical: 15,
                color: theme.textMain,
                marginBottom: 24
              }}
              placeholder="000000"
              placeholderTextColor={theme.border}
              keyboardType="number-pad"
              maxLength={6}
              value={passcode}
              onChangeText={setPasscode}
              autoFocus
            />

            <TouchableOpacity 
              style={{ backgroundColor: theme.primary, padding: 18, borderRadius: 12, alignItems: 'center' }}
              onPress={handleVerifyPasscode}
              disabled={isVerifying || passcode.length !== 6}
            >
              {isVerifying ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }}>VERIFY & ALLOW ENTRY</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  greeting: { fontSize: 26, fontWeight: '800', color: theme.textMain },
  subtitle: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  
  filterWrapper: { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 12 },
  filterChip: { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  filterChipText: { fontSize: 13, fontWeight: '700', color: theme.textMuted },
  
  // 🔥 UPDATE: Naye filter chip aur back icon styles
  timeChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  timeChipText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  backIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: theme.border },

  listContainer: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: theme.surface, borderRadius: 16, marginBottom: 16, elevation: 3, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  cardContent: { flexDirection: 'row', padding: 16 },
  
  thumbnailContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 16 },
  thumbnail: { width: '100%', height: '100%' },
  
  visitorInfo: { flex: 1, justifyContent: 'center' },
  visitorName: { fontSize: 17, fontWeight: '700', color: theme.textMain, marginBottom: 2 },
  visitorDetails: { fontSize: 14, color: theme.textMain, fontWeight: '500' },
  typeText: { color: theme.textMuted, fontSize: 12, fontWeight: '600', marginLeft: 4, textTransform: 'uppercase' },
  
  actionArea: { alignItems: 'flex-end', justifyContent: 'space-between' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  timeText: { fontSize: 10, color: theme.textMuted, fontWeight: '600', marginTop: 8 },
  
  quickExitBtn: { flexDirection: 'row', backgroundColor: '#EF4444', paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  quickExitBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: theme.textMuted, fontSize: 15, marginTop: 12, fontWeight: '500' },

  fab: { position: 'absolute', bottom: 30, right: 24, backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, elevation: 8, shadowColor: theme.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '60%', maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  closeBtn: { padding: 4, backgroundColor: theme.background, borderRadius: 20 },
  
  modalTopSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.border },
  modalPhotoContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  modalPhoto: { width: '100%', height: '100%' },
  modalName: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  detailItem: { width: '48%', backgroundColor: theme.background, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  detailLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 15, color: theme.textMain, fontWeight: '600' },
  
  logSection: { marginBottom: 30, backgroundColor: theme.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  logTitle: { fontSize: 14, fontWeight: '700', color: theme.textMain, marginBottom: 12, textTransform: 'uppercase' },
  logRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logText: { fontSize: 14, color: theme.textMuted, marginLeft: 10, fontWeight: '500' },

  modalExitBtn: { flexDirection: 'row', backgroundColor: '#EF4444', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalExitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
});

export default SecurityDashboardScreen;
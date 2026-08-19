import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image, Modal, Platform, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { useActiveVisitors } from '../../hooks/useVisitor';

const AdminVisitorsScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [timeRange, setTimeRange] = useState('Today');
  const [isMonthView, setIsMonthView] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState('Inside');
  
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useActiveVisitors(timeRange);
  
  const visitors = data?.data?.visitors || [];

  const filteredVisitors = visitors.filter((v: any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Inside') return v.status === 'Approved' || v.status === 'Entered';
    return v.status === activeFilter;
  });

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

  const openVisitorDetails = (visitor: any) => {
    setSelectedVisitor(visitor);
    setModalVisible(true);
  };

  // 🔥 NAYA: Name truncate karne ka logic
  const formatDisplayNames = (nameStr: string) => {
    if (!nameStr) return 'Unknown';
    const nameArr = nameStr.split(',').map(n => n.trim());
    if (nameArr.length > 2) {
      return `${nameArr.slice(0, 2).join(', ')} & ${nameArr.length - 2} more`;
    }
    return nameStr;
  };

  const renderVisitorCard = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
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
        {/* 🔥 FIX: Apply truncation logic aur 2 lines max allow kiya */}
        <Text style={styles.visitorName} numberOfLines={2}>
          {formatDisplayNames(item.name)}
        </Text>
        <Text style={styles.visitorDetails}>
          {item.tower ? `${item.tower} - ` : ''}Flat {item.flatNo} • {item.visitorType}
        </Text>
        <Text style={styles.timeText}>
          {item.status === 'Exited' ? `Exited: ${formatTime(item.exitTime)}` : 
           (item.status === 'Expected' ? `Expected: ${formatTime(item.expectedDate || item.createdAt)}` : 
           `Entered: ${formatTime(item.entryTime || item.updatedAt)}`)}
        </Text>
      </View>

      {/* 🔥 FIX: flexShrink: 0 add kiya taaki badge bahar na push ho */}
      <View style={[styles.statusBadge, { flexShrink: 0, backgroundColor: getStatusColor(item.status) + '15', borderColor: getStatusColor(item.status) }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status === 'Approved' ? 'Inside' : item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const standardDateFilters = ['Today', 'This Week', 'This Month', 'By Month'];
  const monthFilters = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={theme.textMain} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Gate Activity</Text>
          <Text style={styles.headerSub}>Monitor society visitors</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, backgroundColor: theme.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
          
          {isMonthView ? (
            <>
              <TouchableOpacity 
                style={styles.backIconBtn} 
                onPress={() => setIsMonthView(false)}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color={theme.textMain} />
              </TouchableOpacity>

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
              <MaterialCommunityIcons name="boom-gate-outline" size={50} color={theme.border} />
              <Text style={styles.emptyText}>No visitors found in this category.</Text>
            </View>
          }
        />
      )}

      {/* READ-ONLY VISITOR DETAILS MODAL */}
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
                    {/* 🔥 Modal mein pura naam dikhega */}
                    <Text style={styles.modalName}>{selectedVisitor.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedVisitor.status) + '15', borderColor: getStatusColor(selectedVisitor.status), alignSelf: 'flex-start', marginTop: 4 }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedVisitor.status) }]}>{selectedVisitor.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  {selectedVisitor.purpose ? (
                    <View style={[styles.detailItem, { width: '100%' }]}>
                      <Text style={styles.detailLabel}>Purpose of Visit</Text>
                      <Text style={styles.detailValue}>{selectedVisitor.purpose}</Text>
                    </View>
                  ) : null}

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

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Viewer */}
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
    </SafeAreaView>
  );
};

const getStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.textMain },
  headerSub: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  
  timeChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  timeChipText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  backIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: theme.border },

  filterWrapper: { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  filterScroll: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12 },
  filterChip: { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  filterChipText: { fontSize: 13, fontWeight: '700', color: theme.textMuted },

  listContainer: { padding: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: theme.border },
  thumbnailContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 16 },
  thumbnail: { width: '100%', height: '100%' },
  
  visitorInfo: { flex: 1, marginRight: 12 }, // marginRight add kiya taaki badge se chipke nahi
  visitorName: { fontSize: 16, fontWeight: '700', color: theme.textMain, marginBottom: 4 },
  visitorDetails: { fontSize: 13, color: theme.textMain, fontWeight: '500' },
  timeText: { fontSize: 11, color: theme.textMuted, marginTop: 6 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: theme.textMuted, fontSize: 15, marginTop: 12, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%', maxHeight: '90%' },
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
});

export default AdminVisitorsScreen;
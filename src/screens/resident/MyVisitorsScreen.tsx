// // src/screens/resident/MyVisitorsScreen.tsx
import React, { useContext, useState } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, 
  ActivityIndicator, RefreshControl, ScrollView, Modal, Image, Platform,
  Share 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/colors';
import { useMyVisitors } from '../../hooks/useVisitor';

const MyVisitorsScreen = ({ navigation }: any) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  const [timeRange, setTimeRange] = useState('Today');
  const [isMonthView, setIsMonthView] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState('Expected'); 
  
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useMyVisitors(timeRange);
  const visitors = data?.data?.visitors || [];

  const filteredVisitors = visitors.filter((v: any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Inside') return v.status === 'Approved' || v.status === 'Entered';
    if (activeFilter === 'Expected') return v.status === 'Expected';
    return v.status === activeFilter;
  });

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'Expected') return '#F59E0B'; 
    if (status === 'Pending') return theme.status.pending;
    if (status === 'Approved' || status === 'Entered') return theme.status.resolved;
    if (status === 'Denied') return '#EF4444'; 
    return theme.textMuted; 
  };

  const openVisitorDetails = (visitor: any) => {
    setSelectedVisitor(visitor);
    setModalVisible(true);
  };

  const handleShare = async (visitor: any) => {
    try {
      const message = `Hello ${visitor.name},\n\nYour Gate Pass for Ashirwad Society is ready.\n\nPlease show this OTP at the Main Gate for quick entry: *${visitor.passcode}*\n\nWelcome!`;
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.log('Error sharing passcode:', error);
    }
  };

  // 🔥 NAYA: Name truncate karne ka logic taaki UI kharab na ho
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
      activeOpacity={0.7} 
      style={styles.card}
      onPress={() => openVisitorDetails(item)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        {/* 🔥 FIX: Text ko flex: 1 aur numberOfLines diya, taaki badge bahar na jaye */}
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: theme.textMain, marginRight: 12 }} numberOfLines={2}>
          {formatDisplayNames(item.name)}
        </Text>
        {/* 🔥 FIX: Badge ko flexShrink: 0 diya, taaki wo sikude ya hide na ho */}
        <View style={{ flexShrink: 0, backgroundColor: getStatusColor(item.status) + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: getStatusColor(item.status) }}>
          <Text style={{ color: getStatusColor(item.status), fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>{item.status}</Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 4 }}>{item.visitorType} • {item.vehicleNo || 'No Vehicle'}</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>{formatTime(item.updatedAt)}</Text>
        </View>

        {item.status === 'Expected' && item.passcode && (
          <View style={styles.listOtpBox}>
            <View>
              <Text style={{ fontSize: 10, color: theme.primary, fontWeight: 'bold', marginBottom: 2 }}>OTP CODE</Text>
              <Text style={{ fontSize: 18, color: theme.primary, fontWeight: '900', letterSpacing: 2 }}>{item.passcode}</Text>
            </View>
            <TouchableOpacity 
              style={styles.listShareBtn} 
              onPress={() => handleShare(item)}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const standardDateFilters = ['Today', 'This Week', 'This Month', 'By Month'];
  const monthFilters = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Visitors</Text>
        <Text style={styles.headerSub}>Manage your guests & deliveries</Text>
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
          {['Expected', 'Inside', 'Pending', 'Exited', 'Denied'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[styles.statusChip, activeFilter === filter && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.statusChipText, activeFilter === filter && { color: '#FFF' }]}>{filter}</Text>
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
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No visitors found.</Text>}
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8} 
        onPress={() => navigation.navigate('InviteGuestScreen')}
      >
        <MaterialCommunityIcons name="account-plus" size={24} color="#FFF" />
        <Text style={styles.fabText}>INVITE GUEST</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>Visitor Details</Text>
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
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedVisitor.status) }]}>
                      <Text style={styles.statusText}>{selectedVisitor.status}</Text>
                    </View>
                  </View>
                </View>

                {selectedVisitor.status === 'Expected' && selectedVisitor.passcode && (
                  <View style={styles.passcodeHighlightBox}>
                    <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 5 }}>Share this Passcode with your guest</Text>
                    <Text style={{ color: theme.primary, fontSize: 36, fontWeight: '900', letterSpacing: 8, marginBottom: 15 }}>{selectedVisitor.passcode}</Text>
                    
                    <TouchableOpacity 
                      style={styles.shareFullBtn}
                      activeOpacity={0.8}
                      onPress={() => handleShare(selectedVisitor)}
                    >
                      <MaterialCommunityIcons name="share-variant" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.shareFullBtnText}>SHARE PASSCODE</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailsGrid}>
                  {selectedVisitor.purpose ? (
                    <View style={[styles.detailItem, { width: '100%' }]}>
                      <Text style={styles.detailLabel}>Purpose of Visit</Text>
                      <Text style={styles.detailValue}>{selectedVisitor.purpose}</Text>
                    </View>
                  ) : null}

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
                  <Text style={styles.logTitle}>Tracking Logs</Text>
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
  header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 26, fontWeight: '800', color: theme.textMain },
  headerSub: { fontSize: 14, color: theme.textMuted, marginTop: 4 },
  
  timeChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 10, backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
  timeChipText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  backIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: theme.border },

  filterWrapper: { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  filterScroll: { paddingHorizontal: 20, paddingVertical: 12 },
  statusChip: { backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  statusChipText: { fontSize: 13, fontWeight: '700', color: theme.textMuted },
  
  card: { padding: 16, borderRadius: 16, marginBottom: 16, elevation: 2, borderWidth: 1, backgroundColor: theme.surface, borderColor: theme.border },
  emptyText: { textAlign: 'center', color: theme.textMuted, marginTop: 40, fontSize: 15 },

  fab: { position: 'absolute', bottom: 30, right: 24, backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, elevation: 8, shadowColor: theme.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5 },

  listOtpBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primaryLight + '20', paddingLeft: 12, paddingVertical: 6, paddingRight: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.primary, borderStyle: 'dashed' },
  listShareBtn: { backgroundColor: theme.primary, padding: 8, borderRadius: 6, marginLeft: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%', maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitleText: { fontSize: 20, fontWeight: '800', color: theme.textMain },
  closeBtn: { padding: 4, backgroundColor: theme.background, borderRadius: 20 },
  
  modalTopSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.border },
  modalPhotoContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: theme.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  modalPhoto: { width: '100%', height: '100%' },
  modalName: { fontSize: 20, fontWeight: '800', color: theme.textMain, marginBottom: 4 },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

  passcodeHighlightBox: { backgroundColor: theme.primaryLight + '15', padding: 20, borderRadius: 16, borderWidth: 2, borderColor: theme.primaryLight, borderStyle: 'dashed', alignItems: 'center', marginBottom: 24 },
  
  shareFullBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, width: '100%', justifyContent: 'center' },
  shareFullBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  detailItem: { width: '48%', backgroundColor: theme.background, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  detailLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 15, color: theme.textMain, fontWeight: '600' },
  
  logSection: { marginBottom: 30, backgroundColor: theme.background, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  logTitle: { fontSize: 14, fontWeight: '700', color: theme.textMain, marginBottom: 12, textTransform: 'uppercase' },
  logRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logText: { fontSize: 14, color: theme.textMuted, marginLeft: 10, fontWeight: '500' },
});

export default MyVisitorsScreen;